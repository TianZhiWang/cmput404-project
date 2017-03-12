import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import FriendListItem from '../../src/components/FriendListItem';

describe('<FriendListItem>', function () {
  const store={};
  const props = {
    isFollower: true,
    username: ""
  };
  it('Should render', () => {
    const wrapper = shallow(<FriendListItem {...props}/>);
    assert.equal(wrapper.find('.friend-list-item').length, 1);
  });
});