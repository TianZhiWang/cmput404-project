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
import React, { Component, PropTypes } from 'react';
import {ListGroup, ListGroupItem, Nav, NavItem, Button} from 'react-bootstrap';

/*
* Renders a sidebar with a couple options: Stream and Following
*/
class Sidebar extends Component {
  constructor(props) {
    super(props);
  }



  render() {
    return (
      <div className='sidebar'>
        <h1>Coolbears</h1>
        <Nav 
          bsStyle="pills"
          stacked
          activeKey={this.props.activeTab}
          onSelect={this.props.switchTabs}>
          <NavItem eventKey={'stream'}>Stream</NavItem>
          <NavItem eventKey={'friends'}>Following</NavItem>
          <NavItem eventKey={'profile'}>Profile</NavItem>
          { this.props.user.github ? <NavItem eventKey={'github'}>Github</NavItem> : <noscript/>}
        </Nav>
      </div>
    );
  }
}

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  switchTabs: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default Sidebar;