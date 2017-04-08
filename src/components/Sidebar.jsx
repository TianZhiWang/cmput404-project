import React, { Component, PropTypes } from 'react';
import {ListGroup, ListGroupItem, Nav, NavItem, Button} from 'react-bootstrap';

/*
* Renders a sidebar with a couple options: Stream and Following
*/
class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    sessionStorage.clear();
    this.props.logout();
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
          <NavItem eventKey={'github'}>Github</NavItem>
        </Nav>
        <Button onClick={this.logout}>Logout</Button>
      </div>
    );
  }
}

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  switchTabs: PropTypes.func.isRequired,
};

export default Sidebar;