import * as types from '../types';
import uuid from 'uuid/v1';

const URL_PREFIX = 'http://' + window.location.hostname + ':8000';

export function addComment(comment, postId, user) {
 //call api
 

  // return {
  //   type: types.ADD_COMMENT,
  //   postId,
  //   comment: {
  //     id: uuid(),
  //     comment,
  //     author: user
  //   }
  // };
  return function(dispatch,user) {
   
    fetch(URL_PREFIX + `/posts/${String(postId)}/comments/`, {
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

export function addPost(post, user) {

  return function(dispatch) {

   
    fetch( URL_PREFIX+'/posts/', {
      method: 'POST',
      headers: {
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
        "visibleTo": []
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



function finishLoadingPosts(result) {
  return {
    type: types.FINISH_LOADING_POSTS,
    posts: result || []
  };
}

export function loadPosts(user) {
  return function(dispatch) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    return fetch(URL_PREFIX + "/authors/posts/",{
      method: 'GET',
      headers: {
        // http://stackoverflow.com/questions/30203044/using-an-authorization-header-with-fetch-in-react-native
        'Authorization': 'Basic '+btoa(user.username+":"+user.password), 
        'Content-Type': 'application/x-www-form-urlencoded'
      }

    })
      .then(res => res.json())
      .then(res => {
        dispatch(finishLoadingPosts(res.results));
      });
  };
}

function logIn(user) {
  return {
    type: types.LOGGED_IN,
    user
  };
}

export function attempLogin(username, password) {
  return function(dispatch) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    return fetch(URL_PREFIX + '/login/', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic '+btoa(username + ":" + password)
      }
    }).then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then(res => res.json())
    .then(res => {
      return dispatch(logIn({
        ...res,
        password
      }));
    })
    .catch(err => {
      console.log('Invalid login credentials');
    });
  };
}

export function attemptRegister(username, password) {
  return function(dispatch) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    return fetch(URL_PREFIX + '/register/', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic '+btoa(username + ":" + password),
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


export function switchTabs(tab) {
  return {
    type: types.SWITCH_TABS,
    tab
  };
};

export function deletePost(post,user){
  return function(dispatch) {

   
    fetch(URL_PREFIX+'/posts/'+String(post.id)+'/', {
      method: 'DELETE',
      headers: {
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
};