/*
MIT License

Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, Josh Deng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
    this.renderImageUpload = this.renderImageUpload.bind(this);
  }

  getInitialState() {
    let contentType = this.props.contentType ? this.props.contentType : 'text/plain';
    contentType = contentType.startsWith('image') ? 'image' : contentType;
    return {
      permission: this.props.permission ? this.props.permission : 'PUBLIC',
      title: this.props.title ? this.props.title : "",
      description: this.props.description ? this.props.description : "",
      content: this.props.content ? this.props.content : "",
      contentType: contentType,
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
    if(this.state.contentType === 'image') { //If image clear content
      this.setState({
        content: ''
      });
    }
    this.setState({
      contentType: event.target.value
    });
  }

  handlePost() {
    if (this.state.content || this.state.image) {
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
      this.props.hideModal();
      this.setState(this.getInitialState());
    }
  }

  handlePermissionChange(obj) {
    this.setState({
      permission: obj.value
    });
  }

  contentText (){
    if (this.state.contentType === "text/plain"){
      return(
          <FormControl
            componentClass="textarea"
            type='text'
            value={this.state.content}
            placeholder='Whats on your mind?'
            onChange={this.handleContentChange}/>
      );
    } else if (this.state.contentType === "text/markdown") {
      return(
          <FormControl
            componentClass="textarea"
            value={this.state.content}
            placeholder='Whats on your mind?'
            onChange={this.handleContentChange}
          />
      );
    } else if (this.props.isEdit) {
      return(<img src={this.props.content}/>);
    } else {
      return(<noscript/>);
    }
  }

  renderImageUpload() {
    if(this.state.contentType === 'image') {
      return (<input accept='image/png,image/jpeg'
          type='file'
          onChange={this.handleImageUpload}/>);
    } else {
      return (<noscript/>);
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
        {this.renderImageUpload()}
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
            <Radio
              checked={this.state.contentType === "image"}
              inline={true}
              onChange={this.handleContentTypeChange}
              value='image'>
              Image
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
  hideModal: PropTypes.func,
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