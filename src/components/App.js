import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Container from './Container';
import UserAccount from './UserAccount';
import '../../style/style.scss';
import * as actions from '../actions';

/*
* The root component, renders container if logged in or the login page otherwise
*/
class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.loggedIn){
      return (
        <Container
          activeTab={this.props.activeTab}
          addComment={this.props.addComment}
          addPost={this.props.addPost}
          toggleFollowStatus={this.props.toggleFollowStatus}
          getUsers={this.props.getUsers}
          loadPosts={this.props.loadPosts}
          posts={this.props.posts}
          switchTabs={this.props.switchTabs}
          users={this.props.users}
          user = {this.props.user}
          deletePost = {this.props.deletePost}
        />
      );
    } else {
      return (
        <UserAccount
          attemptLogin={this.props.attempLogin}
          attemptRegister={this.props.attemptRegister}
          loggedInFail={this.props.loggedInFail}
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
  deletePost: PropTypes.func.isRequired,  
  getUsers: PropTypes.func.isRequired,
  loadPosts: PropTypes.func.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  loggedInFail: PropTypes.bool,
  posts: PropTypes.array.isRequired,
  switchTabs: PropTypes.func.isRequired,
  toggleFollowStatus: PropTypes.func.isRequired,
  user: PropTypes.object,
  users: PropTypes.array.isRequired
};

/*
* Connects the component to the app state, also specifies action that can be used to update the state
*/
export default connect(
  function(stateProps, ownProps) {
    return {
      posts: stateProps.posts,
      users: stateProps.users,
      loggedIn: stateProps.app.loggedIn,
      loggedInFail: stateProps.app.loggedInFail,
      user: stateProps.app.user,
      activeTab: stateProps.app.activeTab
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {users} = stateProps;
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
      },
      getUsers: function() {
        dispatch(actions.getUsers(user));
      },
      toggleFollowStatus: function(otherUser) {
        dispatch(actions.toggleFollowStatus(user, otherUser));
      },
      deletePost: function(post) {
        dispatch(actions.deletePost(post,user));

      }
    };
  })(App);
