import { assert } from 'chai';
import { describe, it } from 'mocha';

import * as types from '../../src/types';
import { posts, users, app } from '../../src/reducers/index';

const baseState = {
  "posts": [],
  "friends": {
    "friendList": [],
    "friendRequests": []
  }
};

describe('posts reducer', function () {
  // describe('add comment', () => {
  //   it('should add comment', () => {
  //     const action = {
  //       type: types.ADD_COMMENT,
  //       postId: 111,
  //       comment: "hello"
  //     };
  //     const state = [{ id: 111, comments: [] }];
  //     assert.deepEqual(
  //       posts(state, action),
  //       [{ id: 111, comments: ["hello"] }]
  //     );
  //   });
  // });

  describe('add post', () => {
    it('should add post', () => {
      const action = {
        type: types.ADD_POST,
        post: { id: "pid", payload: "payload" }
      };
      const state = {};
      assert.deepEqual(
        posts(state, action), [
          {
            id: "pid",
            payload: "payload"
          }
        ]
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


describe('users reducer', function () {
  describe('loaded users', () => {
    it('should load users', () => {
      const action = { 
        type: types.LOADED_USERS,  
        users: [{ a:"aaa" }]
      };
      const state = [];
      assert.deepEqual(
        users(state, action), [ { a: "aaa"} ]
      );
    });
  });

  describe('default behavior', () => {
    it('should return state', () => {
      const action = {};
      const state = {};
      assert.deepEqual(
        users(state, action), {
        }
      );
    });
  });
});


describe('app reducer', function () {
  describe('logged in', () => {
    it('should log in', () => {
      const action = { 
        type: types.LOGGED_IN,  
        user: { a:"aaa" }
      };
      const state = {};
      assert.deepEqual(
        app(state, action), { 
          user: { a: "aaa"},
          loggedIn: true
        }
      );
    });
  });

  describe('login fail', () => {
    it('should login fail', () => {
      const action = { 
        type: types.LOGGED_IN_FAILED,  
        user: { a:"aaa" }
      };
      const state = {};
      assert.deepEqual(
        app(state, action), { 
          user: { a: "aaa"},
          loggedIn: false,
          loggedInFail: true
        }
      );
    });
  });

  describe('switch tabs', () => {
    it('should switch tabs', () => {
      const action = { 
        type: types.SWITCH_TABS,  
        tab: { a:"aaa" }
      };
      const state = {};
      assert.deepEqual(
        app(state, action), { 
          activeTab: { a: "aaa"}
        }
      );
    });
  });

  describe('default behavior', () => {
    it('should return state', () => {
      const action = {};
      const state = {};
      assert.deepEqual(
        app(state, action), {
        }
      );
    });
  });
});