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
      this.props.addComment(this.state.newCommentText, this.props.id, `${this.props.author.host}posts/${this.props.id}/comments/`);
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

  // http://stackoverflow.com/a/33580254 joemaddalone (http://stackoverflow.com/users/1042510/joemaddalone) MIT
  // Edited by Tian Zhi Wang
  renderNewLines(content) {
    const br = React.createElement('br');
    const regex = /(<br \/>)/g;
    return content.replace(/\n/g,"<br />").split(regex).map(function(line, index) {
      return line.match(regex) ? <br key={`key_${index}`} /> : line;
    });
  }

  textTypehandler(){
    if (this.props.contentType === "text/plain"){
      return(
        <div className='post-body'>
          { this.renderNewLines(this.props.content) }
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
      onClick={this.handleDeletePost} ><i className="fa fa-trash"/></Button>;
    }
  }

  editButtonHandler(){
    if (this.props.user.id == this.props.author.id){
      return <Button 
      onClick = {this.showModal} ><i className="fa fa-pencil"/></Button>;
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

            <div className="post-banner">
              <h4 onClick={this.showProfile}>
                <a>{this.props.author.displayName}</a>
              </h4>
              <div className="buttons">
                {this.editButtonHandler()}
                {this.deleteButtonHandler()}                
              </div>
            </div>

            <div className='post-body'>
              <strong>{this.props.title}</strong>
            </div>
            {this.textTypehandler()}
            <div className='post-body description'>
              {this.props.description}
            </div>
          </div>
          <div className='post-footer'>
              <CommentList comments={this.props.comments}/>
              <div className='add-comment'>
                <FormControl
                  type="text"
                  value={this.state.newCommentText}
                  placeholder="Write a comment..."
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
            id={this.props.id}
            hideModal={this.hideModal}/>
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