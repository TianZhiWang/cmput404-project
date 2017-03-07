import * as types from '../types';
import uuid from 'uuid/v1';

export function addComment(text, postId, author) {
  return {
    type: types.ADD_COMMENT,
    postId,
    comment: {
      id: uuid(),
      text,
      author
    }
  };
}