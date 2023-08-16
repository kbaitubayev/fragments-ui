import { Auth, getUser } from './auth';

import {
  getUserFragments,
  postUserFragments,
  displayUserFragments,
  displayUserFragmentsExpand,
  displayUserFragmentMetaInfo,
  deleteFragment,
  updateFragment,
  handleFragmentFile,
  convertFragment,
} from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const postFragmentBtn = document.querySelector('#post');
  const getFragmentBtn = document.querySelector('#get');
  const getExpandFragmensBtn = document.querySelector('#expand');
  const getMetaInfoFragmenBtn = document.querySelector('#metainfo');
  const deleteBtn = document.querySelector('#delete');
  const updateBtn = document.querySelector('#update');
  const convertBtn = document.querySelector('#convertbtn');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // Get user fragments(Expand)
  getMetaInfoFragmenBtn.onclick = async () => {
    await displayUserFragmentMetaInfo(user, document);
  };

  //Get Metadata Info
  getExpandFragmensBtn.onclick = async () => {
    await displayUserFragmentsExpand(user, document);
  };

  // Get user fragments
  postFragmentBtn.onclick = async () => {
    await postUserFragments(user, document);
  };

  // Upload image - Reference: https://patrickbrosset.com/articles/2021-10-22-handling-files-on-the-web/
  const handleFile = async (event) => {
    await handleFragmentFile(event, user);
  };
  document.querySelector('#file').addEventListener('change', handleFile);

  // Update fragment
  updateBtn.onclick = async () => {
    //console.log('updateBtn is clicked');
    await updateFragment(user, document);
  };

  // convert fragment media type
  convertBtn.onclick = async () => {
    //console.log('convertBtn is clicked');
    await convertFragment(user, document);
  };

  // Display user fragment
  getFragmentBtn.onclick = async () => {
    await displayUserFragments(user, document);
  };

  // Delete fragment
  deleteBtn.onclick = async () => {
    await deleteFragment(user, document);
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
