import React, {Component, PropTypes} from 'react';
import FriendListItem from './FriendListItem';
import {ListGroup, ListGroupItem, Button, Glyphicon} from 'react-bootstrap';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {getUUIDFromId, basicAuthFetch} from '../utils';

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

  createUserList(className, users, onClick, glyph) {
    return (
      <ListGroup className={className}>
          {users.map(user => {
            const handleClick = () => {
              onClick(user)
              .then(() => this.getFriendsAndFriendRequests());
            };
            return (
              <ListGroupItem key={user.id}>
                {user.displayName}
                <Button onClick={handleClick}>
                  <Glyphicon glyph={glyph}/>
                </Button>
              </ListGroupItem>
            );
          })}
        </ListGroup>
    );
  }

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>;
    }
    return (
      <div className='friend-page'>
        <h2>Friend Requests</h2>
        {this.createUserList('request-list', this.state.friendRequests, this.props.followUser, 'ok')}
        <h2>Friends</h2>
        {this.createUserList('friend-list', this.state.friends, this.props.unfollowUser, 'remove')}
        <h2>Authors</h2>
        {this.createUserList('author-list', this.getEveryoneElse(), this.props.followUser, 'ok')}
      </div>
    );
  }
}

FriendPage.propTypes = {
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
  })(FriendPage);