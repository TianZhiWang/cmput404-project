import {combineReducers} from 'redux';
import * as types from '../types';

// Schema based on normalizr https://github.com/paularmstrong/normalizr (MIT)
const mockposts = [
  {
    id: 20525,
    author: {
      id: 43231,
      name: 'Ken Adams'
    },
    text: 'I can see clearly now',
    comments: [
      {
        id: 1232,
        author: {
          id: 96853,
          name: 'James Bond'
        },
        text: 'You wot?'
      }, {
        id: 7653,
        author: {
          id: 73841,
          name: 'Moriarty'
        },
        text: 'yeah wot'
      }
    ]
  },
  {
    id: 10241,
    author: {
      id: 96853,
      name: 'James Bond'
    },
    text: 'UofA is better than UofC',
    comments: []
  }
];

function posts(state=mockposts, action) {
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
  default:
    return state;
  }
}

export default combineReducers({posts});
