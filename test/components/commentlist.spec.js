import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import CommentList from '../../src/components/CommentList';

describe('<CommentList>', function () {
  const store={};
  const props = {
    comments: []
  };
  it('Should render', () => {
    const wrapper = shallow(<CommentList {...props}/>);
    assert.equal(wrapper.find('.comment-list').length, 1);
  });
});