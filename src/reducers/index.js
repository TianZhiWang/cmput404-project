import {combineReducers} from 'redux';

/* 
Reducer for posts, this will receive state.posts
and is responsible for all updates of that slice of state
*/
function posts(state=[], action) {
  switch(action.type) {
  default:
    return state;
  }
}

export default combineReducers({posts});
