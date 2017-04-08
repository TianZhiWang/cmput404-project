import {URL_PREFIX} from '../constants';


function getUUIDFromId(id) {
  return /author\/([a-zA-Z0-9-]+)\/?$/.exec(id, 'g')[1];
}

/*
* Makes a network request and returns the result if any
* Method: One of 'GET', 'POST', and 'PUT'
* Headers: {} any additional headers, default is only basic auth
* Body: {} expects an object containing the body
* Returns a promise with the response in JSON
*/
function basicAuthFetch(method, path, user, body) {
  const request = {
    method,
    headers: {
      // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
      'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
    }
  };
  if (body) {
    request.headers = Object.assign(request.headers, {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    request.body = JSON.stringify(body);
  }

  return fetch(`${URL_PREFIX}${path}`, request)
    .then(res => {
      if (!res.ok) {
        return Promise.reject(res);
      }
      return res;
    })
    .then(res => {
      return method !== 'DELETE' ? res.json() : res;
    })
    .catch(error => {
      console.error('START ERROR MESSAGE >>>>>>>>>>>>>>');
      console.error('Caught error while performing request');
      console.error('Request: ', request);
      console.error('Error: ', error);
      console.error('<<<<<<<<<<<<<<<<<< END ERROR MESSAGE');
    });
}

function githubFetch(githubName){
  return fetch ("https://api.github.com/users/"+githubName+"/events",{ method:'GET'})
    .then(res => {
      if (!res.ok) {
        return Promise.reject(res);
      }
      return res;
    })
    .then(res => {
      return res;
    })
    .catch(error => {
      console.error('START ERROR MESSAGE >>>>>>>>>>>>>>');
      console.error('Error: ', error);
      console.error('<<<<<<<<<<<<<<<<<< END ERROR MESSAGE');
    });
}

export {
  getUUIDFromId,
  basicAuthFetch,
  githubFetch
};