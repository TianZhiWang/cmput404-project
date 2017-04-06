import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl} from 'react-bootstrap';
import CommentList from './CommentList';
import Markdown from 'react-markdown';
import Profile from './Profile';
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
    this.shareableURLHandler = this.shareableURLHandler.bind(this);
  }

  handleAddComment() {
    if (this.state.newCommentText) {
      this.props.addComment(this.state.newCommentText, this.props.id, this.props.origin);
      this.setState({
        newCommentText: ''
      });
    }
  }

  componentWillMount(){
    new Clipboard('.copyBtn');
  }
  handleChangeComment(event) {
    this.setState({
      newCommentText: event.target.value
    });
  }

  textTypehandler(){
    if (this.props.contentType === "text/plain"){
      return(
        <div className='post-body'>
          {this.props.content}
        </div>
      );
    } else if (this.props.contentType === "text/markdown"){
      return(
        <Markdown
          source={this.props.content}
          escapeHtml
        />
      );
    } else {
      return(
        <img src={this.props.content}/>
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

  shareableURLHandler(){
    // console.log(!!!)
    const textFieldId = `url${this.props.id}`;
    const textFieldHash = `#${textFieldId}`;
 

    if (this.props.unlisted==true){
      return (
             <div>
                  <input id={textFieldId}
                  readOnly 
                  value={`${this.props.author.host.replace("8000","8080")}?id=${this.props.id}`}/>
                  <button className="copyBtn" 
                   data-clipboard-target={textFieldHash}>
                      copy
                  </button>
            </div>);
    }
  }

  render() {
    return (
      <div className='post'>
          <div className='post-header'>
            <h4 onClick={this.showModal}>
              {this.props.author.displayName}
            </h4>
            <div className='post-body'>
              {this.props.title}
            </div>
            {this.textTypehandler()}
            <div className='post-body'>
              {this.props.description}
            </div>
            {this.shareableURLHandler()}
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
  id: PropTypes.string.isRequired,
  origin: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  unlisted:PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default Post;