import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import Sidebar from '../../src/components/Sidebar';

describe('<Sidebar>', function () {
  const store={};
  const props = {
    updateContent: function() {}
  };
  it('Should render', () => {
    const wrapper = shallow(<Sidebar {...props}/>);
    assert.equal(wrapper.find('.sidebar').length, 1);
  });
});