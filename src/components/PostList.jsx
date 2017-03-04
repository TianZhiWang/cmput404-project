import React, {Component, PropTypes} from 'react';
import Post from './Post';

class PostList extends Component {
  render() {
    return (
      <div className='post-list'>
        {this.props.posts.map(post => <Post key={post.id} {...post}/>)}
      </div>
    );
  }
}

PostList.propTypes = {
  posts: PropTypes.array.isRequired
};

export default PostList;