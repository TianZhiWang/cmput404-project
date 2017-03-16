import React, { Component, PropTypes } from 'react';

/*
* Renders a basic comment component with comment text and author
*/
class Comment extends Component {
  render() {
    return (
      <div className='comment'>
        <p><strong className='author-name'>{this.props.author.displayName}</strong>{this.props.comment}</p>
      </div>
    );
  }
}

Comment.propTypes = {
  author: PropTypes.object.isRequired,    
  comment: PropTypes.string.isRequired
};

export default Comment;
