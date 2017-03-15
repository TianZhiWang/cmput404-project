import { combineReducers } from 'redux';
import * as types from '../types';

/**
 * Posts Reducer
 * @param [] state 
 * @param {} action 
 */
export function posts(state=[], action) {
  switch (action.type) {
    /**
     * Add Comment to state [ post : { comments: List } ]
     * @param [] state 
     * @param { type: Enum, postId: Number, comment: Object} action
     */
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
    /**
     * Add Post to state []
     * @param [] state 
     * @param { type: Enum, post: Object } action
     */
  case types.ADD_POST:
    return [
      action.post,
      ...state
    ];
    /**
     * Finish Loading Post
     * @param [] state 
     * @param { type: Enum, post: Object } action
     */
  case types.FINISH_LOADING_POSTS:
    return action.posts;
    /**
     * Delete Post from state []
     * @param [] state 
     * @param { type: Enum, post: Object } action
     */
  case types.DELETE_POST:
    const temp = state.filter(function rm(value){
      return value.id!= action.post.id;
    }
      );
    return temp;

  default:
    return state;
  }
}

/**
 * Users Reducer
 * @param [] state 
 * @param {} action 
 */
export function users(state=[], action){
  switch (action.type) {
    /**
     * Load Users to state
     * @param [] state 
     * @param { type: Enum, users: List } action
     */
  case types.LOADED_USERS:
    return [
      ...action.users
    ];
  case types.TOGGLE_FOLLOWER:
    return state.map(user => {
      if (user.id === action.otherUser.id) {
        return {
          ...user,
          isFollowing: !user.isFollowing
        };
      }
      return user;
    });
  default:
    return state;
  }
}

/**
 * App Reducer
 * @param [] state 
 * @param {} action 
 */
export function app(state={loggedIn: false, activeTab: 'stream'}, action) {
  switch (action.type) {
    /**
     * Log In, add  { loggedIn: true } to state [ app : {} ]
     * @param [] state 
     * @param { type: Enum, user: Object } action
     */
  case types.LOGGED_IN:
    return {
      ...state,
      loggedIn: true,
      user: action.user
    };
    /**
     * Log In Failure, add { loggedInFail: true} { loggedIn: false } to state [ app : {} ]
     * @param [] state 
     * @param { type: Enum, user: Object } action
     */
  case types.LOGGED_IN_FAILED:
    return {
      ...state,
      loggedIn: false,
      loggedInFail: true,
      user: action.user
    };
    /**
     * Switch Tabs, sets the active tab in state [ app : {} ]
     * @param [] state 
     * @param { type: Enum, tab: Object } action
     */
  case types.SWITCH_TABS:
    return {
      ...state,
      activeTab: action.tab
    };
  default:
    return state;
  }
}

/**
 * Combine reducers to a a single reducer
 */
export default combineReducers({posts, users, app});
