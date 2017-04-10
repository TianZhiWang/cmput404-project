/*
MIT License

Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, Josh Deng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
    this.state = {};

    this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
    this.handleGithubChange = this.handleGithubChange.bind(this);
    this.handleSubmitProfile = this.handleSubmitProfile.bind(this);
    this.filterPosts = this.filterPosts.bind(this);
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
    return this.props.posts.filter(function(post) {
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
            placeholder="Update display Name..." />
          <FormControl
            type="text"
            name="github"
            onChange={this.handleGithubChange}
            placeholder="Update github url..." />
          <div className="submit">
            <Button
              onClick={this.handleSubmitProfile}>
              Update
            </Button>
          </div>
        </div>
      );
    };

    return (
      <div className='profile'>
        <div className='profile-head'>
          <h2>{this.props.user.displayName}'s Profile</h2>
          <p><i className="fa fa-id-card"/> {this.props.user.username}</p>        
          <p><i className="fa fa-link"/> <a href={this.props.user.id}>{this.props.user.id}</a></p>
          {this.props.user.github ? <p><i className="fa fa-github-alt"/><a href={this.props.user.github}> {this.props.user.github}</a></p> : <noscript/>}
          {updateForm()}
        </div>
        <PostList posts={this.filterPosts()}/>
      </div>
    );
  }
}

Profile.propTypes = {
  attemptUpdateProfile: PropTypes.func.isRequired,
  currentuser: PropTypes.object.isRequired,
  posts: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      posts: stateProps.posts,
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