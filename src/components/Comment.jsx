import React, { Component, PropTypes } from 'react';

class Comment extends Component {
  render() {
    return (
      <div className='comment'>
        <p><strong className='author-name'>{this.props.author.name}</strong>{this.props.comment}</p>
      </div>
    );
  }
}

Comment.propTypes = {
  author: PropTypes.object.isRequired,    
  comment: PropTypes.string.isRequired
};

export default Comment;
