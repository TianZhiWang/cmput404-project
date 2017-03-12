import { assert } from 'chai';
import { describe, it } from 'mocha';

import * as types from '../../src/types';
import posts from '../../src/reducers/index';

describe('posts reducer', function () {
  describe('add comment', () => {
    it('should add comment', () => {
      const action = { type: types.ADD_COMMENT, postId: "pid", comment: {id:"cid"} };
      const state = {
        "posts": {
          comments: [] 
        }
      };
      assert.deepEqual(
        posts(state, action), {
          "posts": {
            comments: ["cid"] 
          }
        }
      );
    });
  });
});