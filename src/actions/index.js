import * as types from '../types';
import uuidv4 from 'uuid/v4';
import request from 'superagent';

let URL_PREFIX = `http://${  window.location.hostname  }:8000`;
/*eslint-disable */
if(process.env.NODE_ENV === 'production') {
  URL_PREFIX = 'https://' + window.location.hostname;
}

function getUUIDFromId(id) {
  return /author\/([a-zA-Z0-9-]+)\/?$/.exec(id, 'g')[1];
}
/*eslint-enable */
/*
* Adds a comment, to a post specified by postId
*/
// TODO: Add post origin to comment body
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

    fetch(`${URL_PREFIX}/posts/${String(postUUID)}/comments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`, 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    })
    .then(res => res.json())
    .then((res) => {
      dispatch({
        type:types.ADD_COMMENT,
        commentData: requestBody.comment,
        postId: postId
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
// export function addPost(post, user) {

//   return function(dispatch) {
//     fetch(`${URL_PREFIX}/posts/`, {
//       method: 'POST',
//       headers: {
//         // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
//         'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`, 
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       body: JSON.stringify({
//         title: post.title,
//         content: post.content,
//         description: post.description,
//         contentType: post.contentType,
//         author: user.id,
//         comments: post.comments,
//         visibility:post.permission,

//         // image:post.image,
//         visibleTo: post.user_with_permission
//       }),
//     })
//     .then(res => res.json())
//     .then((res) => {
//         console.log(post.image)
//         dispatch({type:types.ADD_POST,post: res});
//         // learned from https://visionmedia.github.io/superagent/docs/test.html
//               let upload = request.post(`${URL_PREFIX}/uploadimage/images/`)
                               
//                                .field('image', post.image)
//                                .auth('joshdeng', 'j69pbxq9');

//               upload.end((err, res) => {
//                 if (err) {
//                   console.error(err);
//                 }

//                 if (res) {
//                   console.log(res)
//                 }
//               });
                   
//     })
//     .catch((err) => {

//     });
//   };
// }

export function addPost(post, user) {

  return function(dispatch) {
    if (post.image){
    console.log(post.image)
       
        // learned from https://visionmedia.github.io/superagent/docs/test.html
              let upload = request.post(`${URL_PREFIX}/uploadimage/images/`)
                               
                               .field('image', post.image)
                               .auth('joshdeng', 'j69pbxq9');

              upload.end((err, res) => {
                if (err) {
                  console.error(err);
                }

                if (res) {
                  console.log(JSON.parse(res.text).image)
                   fetch(`${URL_PREFIX}/posts/`, {
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
                        image: JSON.parse(res.text).image,
                        visibleTo: post.user_with_permission
                      }),
                    })
                    .then(res => res.json())
                    .then((res) => {
                         dispatch({type:types.ADD_POST,post: res});
                                   
                    })
                    .catch((err) => {

                    });
                }
              });

   }else{
       fetch(`${URL_PREFIX}/posts/`, {
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
                        image: "NO_IMAGE",
                        visibleTo: post.user_with_permission
                      }),
                    })
                    .then(res => res.json())
                    .then((res) => {
                         dispatch({type:types.ADD_POST,post: res});
                                   
                    })
                    .catch((err) => {

                    });
   }
  };
}

function addPostImage(post,user){
  return function(dispatch) {
    fetch(`${URL_PREFIX}/uploadimage/images/`, {
      method: 'POST',
      // transfomrRequest: transformImageRequest,
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`, 
        'Content-Type': "multipart/form-data",
        // 'Accept': 'application/json'
      },
      body: {
        "image": post.image,
        "id": "1a3a3325-f565-419d-a882-d6327b7ecf10",
      }
    })
    .then(res => res.json())
    .then((res) => {
      console.log(res+"!!!")
      // dispatch({type:types.ADD_POST,post: res});
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
    posts: result || [],
    authors: result.map(post => post.author) || []
  };
}

/*
* Loads all posts visible to the current user
*/
export function loadPosts(user) {
  return function(dispatch) {
    return fetch(`${URL_PREFIX}/author/posts/`,{
      method: 'GET',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(res => {
        dispatch(finishLoadingPosts(res));
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
      dispatch(logIn({
        ...res,
        username,
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
export function attemptRegister(username, password, displayName) {
  return function(dispatch) {
    return fetch(`${URL_PREFIX}/register/`, {
      method: 'POST',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        displayName
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
    fetch(`${URL_PREFIX}/authors/`, {
      method: 'GET',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username  }:${  user.password}`)}`
      }
    })
    .then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then(res => res.json())
    .then(res => {
      return dispatch(finishedGettingUsers(res));
    })
    .catch(err => {
      console.log(err, 'Could not get friends');
    });
  };
}

/*
* Specifies the current user is following 'user to follow'
*/
function toggleFollower(otherUser) {
  return {
    type: types.TOGGLE_FOLLOWER,
    otherUser
  };
}

function followUser(currentUser, otherUser) {
  return fetch(`${URL_PREFIX}/friendrequest/`, {
    method: 'POST',
    headers: {
      // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
      'Authorization': `Basic ${btoa(`${currentUser.username}:${currentUser.password}`)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'friendrequest',
      author: {
        id: currentUser.id,
        host: currentUser.host,
        url: currentUser.url,
        displayName: currentUser.displayName
      },
      friend: {
        id: otherUser.id,
        host: currentUser.host,
        url: currentUser.url,
        displayName: currentUser.displayName
      }
    }),
  });
}

function unfollowUser(currentUser, otherUser) {
  return fetch(`${URL_PREFIX}/friendrequest/`, {
    method: 'DELETE',
    headers: {
      // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
      'Authorization': `Basic ${btoa(`${currentUser.username}:${currentUser.password}`)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'friendrequest',
      author: {
        id: currentUser.id,
        host: currentUser.host,
        url: currentUser.url,
        displayName: currentUser.displayName
      },
      friend: {
        id: otherUser.id,
        host: currentUser.host,
        url: currentUser.url,
        displayName: currentUser.displayName
      }
    })
  });
}

export function toggleFollowStatus(currentUser, otherUser, isFriend) {
  return function(dispatch) {
    const toggleFollow = isFriend ? unfollowUser : followUser;

    return toggleFollow(currentUser, otherUser)
    .then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then(res => {
      dispatch(toggleFollower(otherUser));
    })
    .catch(err => {
      console.log('Could not toggle follow status');
    });
  };
}

/*
* Deletes a post specified by post
*/
export function deletePost(post, user){
  return function(dispatch) {
    fetch(`${URL_PREFIX}/author/${getUUIDFromId(user.id)}/posts/${post.id}/`, {
      method: 'DELETE',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
      },
    })
    .then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then((res) => {
      dispatch({type:types.DELETE_POST,post:post});
    })
    .catch((err) => {
      console.log('Could not delete post', err);
    });
  };
}

