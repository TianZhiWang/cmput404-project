import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import FriendList from '../../src/components/FriendList';

describe('<FriendList>', function () {
  const store={};
  const props = {
    friendRequests: [],
    friends: []
  };
  it('Should render', () => {
    const wrapper = shallow(<FriendList {...props}/>);
    assert.equal(wrapper.find('.friend-page').length, 1);
  });
});