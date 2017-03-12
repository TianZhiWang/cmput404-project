import { assert } from 'chai';
import { describe, it } from 'mocha';

import * as types from '../../src/types';
import { posts, friends } from '../../src/reducers/index';

const baseState = {
  "posts": [],
  "friends": {
    "friendList": [],
    "friendRequests": []
  }
};

describe('posts reducer', function () {
  describe('add comment', () => {
    it('should add comment', () => {
      const action = {
        type: types.ADD_COMMENT,
        postId: 111,
        comment: "hello"
      };
      const state = [{ id: 111, comments: [] }];
      assert.deepEqual(
        posts(state, action),
        [{ id: 111, comments: ["hello"] }]
      );
    });
  });

  describe('add post', () => {
    it('should add post', () => {
      const action = {
        type: types.ADD_POST,
        postId: "pid",
        post: { id: "pid", payload: "payload" }
      };
      const state = {};
      assert.deepEqual(
        posts(state, action), {
          "pid": {
            id: "pid",
            payload: "payload"
          }
        }
      );
    });
  });

  describe('finish loading posts', () => {
    it('should return posts', () => {
      const action = {
        type: types.FINISH_LOADING_POSTS,
        posts: "posts"
      };
      const state = {};
      assert.deepEqual(
        posts(state, action), "posts"
      );
    });
  });

  describe('default behavior', () => {
    it('should return state', () => {
      const action = {};
      const state = {};
      assert.deepEqual(
        posts(state, action), {
        }
      );
    });
  });
});


describe('friends reducer', function () {
  describe('default behavior', () => {
    it('should return state', () => {
      const action = {};
      const state = {};
      assert.deepEqual(
        friends(state, action), {
        }
      );
    });
  });
});