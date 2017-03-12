import { combineReducers } from 'redux';
import * as types from '../types';

export function posts(state=[], action) {
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
    return [
      action.post,
      ...state
    ];
  case types.FINISH_LOADING_POSTS:
    return action.posts;
  default:
    return state;
  }
}

export function users(state=[], action){
  switch (action.type) {
  case types.LOADED_USERS:
    return [
      ...action.users
    ];
  default:
    return state;
  }
}

function app(state={loggedIn: false, activeTab: 'stream'}, action) {
  switch (action.type) {
  case types.LOGGED_IN:
    return {
      ...state,
      loggedIn: true,
      user: action.user
    };
  case types.LOGGED_IN_FAILED:
    return {
      ...state,
      loggedIn: false,
      loggedInFail: true,
      user: action.user
    };
  case types.SWITCH_TABS:
    return {
      ...state,
      activeTab: action.tab
    };
  default:
    return state;
  }
}

export default combineReducers({posts, users, app});
