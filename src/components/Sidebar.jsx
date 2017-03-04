import React, { Component, PropTypes } from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

class Sidebar extends Component {
  render() {
    return (
      <div className='sidebar'>
        <h1>Coolbears</h1>
        <ListGroup>
          <ListGroupItem>Stream</ListGroupItem>
          <ListGroupItem>Following</ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}


export default Sidebar;