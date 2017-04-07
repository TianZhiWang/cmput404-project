import * as types from '../types';
import uuidv4 from 'uuid/v4';

import {URL_PREFIX} from '../constants';
import {getUUIDFromId, basicAuthFetch} from '../utils';
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
  return function(dispatch) {
    console.log(user)
    return fetch(user.url, {
      method: 'PUT',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user),
    }).then(res => {
      if (!res.ok) {
        return Promise.reject(res);
      }
      return res;
    })
    .then(res => res.json())
    .then(res => {
      // console.log(res);
      dispatch(updateUser({
        ...res,
      }));
    })
    .catch(err => {
      //TODO Something on fail
    });
  };
}

function followUser(currentUser, otherUser) {
  return basicAuthFetch('POST', '/friendrequest/', currentUser, {
    query: 'friendrequest',
    author: {
      id: currentUser.id,
      host: currentUser.host,
      url: currentUser.url,
      displayName: currentUser.displayName
    },
    friend: {
      id: otherUser.id,
      host: otherUser.host,
      url: otherUser.url,
      displayName: otherUser.displayName
    }
  });
}

function unfollowUser(currentUser, otherUser) {
  return basicAuthFetch('DELETE', `/author/${getUUIDFromId(currentUser.id)}/friends/${getUUIDFromId(otherUser.id)}/`, currentUser, {
    query: 'friendrequest',
    author: {
      id: currentUser.id,
      host: currentUser.host,
      url: currentUser.url,
      displayName: currentUser.displayName
    },
    friend: {
      id: otherUser.id,
      host: otherUser.host,
      url: otherUser.url,
      displayName: otherUser.displayName
    }
  });
}

export function toggleFollowStatus(currentUser, otherUser, isFriend) {
  return function(dispatch) {
    const toggleFollow = isFriend ? unfollowUser : followUser;
    return toggleFollow(currentUser, otherUser);
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