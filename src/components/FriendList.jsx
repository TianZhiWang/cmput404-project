import React, {Component, PropTypes} from 'react';
import FriendListItem from './FriendListItem';
import {ListGroup, ListGroupItem, Button, Glyphicon} from 'react-bootstrap';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {getUUIDFromId, basicAuthFetch} from '../utils';

/*
* Renders a list of friends in three sections: Friends, Following, and Everyone Else
*/
class FriendList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      friendRequests: [],
      friends: [],
      authors: [],
      loading: true
    };
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
    for (const author of this.props.authors) {
      if (friendIds.indexOf(author.id) < 0 && friendRequestIds.indexOf(author.id) < 0 && author.id != this.props.user.id) {
        everyoneElse.push(author);
      }
    }
    return everyoneElse;
  }

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>;
    }
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
      user: stateProps.app.user
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user} = stateProps;
    const {dispatch} = dispatchProps;

    return {
      user: user,
      followUser: function(otherUser) {
        return dispatch(actions.toggleFollowStatus(user, otherUser, false));
      },
      unfollowUser: function(otherUser) {
        return dispatch(actions.toggleFollowStatus(user, otherUser, true));
      }
    };
  })(FriendList);