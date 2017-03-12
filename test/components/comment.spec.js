import React from 'react';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import { describe, it } from 'mocha';

import Comment from '../../src/components/Comment';

describe('<Comment>', function () {
  const store={};
  const props = {
    author: {},
    comment: "",
  };
  it('Should render', () => {
    const wrapper = shallow(<Comment {...props}/>);
    assert.equal(wrapper.find('.comment').length, 1);
  });
});