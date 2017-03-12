import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import UserAccount from '../../src/components/UserAccount';

describe('<UserAccount>', function () {
  const store={};
  const props = {};
  it('Should render', () => {
    const wrapper = shallow(<UserAccount {...props}/>);
    assert.equal(wrapper.find('.wrapper').length, 1);
  });
});