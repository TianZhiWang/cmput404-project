import React, { Component, PropTypes } from 'react';
import Comment from './Comment';

class CommentList extends Component {
  render() {

    return (
      <div className='comment-list'>
        {this.props.comments.map(comment => <Comment {...comment} />)}
      </div>
    );
  }
}

CommentList.propTypes = {
  comments: PropTypes.array.isRequired
};

export default CommentList;
