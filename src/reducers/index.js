import { combineReducers } from 'redux';
import * as types from '../types';

function posts(state=[], action) {
  switch (action.type) {
  case types.ADD_COMMENT:
    return state.map(post => {
      if (post.id === action.postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            action.comment
          ]
        };
      }
      return post;
    });
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

function friends(state ={
  friendList: [],
  friendRequests: []
},action){
  switch (action.type) {
  default:
    return state;
  }
}


export default combineReducers({posts, friends});
