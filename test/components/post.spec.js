import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import Post from '../../src/components/Post';

describe('<Post>', function () {
  const store={};
  const props = {
    author: {
      displayname: "Aaa"
    },
    id: "11",
    title: "Aaa",
    comments: [],
    addComment: function () {return 1;}
  };
  it('Should render', () => {
    const wrapper = shallow(<Post {...props}/>);

    assert.equal(wrapper.find('CommentList').length, 1);
    assert.equal(wrapper.find('Button').length, 1);
    assert.equal(wrapper.find('FormControl').length, 1);
  });
});