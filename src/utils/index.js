/*
MIT License

Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, Josh Deng, unyo (http://stackoverflow.com/users/2077884/unyo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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