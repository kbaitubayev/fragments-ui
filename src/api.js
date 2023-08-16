// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL;

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments data', { data });
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function postUserFragments(user, document) {
  //Check the content type here
  console.log('This is media type: ', document.querySelector('#content').value);
  if (
    !document.querySelector('#fragment').value.length &&
    !document.querySelector('#file').value.length
  ) {
    document = JSON.stringify(document); //converts value to a JSON string
    return console.log('No fragment entered', document);
  }
  try {
    //console.log('BEFORE FETCH POST FRAGMENT');
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
      // Generate headers with the proper Authorization bearer token to pass
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        // Get the value from content type drop down, and send it to the backend
        'Content-Type': document.querySelector('#content').value,
      },
      body: document.querySelector('#fragment').value,
    });
    //console.log('AFTER FETCH POST FRAGMENT');

    if (document.querySelector('#fragment').value.length) {
      console.log('Entered Fragment: ' + document.querySelector('#fragment').value);
    } else {
      console.log('Uploaded file successfully');
    }

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const jsonData = await res.json();
    console.log('Post user fragments data', jsonData);
  } catch (err) {
    console.error('Unable to call POST /v1/fragment', { err });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPLOAD IMAGE - Reference: https://patrickbrosset.com/articles/2021-10-22-handling-files-on-the-web/
export async function handleFragmentFile(event, user) {
  const input = event.target;
  const files = input.files;

  //console.log("THIS IS INPUT(event.target): ", event.target);
  //console.log("THIS IS FILES(input.files): ", input.files);
  console.log('FILE NAME: ', input.files[0].name);

  if (!files.length) {
    return;
  }
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      let text = e.target.result;
      console.log('THIS IS TEXT(e.target.result): ', e.target.result);
      const res = await fetch(`${apiUrl}/v1/fragments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.idToken}`,
          'Content-Type': file.type,
        },
        body: text,
      });
    };
    //https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer
    //reader.readAsText(file); -> it didn't work
    reader.readAsArrayBuffer(file);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PUT UPDATE
export async function updateFragment(user, document) {
  //Check the content type here
  console.log('This is content: ', document.querySelector('#content').value);
  if (!document.querySelector('#update_fragment').value.length) {
    document = JSON.stringify(document); //converts value to a JSON string
    return console.log('No fragment entered for updating', document);
  }
  try {
    //console.log('BEFORE UPDATE FETCH');
    //console.log('THIS IS FRAGMENT ID TO UPDATE: ', document.querySelector('#update_fragmentId').value);
    const getOwnerId = await getOwnerIdtoUpdate(user, document);
    //console.log('THIS IS OWNER ID: ', getOwnerId);
    const res = await fetch(
      `${apiUrl}/v1/fragments/${document.querySelector('#update_fragmentId').value}`,
      {
        // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
        // Generate headers with the proper Authorization bearer token to pass
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.idToken}`,
          // Get the value from content type drop down, and send it to the backend
          'Content-Type': document.querySelector('#content').value,
          OwnerId: getOwnerId,
        },
        body: JSON.stringify(document.querySelector('#update_fragment').value),
      }
    );
    //console.log('AFTER UPDATE FETCH');

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const jsonData = await res.json();
    console.log('UPDATED user fragments data', jsonData);
  } catch (err) {
    console.error('Unable to call PUT /v1/fragment' + err);
  }
  console.log('Entered new Fragment: ' + document.querySelector('#update_fragment').value);
  //document.querySelector('#fragment').value = '';
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONVERT FRAGMENT MEDIA TYPE
export async function convertFragment(user, document) {
  //POST-> is to make new stuff on the server
  //GET-> Dont make anything new, just convert it and send it back
  console.log(
    'URL',
    `${apiUrl}/v1/fragments/${document.querySelector('#convert_fragmentId').value}.${
      document.querySelector('#convert_option').value
    }`
  );

  if (!document.querySelector('#convert_fragmentId').value.length) {
    document = JSON.stringify(document); //converts value to a JSON string
    return console.log('No fragment entered for converting', document);
  }
  try {
    //Not needed -> JWT
    //const getOwnerId = await getOwnerIdtoConvert(user, document);

    //console.log('THIS IS OWNER ID: ', getOwnerId);

    const res = await fetch(
      `${apiUrl}/v1/fragments/${document.querySelector('#convert_fragmentId').value}.${
        document.querySelector('#convert_option').value
      }`,
      {
        // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
        // Generate headers with the proper Authorization bearer token to past
        method: 'GET', //
        headers: {
          Authorization: `Bearer ${user.idToken}`,
          // Get the value from content type drop down, and send it to the backend
          //'Content-Type': document.querySelector('#convert_option').value, //Not needed in GET
          //OwnerId: getOwnerId, ** Not Needed - we have JWT for that
        },
        //body: JSON.stringify(document.querySelector('#convert_fragment').value),
      }
    );

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    if (
      document.querySelector('#convert_option').value === 'html' ||
      document.querySelector('#convert_option').value === 'md' ||
      document.querySelector('#convert_option').value === 'plain'
    ) {
      //Check for plain: receiving but not displaying somehow
      const text = await res.text();
      console.log(text);
    }

    if (
      document.querySelector('#convert_option').value === 'png' ||
      document.querySelector('#convert_option').value === 'jpeg' ||
      document.querySelector('#convert_option').value === 'gif' ||
      document.querySelector('#convert_option').value === 'webp'
    ) {
      //https://stackoverflow.com/questions/63942715/how-to-download-a-readablestream-on-the-browser-that-has-been-returned-from-fetc
      const blob = await res.blob();
      const newBlob = new Blob([blob]);

      const blobUrl = window.URL.createObjectURL(newBlob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute(
        'download',
        `${document.querySelector('#convert_fragmentId').value}.${
          document.querySelector('#convert_option').value
        }`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    }
  } catch (err) {
    console.error('Unable to call GET /v1/fragment/:id.ext' + err);
  }
  //console.log('Entered new Fragment: ' + document.querySelector('#convert_fragment').value);
  //document.querySelector('#fragment').value = '';
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function displayUserFragments(user, document) {
  // ${apiUrl}/v1/fragments/?expand=1 -> should be expand?
  //console.log(`${apiUrl}/v1/fragments`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    let text = await res.text();
    console.log(res.headers.get('content-type'));
    console.log('Fragment:', text);
  } catch (err) {
    console.error('Unable to get fragments by id', { err });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function displayUserFragmentsExpand(user, document) {
  document.getElementById('p').innerHTML = '';
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    //document.querySelector('#table-body').innerText = data.fragment;

    for (const fragment of data.fragments) {
      let displaySection = document.getElementById('p');

      // let br = document.createElement("br");
      // paragraph.appendChild(br);

      let text = document.createTextNode(
        'ID: ' +
          fragment.id +
          ' Media Type: ' +
          fragment.type +
          ' Size: ' +
          fragment.size +
          ' Updated: ' +
          fragment.updated
      );

      displaySection.appendChild(text);
      let divide = document.createElement('hr');
      divide.setAttribute('width', '550px');
      displaySection.appendChild(divide);
    }

    console.log('Got all fragments data', { data });
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function deleteFragment(user, document) {
  console.log(document.querySelector('#fragmentId').value);
  try {
    const res = await fetch(
      `${apiUrl}/v1/fragments/${document.querySelector('#fragmentId').value}`,
      {
        method: 'DELETE',
        // Generate headers with the proper Authorization bearer token to pass
        headers: user.authorizationHeaders(),
      }
    );
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    //const data = await res.json();
    console.log('Deleted Fragment');
  } catch (err) {
    console.error(err + ' ::::  Unable to call DELETE /v1/fragment/:id');
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function displayUserFragmentMetaInfo(user, document) {
  // document.getElementById("table_body").innerHTML = "";
  try {
    const res = await fetch(
      //Send it to the backend
      `${apiUrl}/v1/fragments/${document.querySelector('#fragmentId').value}/info`,
      {
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    // res gets the resonse from the server and then display
    let text = await res.json();
    console.log('CONTENT TYPE', res.headers.get('content-type'));
    console.log('Fragment:', text);
    //console.log('Fragment.ownerid:', text.fragment.ownerId);

    // let placeholder = document.querySelector('#tableBody');
    // let table = "";
    // for(let data of data) {
    //   table += `
    //     <tr>
    //       <td> ${text.fragment.ownerId}</td>
    //       <td> ${text.fragment.id}</td>
    //       <td> ${text.fragment.type}</td>
    //       <td> ${text.fragment.created}</td>
    //       <td> ${text.fragment.updated}</td>
    //       <td> ${text.fragment.size}</td>
    //   `
    // }
    return text.fragment.ownerId;
  } catch (err) {
    console.error('Unable to get fragments by id', { err });
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function getOwnerIdtoUpdate(user, document) {
  try {
    const res = await fetch(
      //Send it to the backend
      `${apiUrl}/v1/fragments/${document.querySelector('#update_fragmentId').value}/info`,
      {
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    // res gets the resonse from the server and then display
    let text = await res.json();
    console.log(res.headers.get('content-type'));
    console.log('Fragment:', text);
    return text.fragment.ownerId;
  } catch (err) {
    console.error('Unable to get fragments by id', { err });
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function getOwnerIdtoConvert(user, document) {
  try {
    const res = await fetch(
      //Send it to the backend
      `${apiUrl}/v1/fragments/${document.querySelector('#convert_fragmentId').value}/info`,
      {
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    // res gets the resonse from the server and then display
    let text = await res.json();
    console.log(res.headers.get('content-type'));
    console.log('Fragment:', text);
    return text.fragment.ownerId;
  } catch (err) {
    console.error('Unable to get fragments by id', { err });
  }
}
