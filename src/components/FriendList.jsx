import React, {Component, PropTypes} from 'react';
import FriendListItem from './FriendListItem';
import {ListGroup, ListGroupItem, Button, Glyphicon} from 'react-bootstrap';
import {connect} from 'react-redux';
import {URL_PREFIX} from '../constants';
import * as actions from '../actions';
import {getUUIDFromId} from '../utils';

/*
* Renders a list of friends in three sections: Friends, Following, and Everyone Else
*/
class FriendList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      friendRequests: [],
      friends: []
    };
  }
  componentDidMount() {
    this.getFriendsAndFriendRequests();
  }

  getFriendRequests() {
    fetch(`${URL_PREFIX}/friendrequest/`, {
      method: 'GET',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${this.props.user.username}:${this.props.user.password}`)}`
      }
    })
    .then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then(res => res.json())
    .then(res => {
      this.setState({
        friendRequests: res
      });
    })
    .catch(err => {
      console.log(err, 'Could not get friend requests');
    });
  }

  getFriends() {
    fetch(`${URL_PREFIX}/author/${getUUIDFromId(this.props.user.id)}/`, {
      method: 'GET',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${this.props.user.username}:${this.props.user.password}`)}`
      }
    })
    .then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      this.setState({
        friends: res.friends
      });
    })
    .catch(err => {
      console.log(err, 'Could not get friends');
    });
  }

  getFriendsAndFriendRequests() {
    this.getFriendRequests();
    this.getFriends();
  }

  getEveryoneElse() {
    const everyoneElse = [];
    const friendIds = this.state.friends.map(friend => friend.id);
    const friendRequestIds = this.state.friendRequests.map(friend => friend.id);
    for (const author of this.props.authors) {
      if (friendIds.indexOf(author.id) < 0 && friendRequestIds.indexOf(author.id) < 0) {
        everyoneElse.push(author);
      }
    }
    return everyoneElse;
  }

  render() {
    return (
      <div className='friend-page'>
        <h2>Friend Requests</h2>
        <ListGroup className='friend-list'>
          {this.state.friendRequests.map(friend => {
            const followUser = () => {
              this.props.followUser(friend)
                .then(() => this.getFriendsAndFriendRequests());
            };
            return (
              <ListGroupItem>
                {friend.displayName}
                <Button onClick={followUser}>
                  <Glyphicon glyph='ok'/>
                </Button>
              </ListGroupItem>
            );
          })}
        </ListGroup>
        <h2>Friends</h2>
        <ListGroup className='friend-list'>
          {this.state.friends.map(friend => {
            const unfollowUser = () => {
              this.props.unfollowUser(friend)
                .then(() => this.getFriendsAndFriendRequests());
            };
            return (
              <ListGroupItem>
                {friend.displayName}
                <Button onClick={unfollowUser}>
                  <Glyphicon glyph='remove'/>
                </Button>
              </ListGroupItem>
            );
          })}
        </ListGroup>
        <h2>Authors</h2>
        <ListGroup className='friend-list'>
          {this.getEveryoneElse().map(author => {
            const followUser = () => {
              this.props.followUser(author)
                .then(() => this.getFriendsAndFriendRequests());
            };
            return (
              <ListGroupItem>
                {author.displayName}
                <Button onClick={followUser}>
                  <Glyphicon glyph='ok'/>
                </Button>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </div>
    );
  }
}

FriendList.propTypes = {
  authors: PropTypes.array.isRequired,
  followUser: PropTypes.func.isRequired,
  unfollowUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      user: stateProps.app.user,
      authors: stateProps.users
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user, authors} = stateProps;
    const {dispatch} = dispatchProps;

    return {
      authors: authors,
      user: user,
      followUser: function(otherUser) {
        return dispatch(actions.toggleFollowStatus(user, otherUser, false));
      },
      unfollowUser: function(otherUser) {
        return dispatch(actions.toggleFollowStatus(user, otherUser, true));
      }
    };
  })(FriendList);