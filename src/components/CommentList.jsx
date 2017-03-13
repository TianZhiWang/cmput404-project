import React, { Component, PropTypes } from 'react';
import Comment from './Comment';

/*
* Renders a list of Comment components
*/
class CommentList extends Component {
  render() {

    return (
      <div className='comment-list'>
        {this.props.comments.map(comment => (
          <Comment key={comment.id}
            {...comment}
          />
        ))}
      </div>
    );
  }
}

CommentList.propTypes = {
  comments: PropTypes.array.isRequired
};

export default CommentList;
