import React, {Component, PropTypes} from 'react';
import FriendListItem from './FriendListItem';
import {ListGroup} from 'react-bootstrap';

/*
* Renders a list of friends in three sections: Friends, Following, and Everyone Else
*/
class FriendList extends Component {
  render() {
    return (
        <ListGroup>
            {this.props.users.map(user => {
              return (
                <FriendListItem
                  key={user.id}
                  handleOk={this.props.handleOk}
                  handleRemove={this.props.handleRemove}
                  user={user}
                />
              );
            })}
        </ListGroup>
    );
  }
}

FriendList.propTypes = {
  handleOk: PropTypes.func,
  handleRemove: PropTypes.func,
  users: PropTypes.array.isRequired
};

export default FriendList;