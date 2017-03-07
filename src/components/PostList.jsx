import React, {Component, PropTypes} from 'react';
import Post from './Post';

class PostList extends Component {
  render() {
    return (
      <div className='post-list'>
        {this.props.posts.map(post => (
          <Post key={post.id}
            addComment={this.props.addComment}
            {...post}
          />
        ))}
      </div>
    );
  }
}

PostList.propTypes = {
  addComment: PropTypes.func.isRequired,
  posts: PropTypes.array.isRequired
};

export default PostList;