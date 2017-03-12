import { assert } from 'chai';
import { describe, it } from 'mocha';

import * as types from '../../src/types';
import posts from '../../src/reducers/index';
import users from '../../src/reducers/index';
import friends from '../../src/reducers/index';

const baseState = {
  "posts": [],
  "users": [],
  "comments": [],
  "friends": {
    "friendList": [],
    "friendRequests": []
  }
};

describe('posts reducer', function () {
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
          ...baseState,
          "posts": {
            "pid": {
              id: "pid",
              payload: "payload"
            }
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
        posts(state, action), {
          ...baseState,
          posts: "posts"
        }
      );
    });
  });

  describe('default behavior', () => {
    it('should return state', () => {
      const action = {};
      const state = {};
      assert.deepEqual(
        posts(state, action), {
          ...baseState,
        }
      );
    });
  });
});


describe('users reducer', function () {
  describe('default behavior', () => {
    it('should return state', () => {
      const action = {};
      const state = {};
      assert.deepEqual(
        users(state, action), {
          ...baseState,
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
          ...baseState,
        }
      );
    });
  });
});