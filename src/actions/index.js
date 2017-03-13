import * as types from '../types';
import uuid from 'uuid/v1';

let URL_PREFIX = `http://${  window.location.hostname  }:8000`;
/*eslint-disable */
if(process.env.NODE_ENV === 'production') {
  URL_PREFIX = 'https://' + window.location.hostname;
}
/*eslint-enable */
/*
* Adds a comment, to a post specified by postId
*/
export function addComment(comment, postId, user) {
  return function(dispatch) {
    fetch(`${URL_PREFIX  }/posts/${String(postId)}/comments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`, 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        comment:comment
      }),
    })
    .then(res => res.json())
    .then((res) => {
      dispatch({type:types.ADD_COMMENT,
        postId: postId,
        comment: res
      });
     // location.reload();
    })
    .catch((err) => {

    });
  };
}
/*
* Adds a post by a user then returns an action to update the state
*/
export function addPost(post, user) {
  return function(dispatch) {
    fetch(`${URL_PREFIX  }/posts/`, {
      method: 'POST',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`, 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        description: post.description,
        contentType: post.contentType,
        author: user.id,
        comments: post.comments,
        visibility:post.permission,
        visibleTo: []
      }),
    })
    .then(res => res.json())
    .then((res) => {
      dispatch({type:types.ADD_POST,post: res});
     // location.reload();
    })
    .catch((err) => {

    });
  };
}

/*
* Returns an action with the post results (or [])
*/
function finishLoadingPosts(result) {
  return {
    type: types.FINISH_LOADING_POSTS,
    posts: result || []
  };
}

/*
* Loads all posts visible to the current user
*/
export function loadPosts(user) {
  return function(dispatch) {
    return fetch(`${URL_PREFIX}/authors/posts/`,{
      method: 'GET',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`, 
        'Content-Type': 'application/x-www-form-urlencoded'
      }

    })
      .then(res => res.json())
      .then(res => {
        dispatch(finishLoadingPosts(res.results));
      });
  };
}

/*
* Action that updates the state to log the user in
*/
function logIn(user) {
  return {
    type: types.LOGGED_IN,
    user
  };
}

/*
* Action that updates the state to say the log in has failed
*/
function logInFail(user) {
  return {
    type: types.LOGGED_IN_FAILED,
    user
  };
}

/*
* Attempts to log into the web service using the username and password, will return an action that specifies it failed or suceeded
*/
export function attempLogin(username, password) {
  return function(dispatch) {
    return fetch(`${URL_PREFIX  }/login/`, {
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
      dispatch(logIn({
        ...res,
        password
      }));
    })
    .catch(err => {
      console.log(err);
      return dispatch(logInFail({
        ...err,
        password
      }));
    });
  };
}

/*
* Attempts to register the user to the service using the username and password
* can fail if the username is not unique
*/
export function attemptRegister(username, password) {
  return function(dispatch) {
    return fetch(`${URL_PREFIX  }/register/`, {
      method: 'POST',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      }),
    }).then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .catch(err => {
      console.log('Could not register user');
    });
    // TODO: Do something when successfully registered
  };
}

/*
* Switch tabs to the input tab
*/
export function switchTabs(tab) {
  return {
    type: types.SWITCH_TABS,
    tab
  };
}

/*
* Returns an action to update the user with all current users
*/
export function finishedGettingUsers(users) {
  return {
    type: types.LOADED_USERS,
    users
  };
}

/*
* Gets all of the current users, friends, and following and joins them into one with an isFriend and isFollowing
*/
export function getUsers(user) {
  return function(dispatch) {
    return Promise.all([
      fetch(`${URL_PREFIX  }/authors/${  user.id  }/friends/`, {
        method: 'GET',
        headers: {
          // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
          'Authorization': `Basic ${btoa(`${user.username  }:${  user.password}`)}`
        }
      }),
      fetch(`${URL_PREFIX  }/authors/`, {
        method: 'GET',
        headers: {
          // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
          'Authorization': `Basic ${btoa(`${user.username  }:${  user.password}`)}`
        }
      }),
      fetch(`${URL_PREFIX  }/authors/${  user.id  }/following/`, {
        method: 'GET',
        headers: {
          // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
          'Authorization': `Basic ${btoa(`${user.username  }:${  user.password}`)}`
        }
      })
    ])
    .then(responses => {
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          return Promise.reject();
        }
        return responses;
      }
    })
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(responses => {
      const users = responses[1].results;
      const friends = responses[0].results;
      const following = responses[2].results;

      const usersWithFriendStatus = users.map(user => ({
        ...user,
        isFriend: friends.filter(friend => user.id === friend.id).length !== 0,
        isFollowing: following.filter(follow => user.id === follow.id).length !== 0
      }));
      return dispatch(finishedGettingUsers(usersWithFriendStatus));
    })
    .catch(err => {
      console.log(err, 'Could not get friends');
    });
  };
}

/*
* Specifies the current user is following 'user to follow'
*/
function addFollower(currentUser, userToFollow) {
  return {
    type: types.FOLLOW_USER,
    currentUser,
    userToFollow
  };
}

/*
* Makes a request to follow the user specified by userToFollow
*/
export function changeFollowStatus(follow, currentUser, userToFollow) {
  return function(dispatch) {
    if (!follow) {
      return; // Uncomment when delete works
    }
    return fetch(`${URL_PREFIX  }/friendrequest/`, {
      method: follow ? 'POST' : 'DELETE',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${currentUser.username}:${currentUser.password}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: currentUser.id,
        follows: userToFollow
      }),
    }).then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then(res => res.json())
    .then(res => {
      dispatch(getUsers(currentUser)); // Ideally we ould be smarter about this
    })
    .catch(err => {
      console.log('Could not register user');
    });
  };
}

/*
* Deletes a post specified by post
*/
export function deletePost(post,user){
  return function(dispatch) {
    fetch(`${URL_PREFIX}/posts/${String(post.id)}/`, {
      method: 'DELETE',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`, 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    })
    // .then(res => res.json())
    .then((res) => {
      dispatch({type:types.DELETE_POST,post:post});
     // location.reload();
    })
    .catch((err) => {

    });
  };
}

