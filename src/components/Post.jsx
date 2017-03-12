import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl} from 'react-bootstrap';
import CommentList from './CommentList';

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newCommentText: ''
    };

    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleChangeComment = this.handleChangeComment.bind(this);
  }

  handleAddComment() {
    if (this.state.newCommentText) {
      this.props.addComment(this.state.newCommentText, this.props.id);
      this.setState({
        newCommentText: ''
      });
    }
  }

  handleChangeComment(event) {
    this.setState({
      newCommentText: event.target.value
    });
  }

  render() {
    return (
      <div className='post'>
          <div className='post-header'>
            <h4>
              {this.props.author.username}
            </h4>
            <div className='post-body'>
              {this.props.title}
            </div>
            <div className='post-body'>
              {this.props.content}
            </div>
            <div className='post-body'>
              {this.props.description}
            </div>

          </div>
          <div className='post-footer'>
              <CommentList comments={this.props.comments}/>
              <div className='add-comment'>
                <FormControl
                  type="text"
                  value={this.state.newCommentText}
                  placeholder="Add a comment"
                  onChange={this.handleChangeComment}
                />
                <Button
                  onClick={this.handleAddComment}>
                  Add Comment
                </Button>
              </div>
          </div>
      </div>
    );
  }
}

Post.propTypes = {
  addComment: PropTypes.func.isRequired,
  author: PropTypes.object.isRequired,
  comments: PropTypes.array,   
  content: PropTypes.string.isRequired,
  description: PropTypes,
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired
};

export default Post;