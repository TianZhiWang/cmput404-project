import React, {Component, PropTypes} from 'react';
import FriendListItem from './FriendListItem';
import {ListGroup} from 'react-bootstrap';

class FriendList extends Component {
  render() {
    return (
      <div className='friend-page'>
        <h2>Requests</h2>
        <ListGroup className='friend-list'>
          {this.props.friendRequests.map(friend => <FriendListItem key={friend.id}
          {
            ...friend}/>)
          }
        </ListGroup>
        <h2>Friends</h2>
        <ListGroup className='friend-list'>
          {this.props.friends.map(friend => <FriendListItem key={friend.id} 
          {
            ...friend}/>)
          }
        </ListGroup>
      </div>
    );
  }
}

FriendList.propTypes = {
  friendRequests: PropTypes.array.isRequired,
  friends: PropTypes.array.isRequired
};

export default FriendList;