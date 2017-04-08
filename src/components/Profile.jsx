import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, FormControl } from 'react-bootstrap';
import * as actions from '../actions';
import PostList from './PostList';
import {basicAuthFetch, getUUIDFromId} from '../utils';

/*
* Renders a author profile page
*/
class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };

    this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
    this.handleGithubChange = this.handleGithubChange.bind(this);
    this.handleSubmitProfile = this.handleSubmitProfile.bind(this);
    this.filterPosts = this.filterPosts.bind(this);
  }

  componentDidMount() {
    basicAuthFetch('GET', `/author/${getUUIDFromId(this.props.user.id)}/posts/`, this.props.currentuser)
    .then(posts => {
      this.setState({posts});
    });
  }

  handleDisplayNameChange(event) {
    this.setState({
      displayName: event.target.value
    });
  }

  handleGithubChange(event) {
    this.setState({
      github: event.target.value
    });
  }

  handleSubmitProfile() {
    const update = Object.assign({},this.props.user);
    if(this.state.github) {
      update.github = this.state.github;
    }
    if(this.state.displayName) {
      update.displayName = this.state.displayName;
    }
    this.props.attemptUpdateProfile(update);
  }

  filterPosts() {
    const user = this.props.user.id;
    return this.state.posts.filter(function(post) {
      return post.author.id === user;
    });
  }

  render() {
    const updateForm = () => {
      if(this.props.currentuser.id !== this.props.user.id) {
        return <noscript/>;
      }

      return (
        <div>
          <FormControl
            type="text"
            name="displayname"
            onChange={this.handleDisplayNameChange}
            placeholder="DisplayName" />
          <FormControl
            type="text"
            name="github"
            onChange={this.handleGithubChange}
            placeholder="GitHubEmail" />
          <Button
            onClick={this.handleSubmitProfile}>
            Submit
          </Button>
        </div>
      );
    };

    return (
      <div className='profile'>
        <h1>{this.props.user.displayName}'s Profile</h1>
        <p>Display Name: {this.props.user.displayName}</p>        
        <p>Id: {this.props.user.id}</p>
        {updateForm()}
        <PostList posts={this.filterPosts()}/>
      </div>
    );
  }
}

Profile.propTypes = {
  attemptUpdateProfile: PropTypes.func.isRequired,
  currentuser: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      currentuser: stateProps.app.user,
      user: stateProps.app.viewUser
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {dispatch} = dispatchProps;
    
    return {
      ...stateProps,
      attemptUpdateProfile: function(update) {
        dispatch(actions.attemptUpdateProfile(update));
      }
    };
  })(Profile);