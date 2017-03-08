import React, {Component, PropTypes} from 'react';
import {FormControl, ButtonToolbar, ButtonGroup, Button, Glyphicon, Radio} from 'react-bootstrap';
import {PERMISSIONS} from '../constants';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permission: PERMISSIONS.FRIENDS.value,
      text: '',
      textFormat: 'plaintext'
    };

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleTextFormatChange = this.handleTextFormatChange.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handlePermissionChange = this.handlePermissionChange.bind(this);
  }

  handleTextChange(event) {
    this.setState({
      text: event.target.value
    });
  }

  handleImageUpload() {
    // handle image upload
  }

  handleTextFormatChange(event) {
    this.setState({
      textFormat: event.target.value
    });
  }

  handlePost() {
    if (this.state.text) {
      this.props.addPost(this.state.text, this.state.textFormat);
      this.setState({
        text: ''
      });
    }
  }

  handlePermissionChange(event) {
    this.setState({
      permission: event.value,
      user_with_permission: event.user
    });
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
        label: user.name,
        value: PERMISSIONS.USER.value,
        user: user.id
      }))
    ];
    return (
      <div className='create-post'>
        <FormControl
          type='text'
          value={this.state.text}
          placeholder='Whats on your mind?'
          onChange={this.handleTextChange}/>
        <div className='create-post-footer'>
          <Button
            onClick={this.handleImageUpload}>
            <Glyphicon glyph='picture'/>
          </Button>
          <ButtonGroup>
            <Radio
              checked={this.state.textFormat === 'plaintext'}
              inline={true}
              onChange={this.handleTextFormatChange}
              value='plaintext'>
              Plain Text
            </Radio>
            <Radio
              checked={this.state.textFormat === 'markdown'}
              inline={true}
              onChange={this.handleTextFormatChange}
              value='markdown'>
              Markdown
            </Radio>
          </ButtonGroup>
          <Select
            name='permissions'
            onChange={this.handlePermissionChange}
            options={options}
            value={this.state.permission}
          />
          <Button
            className='post-status'
            onClick={this.handlePost}>
            Post
          </Button>
        </div>
      </div>
    );
  }
}

CreatePost.propTypes = {
  addPost: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired
};

export default CreatePost;