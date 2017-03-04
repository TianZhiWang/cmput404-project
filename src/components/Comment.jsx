import React, { Component, PropTypes } from 'react';

class Comment extends Component {
  render() {

    return (
      <div className='comment'>
        <p><strong>{this.props.author}</strong>{this.props.text}</p>
      </div>
    );
  }
}

Comment.propTypes = {
  author: PropTypes.string.isRequired,    
  text: PropTypes.string.isRequired
};

export default Comment;
