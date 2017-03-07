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
        <Panel>
            <div className='poster-header'>
                {this.props.author.name}
            </div>
            <div className='post-body'>
                {this.props.text}
            </div>
            <div className='post-footer'>
                <CommentList comments={this.props.comments}/>
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
        </Panel>
      </div>
    );
  }
}

Post.propTypes = {
  addComment: PropTypes.func.isRequired,
  author: PropTypes.object.isRequired,
  comments: PropTypes.array,   
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

export default Post;