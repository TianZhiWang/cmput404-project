import React, {Component, PropTypes} from 'react';
import {ListGroup, ListGroupItem, Button, Glyphicon} from 'react-bootstrap';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {getUUIDFromId, basicAuthFetch} from '../utils';
import FriendList from './FriendList';

/*
* Renders a list of friends in three sections: Friends, Following, and Everyone Else
*/
class FriendPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      friendRequests: [],
      friends: [],
      authors: [],
      loading: true
    };

    this.followUser = this.followUser.bind(this);
    this.unfollowUser = this.unfollowUser.bind(this);
    this.deleteFriendRequest = this.deleteFriendRequest.bind(this);
  }
  componentDidMount() {
    this.getFriendsAndFriendRequests();
  }

  getFriendsAndFriendRequests() {
    this.setState({
      loading: true
    });
    Promise.all([
      basicAuthFetch('GET', '/friendrequest/', this.props.user),
      basicAuthFetch('GET', `/author/${getUUIDFromId(this.props.user.id)}/`, this.props.user),
      basicAuthFetch('GET', '/authors/', this.props.user)
    ])
    .then(results => {
      this.setState({
        loading: false,
        friendRequests: results[0],
        friends: results[1].friends,
        authors: results[2]
      });
    });
  }

  getEveryoneElse() {
    const everyoneElse = [];
    const friendIds = this.state.friends.map(friend => friend.id);
    const friendRequestIds = this.state.friendRequests.map(friend => friend.id);
    for (const author of this.state.authors) {
      if (friendIds.indexOf(author.id) < 0 && friendRequestIds.indexOf(author.id) < 0 && author.id != this.props.user.id) {
        everyoneElse.push(author);
      }
    }
    return everyoneElse;
  }

  followUser(otherUser) {
    const currentUser = this.props.user;
    basicAuthFetch('POST', '/friendrequest/', currentUser, {
      query: 'friendrequest',
      author: {
        id: currentUser.id,
        host: currentUser.host,
        url: currentUser.url,
        displayName: currentUser.displayName
      },
      friend: {
        id: otherUser.id,
        host: otherUser.host,
        url: otherUser.url,
        displayName: otherUser.displayName
      }
    })
    .then(() => {
      this.getFriendsAndFriendRequests();
    });
  }

  unfollowUser(otherUser) {
    const currentUser = this.props.user;
    basicAuthFetch('DELETE', `/author/${getUUIDFromId(currentUser.id)}/friends/${getUUIDFromId(otherUser.id)}/`, currentUser, {
      query: 'friendrequest',
      author: {
        id: currentUser.id,
        host: currentUser.host,
        url: currentUser.url,
        displayName: currentUser.displayName
      },
      friend: {
        id: otherUser.id,
        host: otherUser.host,
        url: otherUser.url,
        displayName: otherUser.displayName
      }
    })
    .then(() => {
      this.getFriendsAndFriendRequests();
    });
  }

  deleteFriendRequest(otherUser) {
    basicAuthFetch('DELETE', `/friendrequest/${getUUIDFromId(otherUser.id)}/cancelRequest/${getUUIDFromId(this.props.user.id)}/`, this.props.user)
    .then(() => {
      this.getFriendsAndFriendRequests();
    });
  }

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>;
    }
    return (
      <div className='friend-page'>
        <h2>Friend Requests</h2>
        <FriendList
          handleRemove={this.deleteFriendRequest}
          handleOk={this.followUser}
          users={this.state.friendRequests}
        />
        <h2>Friends</h2>
        <FriendList
          handleRemove={this.unfollowUser}
          users={this.state.friends}
        />
        <h2>Authors</h2>
        <FriendList
          handleOk={this.followUser}
          users={this.getEveryoneElse()}
        />
      </div>
    );
  }
}

FriendPage.propTypes = {
  user: PropTypes.object.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      user: stateProps.app.user
    };
  }
  )(FriendPage);