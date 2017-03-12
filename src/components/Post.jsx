import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl} from 'react-bootstrap';
import CommentList from './CommentList';
import Markdown from 'react-markdown';

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newCommentText: ''
    };

    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleChangeComment = this.handleChangeComment.bind(this);
    this.textTypehandler = this.textTypehandler.bind(this);
  }

  handleAddComment() {
    if (this.state.newCommentText) {
      this.props.addComment(this.state.newCommentText, this.props.id, this.props.comments.length);
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

  textTypehandler(){
    if (this.props.contentType == "plaintext"){
      return(
        <div className='post-body'>
          {this.props.content}
        </div>
      );
    }else{
      return(
        <Markdown
          source={this.props.content}
          escapeHtml
        />
      );
    }
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
            {this.textTypehandler()}
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
  contentType: PropTypes.string.isRequired,  
  description: PropTypes.string,
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired
};

export default Post;