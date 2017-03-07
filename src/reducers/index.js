import {combineReducers} from 'redux';
import * as types from '../types';

// Schema based on normalizr https://github.com/paularmstrong/normalizr (MIT)
const normalizedState = {
  posts: {
    20525: {
      id: 20525,
      author: 43231,
      text: 'I can see clearly now',
      comments: [1232, 7653]
    },
    10241: {
      id: 10241,
      author: 96853,
      text: 'UofA is better than UofC',
      comments: []
    }
  },
  comments: {
    1232: {
      id: 1232,
      author: 96853,
      text: 'You wot?'
    },
    7653: {
      id: 7653,
      author: 73841,
      text: 'yeah wot'
    }
  },
  users: {
    43231: {
      id: 43231,
      name: 'Batman'
    },
    96853: {
      id: 96853,
      name: 'Sherlock'
    },
    73841: {
      id: 73841,
      name: 'Moritarty'
    }
  }
};

function posts(state=normalizedState.posts, action) {
  switch (action.type) {
  case types.ADD_COMMENT:
    const post = state[action.postId];
    return {
      ...post,
      comments: [
        ...post.comments,
        action.comment.id
      ]
    };
  default:
    return state;
  }
}

function comments(state=normalizedState.comments, action) {
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

function users(state=normalizedState.users, action) {
  switch (action.type) {
  default:
    return state;
  }
}

export default combineReducers({posts, comments, users});
