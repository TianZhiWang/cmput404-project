/*
MIT License

Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, Josh Deng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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