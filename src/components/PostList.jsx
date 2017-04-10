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
import React, {Component, PropTypes} from 'react';
import Post from './Post';
import {connect} from 'react-redux';
import * as actions from '../actions';

/*
* Renders a list of posts
*/
class PostList extends Component {
  componentDidMount() {
    this.props.loadPosts();
  }
  render() {
    return (
      <div className='post-list'>
        {this.props.posts.map(post => (
          <Post key={post.id}
            addComment={this.props.addComment}
            author={post.author}
            contentType={post.contentType}
            user={this.props.user}
            deletePost={this.props.deletePost}
            image={post.image}
            switchTabs={this.props.switchTabs}
            {...post}
          />
        ))}
      </div>
    );
  }
}

PostList.propTypes = {
  addComment: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  loadPosts: PropTypes.func.isRequired,
  posts: PropTypes.array.isRequired,
  switchTabs: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      posts: stateProps.posts,
      user: stateProps.app.user,
      ...ownProps
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user} = stateProps;
    const {dispatch} = dispatchProps;
    return {
      ...stateProps,
      ...ownProps,
      addComment: function(text, postId, postOrigin) {
        dispatch(actions.addComment(text, postId, postOrigin, user));
      },
      loadPosts: function() {
        dispatch(actions.loadPosts(user));
      },
      deletePost: function(post) {
        dispatch(actions.deletePost(post,user));
      },
      switchTabs: function(tab, user) {
        dispatch(actions.switchTabs(tab, user));
      },
    };
  })(PostList);
