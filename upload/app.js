const AWS_ENDPOINT = 'https://igkxyyqbvkf3w25mre4m7jw7ga0imiiy.lambda-url.ap-south-1.on.aws/';

const MAX_ALLOWED_UPLOAD_LIMIT = 100 * 1024 * 1024; // 100 MB

const uploadForm = document.querySelector('#file-upload-form');

const loginForm = document.querySelector('#login-form');

const uploadContainer = document.querySelector('#file-upload-container');

const loginContainer = document.querySelector('#login-form-container');

const loaderSpinner = document.querySelector('#loader-spinner');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const totalUploadSize = localStorage.getItem('totalUploadSize') || 0;
  if (parseInt(totalUploadSize) > MAX_ALLOWED_UPLOAD_LIMIT) {
    alert("You have uploaded more than 100 MB of data. You can't log in now.");
    return logout();
  }
  const unsanitizedUsername = event.target.username.value;
  const username = unsanitizedUsername.replace(/[^a-zA-Z]/g, '_'),
    password = event.target.password.value;
  if (username !== unsanitizedUsername) {
    alert(`You entered an invalid character in the username. The username has been changed to ${username}.`);
  }
  if (!username || !password) {
    alert('Username and password are required.');
    return;
  }
  const payload = {
    purpose: 'auth',
    data: {
      username,
      password,
    },
  };
  try {
    const response = await fetch(AWS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response.status >= 400) {
      throw new Error('Failed to login.');
    }
    const responseBody = await response.json();
    if (responseBody.message) {
      throw new Error(responseBody.message);
    }
    if (!responseBody.authToken || !responseBody.nonce) {
      throw new Error('Invalid response.');
    }
    sessionStorage.setItem('authToken', responseBody.authToken);
    sessionStorage.setItem('nonce', responseBody.nonce);
    sessionStorage.setItem('username', username);
    alert('Login successful.');
    openUploadForm();
  } catch (e) {
    console.error(e);
    alert('Invalid username or password.');
    logout();
  } finally {
    event.target.reset();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const authToken = sessionStorage.getItem('authToken');
  const username = sessionStorage.getItem('username');
  const nonce = sessionStorage.getItem('nonce');
  if (!authToken || !username || !nonce) {
    return logout();
  }
  const totalUploadSize = localStorage.getItem('totalUploadSize') || 0;
  if (parseInt(totalUploadSize) > MAX_ALLOWED_UPLOAD_LIMIT) {
    alert('You have uploaded more than 100 MB of data. You will be logged out.');
    return logout();
  }
  openUploadForm();
});

uploadForm.querySelector('input[type="file"]').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert('No file selected.');
    return;
  }
  const allowedMimeTypes = ['audio/mpeg', 'audio/wav'];
  const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
  if (!allowedMimeTypes.includes(file.type)) {
    alert('Invalid file type. Only MP3 and WAV files are allowed.');
    uploadForm.reset();
    return;
  }
  if (file.size > maxSizeInBytes) {
    alert('File size exceeds 10 MB.');
    uploadForm.reset();
    return;
  }
  setDisableUploadButton(false);
});

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const totalUploadSize = localStorage.getItem('totalUploadSize') || 0;
  if (parseInt(totalUploadSize) + event.target['file-upload'].files[0].size > MAX_ALLOWED_UPLOAD_LIMIT) {
    alert('You have uploaded more than 100 MB of data. You will be logged out.');
    return logout();
  }
  setDisableUploadButton(true);
  setShowLoaderSpinner(true);
  const fileUuid = Math.random().toString(36).substring(2);
  const originalFile = event.target['file-upload'].files[0];
  const file = new File([originalFile], `${fileUuid}_${originalFile.name}`, { type: originalFile.type });
  try {
    const payload = {
      purpose: 'upload-url',
      data: {
        authToken: sessionStorage.getItem('authToken'),
        username: sessionStorage.getItem('username'),
        nonce: sessionStorage.getItem('nonce'),
        contentType: file.type,
        fileName: file.name,
      },
    };
    const response = await fetch(AWS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response.status >= 400) {
      throw new Error('Failed to get upload URL.');
    }
    const responseBody = await response.json();
    if (responseBody.message) {
      throw new Error(responseBody.message);
    }
    const uploadUrl = responseBody.url;
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: formData,
    });
    if (uploadResponse.status >= 400) {
      throw new Error('Failed to upload file.');
    }
    const uploadsTillNow = localStorage.getItem('totalUploadSize') || 0;
    localStorage.setItem('totalUploadSize', parseInt(uploadsTillNow) + file.size);
    alert('File uploaded successfully.');
  } catch (error) {
    console.error(error);
    alert('Failed to upload file. Reason: ' + error.message);
  } finally {
    uploadForm.reset();
    setDisableUploadButton(true);
    setShowLoaderSpinner(false);
  }
});

function logout() {
  sessionStorage.clear();
  uploadContainer.classList.add('hidden');
  loginContainer.classList.remove('hidden');
}

function openUploadForm() {
  loginContainer.classList.add('hidden');
  uploadContainer.classList.remove('hidden');
}

function setDisableUploadButton(value) {
  uploadForm.querySelector('button').disabled = value;
}

function setShowLoaderSpinner(value) {
  loaderSpinner.classList.toggle('show', value);
}
