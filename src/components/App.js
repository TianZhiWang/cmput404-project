import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col} from 'react-bootstrap';
import CreatePost from './CreatePost';
import FriendList from './FriendList';
import PostList from './PostList';
import Sidebar from './Sidebar';
import UserAccount from './UserAccount';
import '../../style/style.scss';
import * as actions from '../actions';


class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const contentPosts = () => (
        <Col md={9}>
          <CreatePost
            addPost={this.props.addPost}
            users={[]}

          />
          <PostList
            posts={this.props.posts}
            addComment={this.props.addComment}
            loadPosts={this.props.loadPosts}
          />
        </Col>
      );
    const contentFriends = () => (
        <Col md={9}>
          <FriendList
            friends={this.props.friends.friendList}
            friendRequests={this.props.friends.friendRequests}
          />
        </Col>
    );
    if (this.props.loggedIn){
      return (
        <div className='coolbears-app'>
          <Grid>
            <Row>
              <Col md={3}>
                <Sidebar
                  activeTab={this.props.activeTab}
                  switchTabs={this.props.switchTabs} />
              </Col>
              {this.props.activeTab === 'stream' ? contentPosts(): contentFriends()}
            </Row>
          </Grid>
        </div>
      );
    }else{
      return (
        <UserAccount
          attemptLogin={this.props.attempLogin}
          attemptRegister={this.props.attemptRegister}
        />
      );
    }
  }
}

App.propTypes = {
  activeTab: PropTypes.string.isRequired,
  addComment: PropTypes.func.isRequired,
  addPost: PropTypes.func.isRequired,
  attempLogin: PropTypes.func.isRequired,
  attemptRegister: PropTypes.func.isRequired,
  friends: PropTypes.object.isRequired,
  loadPosts: PropTypes.func.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  posts: PropTypes.array.isRequired,
  switchTabs: PropTypes.func.isRequired
};

// TODO: Move this into seperate file as container
export default connect(
  function(stateProps, ownProps) {
    return {
      posts: stateProps.posts,
      friends: stateProps.friends,
      loggedIn: stateProps.app.loggedIn,
      user: stateProps.app.user,
      activeTab: stateProps.app.activeTab
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user} = stateProps;
    const {dispatch} = dispatchProps;
    return {
      ...stateProps,
      ...ownProps,
      addComment: function(text, postId) {
        dispatch(actions.addComment(text, postId, user));
      },
      addPost: function(post) {
        dispatch(actions.addPost(post, user));
      },
      loadPosts: function() {
        dispatch(actions.loadPosts(user));
      },
      attempLogin: function(username, password) {
        dispatch(actions.attempLogin(username, password));
      },
      attemptRegister: function(username, password) {
        dispatch(actions.attemptRegister(username, password));
      },
      switchTabs: function(tab) {
        dispatch(actions.switchTabs(tab));
      }
    };
  })(App);
