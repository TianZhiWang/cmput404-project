import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl, Modal} from 'react-bootstrap';
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
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.imageHandler = this.imageHandler.bind(this);
  }

  handleAddComment() {
    if (this.state.newCommentText) {
      this.props.addComment(this.state.newCommentText, this.props.id, this.props.origin);
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
    if (this.props.contentType == "text/plain"){
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

  imageHandler(){
    if (this.props.image!="NO_IMAGE"){
      return <div><img src={this.props.image}/></div>
    }
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
            {this.imageHandler()}
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
          <Modal
            show={this.state.show}
            onHide={this.hideModal}
            container={this}
            aria-labelledby="contained-modal-title"
          >
            <Profile toggleFollowStatus={this.props.toggleFollowStatus}
              currentuser={this.props.user} 
              user={this.props.author}/>
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
  title: PropTypes.string.isRequired,
  toggleFollowStatus: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  image: PropTypes.string.isRequired
};

export default Post;