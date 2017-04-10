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
import * as types from '../types';
import uuidv4 from 'uuid/v4';

import {URL_PREFIX} from '../constants';
import {getUUIDFromId, basicAuthFetch, githubFetch} from '../utils';
/*eslint-enable */
/*
* Adds a comment, to a post specified by postId
*/
export function addComment(comment, postId, postOrigin, user) {
  return function(dispatch) {
    const requestBody = {
      query: 'addComment',
      post: postOrigin,
      comment: {
        comment,
        author: {
          id: user.id,
          displayName: user.displayName,
          host: user.host,
          url: user.url
        },
        published: new Date().toISOString(),
        id: uuidv4(),
        contentType: 'text/plain'
      }
    };

    let postUUID = postId;
    if (/^http/.test(postId)) {
      postUUID = /\/([a-zA-Z0-9-]+)\/?$/.exec(postId, 'g')[1];
    }

    basicAuthFetch('POST', `/posts/${postUUID}/comments/`, user, requestBody)
    .then((res) => {
      dispatch({
        type: types.ADD_COMMENT,
        commentData: requestBody.comment,
        postId: postUUID
      });
    });
  };
}
/*
* Adds a post by a user then returns an action to update the state
*/
export function addPost(post, user) {
  return function(dispatch) {

    const sendPost = function(post) {
      basicAuthFetch('POST', '/posts/', user, {
        title: post.title,
        content: post.content,
        description: post.description,
        contentType: post.contentType,
        author: user.id,
        comments: post.comments,
        visibility: post.permission,
        image: post.image,
        visibleTo: post.user_with_permission
      })
      .then((res) => {
        dispatch({
          type:types.ADD_POST,
          post: res
        });
      });
    };

    if (post.image) {
      const FR= new FileReader();
      FR.addEventListener("load", function(e) {
        post.content = e.target.result;
        post.contentType = `${post.image.type};base64`;
        sendPost(post);
      }); 
      FR.readAsDataURL(post.image);
    } else {
      sendPost(post);
    }
  };
}

/*
* Updates a post by a user then returns an action to update the state
*/
export function updatePost(post, user) {
  return function(dispatch) {

    const sendPost = function(post) {
      basicAuthFetch('PUT', `/posts/${post.id}/`, user, {
        title: post.title,
        content: post.content,
        description: post.description,
        contentType: post.contentType,
        author: user.id,
        comments: post.comments,
        visibility: post.permission,
        image: post.image,
        visibleTo: post.user_with_permission
      })
      .then((res) => {
        dispatch({
          type:types.UPDATE_POST,
          post: res
        });
      });
    };

    if (post.image) {
      const FR= new FileReader();
      FR.addEventListener("load", function(e) {
        post.content = e.target.result;
        post.contentType = `${post.image.type};base64`;
        sendPost(post);
      });
      FR.readAsDataURL(post.image);
    } else {
      sendPost(post);
    }
  };
}

/*
* Loads all posts visible to the current user
*/
export function loadPosts(user) {
  return function(dispatch) {
    return basicAuthFetch('GET', '/author/posts/', user)
      .then(res => {
        dispatch({
          type: types.FINISH_LOADING_POSTS,
          posts: res || []
        });
      });
  };
}

export function login(user) {
  return {
    type: types.LOGGED_IN,
    user
  };
}

export function logout() {
  return {
    type: types.LOGGED_OUT
  };
}

/*
* Attempts to log into the web service using the username and password, will return an action that specifies it failed or suceeded
*/
export function attempLogin(username, password) {
  return function(dispatch) {
    return fetch(`${URL_PREFIX}/login/`, {
      method: 'POST',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
      }
    }).then(res => {
      if (!res.ok) {
        return Promise.reject(res);
      }
      return res;
    })
      .then(res => res.json())
      .then(res => {
        sessionStorage.setItem('user', JSON.stringify({
          ...res,
          username,
          password
        }));
        dispatch({
          type: types.LOGGED_IN,
          user: {
            ...res,
            username,
            password
          }
        });
      })
      .catch(err => {
        dispatch({
          type: types.LOGGED_IN_FAILED,
          user: {
            ...err,
            password
          }
        });
      });
  };
}

/*
* Attempts to register the user to the service using the username and password
* can fail if the username is not unique
*/
export function attemptRegister(username, password, displayName) {
  return function(dispatch) {
    return basicAuthFetch('POST', '/register/', {username, password}, {
      username,
      password,
      displayName
    });
    // TODO: Do something when successfully registered
  };
}


/*
* Action that updates the state to say the log in has failed
*/
function updateUser(user) {
  return {
    type: types.UPDATE_USER,
    user
  };
}

export function attemptUpdateProfile(user) {


  // console.log(userCopy)
  return function(dispatch) {

    return basicAuthFetch('PUT', `/author/${getUUIDFromId(user.url)}/`, user, user)
    .then(res => {
      dispatch(updateUser({
        ...res,
      }));
    });
  };
}

/*
* Deletes a post specified by post
*/
export function deletePost(post, user) {
  return function(dispatch) {
    basicAuthFetch('DELETE', `/posts/${post.id}/`, user)
    .then((res) => {
      dispatch({
        type: types.DELETE_POST,
        post: post
      });
    });
  };
}

/*
* Switch tabs to the input tab
*/
export function switchTabs(tab, user) {
  if(user) {
    return {
      type: types.SWITCH_TABS,
      tab,
      user
    };
  }
  return {
    type: types.SWITCH_TABS,
    tab
  };
}

export function loadGithub(user) {
  // console.log(user)
  user = user.replace('https://github.com/', '');
  return function(dispatch) {
    githubFetch(user)
    .then(res => res.json())
    .then((res) => {
      dispatch({
        type: types.LOAD_GITHUB,
        githubEvents:res
      });
      // console.log(res)
    });
  };
}


