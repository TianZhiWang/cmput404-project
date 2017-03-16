import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl} from 'react-bootstrap';
import CommentList from './CommentList';
import Markdown from 'react-markdown';

/*
* Represents a post component with comments optionally
*/
class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newCommentText: ''
    };

    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleChangeComment = this.handleChangeComment.bind(this);
    this.textTypehandler = this.textTypehandler.bind(this);
    this.deleteButtonHandler = this.deleteButtonHandler.bind(this);
    this.handleDeletePost = this.handleDeletePost.bind(this);
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
  handleDeletePost(){
    const post = {
      id : this.props.id,
      author : this.props.author
    };
    this.props.deletePost(post);
  }

  deleteButtonHandler(){
    if (this.props.user.id == this.props.author.id){
      return <Button bsStyle="danger" 
      onClick = {this.handleDeletePost} >delete </Button>;
    }
  }

  render() {
    return (
      <div className='post'>
          <div className='post-header'>
            <h4>
              {this.props.author.displayName}
            </h4>
            <div className='post-body'>
              {this.props.title}
            </div>
            {this.textTypehandler()}
            <div className='post-body'>
              {this.props.description}
            </div>
            {this.deleteButtonHandler()}

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
  deletePost: PropTypes.func.isRequired,
  description: PropTypes.string,
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
};

export default Post;