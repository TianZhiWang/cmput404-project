import React, { Component, PropTypes } from 'react';
import {ListGroup, ListGroupItem, Nav, NavItem} from 'react-bootstrap';

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
        </Nav>
      </div>
    );
  }
}

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  switchTabs: PropTypes.func.isRequired,
};

export default Sidebar;