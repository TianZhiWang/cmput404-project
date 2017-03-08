import * as types from '../types';
import uuid from 'uuid/v1';

export function addComment(text, postId, user) {
  return {
    type: types.ADD_COMMENT,
    postId,
    comment: {
      id: uuid(),
      text,
      author: user
    }
  };
}

export function addPost(post, user) {
  return {
    type: types.ADD_POST,
    post: {
      id: uuid(),
      format: post.format,
      text: post.text,
      user_with_permission: post.user_with_permission,
      author: user,
      comments: []
    }
  };
}