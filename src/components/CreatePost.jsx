import React, {Component, PropTypes} from 'react';
import {FormControl, ButtonToolbar, ButtonGroup, Button, Glyphicon, Radio} from 'react-bootstrap';
import Select from 'react-select';
import Markdown from 'react-markdown';
import 'react-select/dist/react-select.css';
import * as actions from '../actions';
import {connect} from 'react-redux';

/*
* Component for creating a new post, has multiple input fields to specify options
*/
class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleContentTypeChange = this.handleContentTypeChange.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handlePermissionChange = this.handlePermissionChange.bind(this);
    this.contentText = this.contentText.bind(this);
    this.postEditButton = this.postEditButton.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  getInitialState() {
    return {
      permission: this.props.permission ? this.props.permission : 'PUBLIC',
      title: this.props.title ? this.props.title : "",
      description: this.props.description ? this.props.description : "",
      content: this.props.content ? this.props.content : "",
      contentType: this.props.contentType ? this.props.contentType : 'text/plain' ,
      image: null,
      user_with_permission:[],
    };
  }

  handleTitleChange(event) {
    this.setState({
      title: event.target.value
    });
  }

  handleContentChange(event) {
    this.setState({
      content: event.target.value
    });
  }

  handleDescriptionChange(event) {
    this.setState({
      description: event.target.value
    });
  }

  handleImageUpload(event) {
    this.setState({
      image: event.target.files[0]
    });
  }

  handleContentTypeChange(event) {
    this.setState({
      contentType: event.target.value
    });
  }

  handlePost() {
    if (this.state.content) {
      this.props.addPost({
        content: this.state.content,
        title: this.state.title,
        description: this.state.description,
        contentType: this.state.contentType,
        permission: this.state.permission,
        image: this.state.image,
        user_with_permission: [],
        "comments": []
      });
      this.setState(this.getInitialState());
    }
  }

  handleUpdate() {
    if (this.state.content) {
      this.props.updatePost({
        content: this.state.content,
        title: this.state.title,
        description: this.state.description,
        contentType: this.state.contentType,
        permission: this.state.permission,
        image: this.state.image,
        id: this.props.id
      });
      this.setState(this.getInitialState());
    }
  }

  handlePermissionChange(obj) {
    this.setState({
      permission: obj.value
    });
  }

  contentText (){
    if (this.state.contentType == "text/plain"){
      return(
          <FormControl
            componentClass="textarea"
            type='text'
            value={this.state.content}
            placeholder='Whats on your mind?'
            onChange={this.handleContentChange}/>
      );
    }else{
      return(
          <FormControl
            componentClass="textarea"
            value={this.state.content}
            placeholder='Whats on your mind?'
            onChange={this.handleContentChange}
          />
      );
    }
  }

  postEditButton () {
    if(this.props.isEdit) {
      return (<Button
              onClick={this.handleUpdate}>
              Edit
            </Button>);
    }
    return (<Button
              onClick={this.handlePost}>
              Post
            </Button>);
  }

  render() {
    const options = [
      {
        value: 'PUBLIC',
        label: 'Public'
      }, {
        value: 'FRIENDS',
        label: 'Friends'
      }, {
        value: 'PRIVATE',
        label: 'Self'
      }, {
        value: 'SERVERONLY',
        label: 'Server Only'
      }
    ];

    return (
      <div className='create-post'>
        <FormControl
          type='text'
          value={this.state.title}
          placeholder='Subject'
          onChange={this.handleTitleChange}/>
        {this.contentText()}
        <FormControl
          type='text'
          value={this.state.description}
          placeholder='Description...'
          onChange={this.handleDescriptionChange}/>
        <input
          accept='image/png,image/jpeg'
          type='file'
          onChange={this.handleImageUpload}
          />
        <ButtonToolbar className='post-options'>
          <ButtonGroup className='post-formats'>
            <Radio
              checked={this.state.contentType === 'text/plain'}
              inline={true}
              onChange={this.handleContentTypeChange}
              value='text/plain'>
              Plain Text
            </Radio>
            <Radio
              checked={this.state.contentType === 'text/markdown'}
              inline={true}
              onChange={this.handleContentTypeChange}
              value='text/markdown'>
              Markdown
            </Radio>
          </ButtonGroup>
          <div className='buttons'>
            <Select
              name='permissions'
              onChange={this.handlePermissionChange}
              options={options}
              value={this.state.permission}
            />
            {this.postEditButton()}
          </div>
        </ButtonToolbar>
      </div>
    );
  }
}

CreatePost.propTypes = {
  addPost: PropTypes.func.isRequired,
  content: PropTypes.string,
  contentType: PropTypes.string,
  description: PropTypes.string,
  id: PropTypes.string,
  isEdit: PropTypes.bool.isRequired,
  permission: PropTypes.string,
  title: PropTypes.string,
  updatePost: PropTypes.func.isRequired,
};

export default connect(
  function(stateProps, ownProps) {
    return {
      user: stateProps.app.user
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user} = stateProps;
    const {dispatch} = dispatchProps;

    return {
      ...ownProps,
      addPost: function(post) {
        dispatch(actions.addPost(post, user));
      },
      updatePost: function(post) {
        dispatch(actions.updatePost(post, user));
      }
    };
  })(CreatePost);