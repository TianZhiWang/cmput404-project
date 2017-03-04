import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl} from 'react-bootstrap';
import CommentList from './CommentList';

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      commentText: ''
    };

    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleChangeComment = this.handleChangeComment.bind(this);
  }

  handleAddComment() {
    // Add a comment
  }

  handleChangeComment(event) {
    this.setState({
      commentText: event.target.value
    });
  }

  render() {
    return (
      <div className='post'
        key={this.props.id}>
        <Panel>
            <div className='poster-header'>
                {this.props.username}
            </div>
            <div className='post-body'>
                {this.props.postText}
            </div>
            <div className='post-footer'>
                <CommentList comments={this.props.comments}/>
                <FormControl
                  type="text"
                  value={this.state.commentText}
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
  comments: PropTypes.array,   
  id: PropTypes.number.isRequired,
  postText: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

export default Post;