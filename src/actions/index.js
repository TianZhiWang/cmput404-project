import * as types from '../types';
import uuid from 'uuid/v1';

export function addComment(comment, postId, user) {
  return {
    type: types.ADD_COMMENT,
    postId,
    comment: {
      id: uuid(),
      comment,
      author: user
    }
  };
}

export function addPost(post, user) {
  return {
    type: types.ADD_POST,
    post: {
      id: uuid(),
      contentType: post.contentType,
      title: post.title,
      user_with_permission: post.user_with_permission,
      author: user,
      comments: []
    }
  };
}

function finishLoadingPosts(result) {
  return {
    type: types.FINISH_LOADING_POSTS,
    posts: result
  };
}

export function loadPosts() {
  return function(dispatch) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    return fetch(`http://${  window.location.hostname  }:8000/posts/`)
      .then(res => res.json())
      .then(res => {
        dispatch(finishLoadingPosts(res.results));
      });
  };
}