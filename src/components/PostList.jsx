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
  user: PropTypes.object.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      posts: stateProps.posts,
      users: stateProps.users,
      user: stateProps.app.user
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
      addComment: function(text, postId, postOrigin) {
        dispatch(actions.addComment(text, postId, postOrigin, user));
      },
      loadPosts: function() {
        dispatch(actions.loadPosts(user));
      },
      deletePost: function(post) {
        dispatch(actions.deletePost(post,user));
      }
    };
  })(PostList);
