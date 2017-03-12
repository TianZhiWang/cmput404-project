import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import CreatePost from '../../src/components/CreatePost';

describe('<CreatePost>', function () {
  const store={};
  const props = {
    addPost: function () {},
    users: []
  };
  it('Should render', () => {
    const wrapper = shallow(<CreatePost {...props}/>);
    assert.equal(wrapper.find('.create-post').length, 1);
  });
});