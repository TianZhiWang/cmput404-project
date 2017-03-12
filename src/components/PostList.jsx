import React, {Component, PropTypes} from 'react';
import Post from './Post';

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
            contentType = {post.contentType}
            {...post}
          />
        ))}
      </div>
    );
  }
}

PostList.propTypes = {
  addComment: PropTypes.func.isRequired,
  loadPosts: PropTypes.func.isRequired,
  posts: PropTypes.array.isRequired,
};

export default PostList;