import { combineReducers } from 'redux';
import * as types from '../types';
import schema from '../schema';
import {normalize} from 'normalizr';


function posts(state=[], action) {
  switch (action.type) {
  case types.ADD_COMMENT:
    const post = state[action.postId];
    return {
      ...state,
      [action.postId]: {
        ...post,
        comments: [
          ...post.comments,
          action.comment.id
        ]
      }
    };
  case types.ADD_POST:
    return {
      [action.post.id]: action.post,
      ...state
    };
  case types.FINISH_LOADING_POSTS:
    return action.posts;
  default:
    return state;
  }
}

function comments(state=[], action) {
  switch (action.type) {
  case types.ADD_COMMENT:
    return {
      ...state,
      [action.comment.id]: action.comment
    };
  default:
    return state;
  }
}

function users(state=[], action) {
  switch (action.type) {
  default:
    return state;
  }
}

function friends(state ={
  friendList: [],
  friendRequests: []
},action){
  switch (action.type) {
  default:
    return state;
  }
}


export default combineReducers({posts, comments, users, friends});
