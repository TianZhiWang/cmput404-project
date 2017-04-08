import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl, Modal} from 'react-bootstrap';
import CommentList from './CommentList';
import Markdown from 'react-markdown';
import Profile from './Profile';
import CreatePost from './CreatePost';
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
    this.editButtonHandler = this.editButtonHandler.bind(this);
    this.handleDeletePost = this.handleDeletePost.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.showProfile = this.showProfile.bind(this);
  }

  handleAddComment() {
    if (this.state.newCommentText) {
      this.props.addComment(this.state.newCommentText, this.props.id, `${this.props.author}/posts/${this.props.id}/comments/`);
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

  editButtonHandler(){
    if (this.props.user.id == this.props.author.id){
      return <Button 
      onClick = {this.showModal} >edit</Button>;
    }
  }

  showProfile(){
    this.props.switchTabs('profile', this.props.author);
  }

  showModal() {
    this.setState({show:true});
  }

  hideModal() {
    this.setState({show:false});
  }

  render() {
    return (
      <div className='post'>
          <div className='post-header'>
            <h4 onClick={this.showProfile}>
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
            {this.editButtonHandler()}
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
          <Modal
             show={this.state.show}
             onHide={this.hideModal}
             container={this}
             aria-labelledby="contained-modal-title"
          ><CreatePost isEdit={true} 
            content={this.props.content}
            contentType={this.props.contentType}
            description={this.props.description}
            title={this.props.title}
            id={this.props.id}/>
          </Modal>
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
  switchTabs: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
};

export default Post;