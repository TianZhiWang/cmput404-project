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
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  getInitialState() {
    return {
      permission: PERMISSIONS.FRIENDS.value,
      title: '',
      description: '',
      content: '',
      contentType: 'text/plain',
      image: null,
      user_with_permission:[],
    };
  }
  componentDidMount() {
    this.props.getUsers();
    
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
    // console.log( event.target.files[0])
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
    // console.log(this.state.image)
    if (this.state.content) {
      this.props.addPost({
        content: this.state.content,
        title: this.state.title,
        description: this.state.description,
        contentType: this.state.contentType,
        permission: this.state.permission,

        image: this.state.image,
        user_with_permission: this.state.user_with_permission,
        "comments": []

      });

      this.setState(this.getInitialState());

      
      
    }
  }

  handlePermissionChange(event) {
    
    // get select user with permission
    // author:Dhiraj http://stackoverflow.com/questions/30306486/get-selected-option-text-using-react-js
    var index = event.nativeEvent.target.selectedIndex;
    var label = event.nativeEvent.target[index].text;
    var user_with_permission = [];

    // create visible array, if permission dropdown is selected to a user
    if (label!="Friends" && label!= "Public" && label!="Friends of Friends" && label!="Self"){
      user_with_permission = this.props.users.filter(function getUser(value){
        return value.displayName == label;   
      })[0];

      user_with_permission = user_with_permission.id.replace(user_with_permission.host+"author/","")
      user_with_permission = [user_with_permission]
    }

    this.setState({
      permission: event.target.value,
      user_with_permission: user_with_permission
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
    let options = [
      ...staticOptions,
      ...this.props.users.map(user => ({
        label: user.displayName,
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
        <input 
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
            {/*<Select
            name='permissions'
            onChange={this.handlePermissionChange}
            options={options}
            value={this.state.permission}
            />*/}
            <select id = 'permissionSelect' onChange={this.handlePermissionChange} >
              {options.map((option, index) => {
               return <option key={index} value={option.value}>{option.label}</option>
              })}
            </select>
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
  getUsers: PropTypes.func.isRequired,

};

export default CreatePost;