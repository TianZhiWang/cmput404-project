import React, {Component, PropTypes} from 'react';
import Post from './Post';

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
            toggleFollowStatus={this.props.toggleFollowStatus}
            addComment={this.props.addComment}
            author={post.author}
            contentType = {post.contentType}
            user = {this.props.user}
            deletePost = {this.props.deletePost}
            image = {post.image}
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
  toggleFollowStatus: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,

};

export default PostList;