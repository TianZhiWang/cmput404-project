import React, {Component, PropTypes} from 'react';
import {FormControl, ButtonToolbar, ButtonGroup, Button, Glyphicon, Radio} from 'react-bootstrap';
import {PERMISSIONS} from '../constants';
import Select from 'react-select';
import Markdown from 'react-markdown';
import 'react-select/dist/react-select.css';

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
    this.handlePermissionChange = this.handlePermissionChange.bind(this);
    this.contentText = this.contentText.bind(this);
  }

  getInitialState() {
    return {
      permission: PERMISSIONS.FRIENDS.value,
      title: '',
      description: '',
      content: '',
      contentType: 'text/plain'
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

  handleImageUpload() {
    // handle image upload
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
        // user_with_permission: this.state.user_with_permission
        "comments": []
      });

      this.setState(this.getInitialState());
    }
  }

  handlePermissionChange(event) {
    this.setState({
      permission: event.value,
      user_with_permission: event.user
    });
  }
  contentText (){
    if (this.state.contentType == "text/plain"){
      return(
          <FormControl
            type='text'
            value={this.state.content}
            placeholder='Whats on your mind?'
            onChange={this.handleContentChange}/>
      );
    }else{
      return(
          <FormControl
            value={this.state.content}
            placeholder='Whats on your mind?'
            onChange={this.handleContentChange}
          />
      );
    }
  }

  render() {

    const staticOptions = [
      {
        value: PERMISSIONS.FRIENDS.value,
        label: PERMISSIONS.FRIENDS.label
      }, {
        value: PERMISSIONS.PUBLIC.value,
        label: PERMISSIONS.PUBLIC.label,
      }, {
        value: PERMISSIONS.FRIENDS_OF_FRIENDS.value,
        label: PERMISSIONS.FRIENDS_OF_FRIENDS.label
      }, {
        value: PERMISSIONS.SELF.value,
        label: PERMISSIONS.SELF.label
      }
    ];
    const options = [
      ...staticOptions,
      ...this.props.users.map(user => ({
        label: user.username,
        value: PERMISSIONS.USER.value,
        user: user.id
      }))
    ];
    return (
      <div className='create-post'>
        <FormControl
          type='text'
          value={this.state.title}
          placeholder='title'
          onChange={this.handleTitleChange}/>
        {this.contentText()}
        <FormControl
          type='text'
          value={this.state.description}
          placeholder='description?'
          onChange={this.handleDescriptionChange}/>

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
            <Button
              onClick={this.handleImageUpload}>
              <Glyphicon glyph='picture'/>
            </Button>
            <Button
              onClick={this.handlePost}>
              Post
            </Button>
          </div>
        </ButtonToolbar>
      </div>
    );
  }
}

CreatePost.propTypes = {
  addPost: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
};

export default CreatePost;