import React, {Component, PropTypes} from 'react';
import {FormControl, ButtonToolbar, ButtonGroup, Button, Glyphicon, Radio} from 'react-bootstrap';

class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      textFormat: 'plaintext'
    };

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleTextFormatChange = this.handleTextFormatChange.bind(this);
    this.handlePost = this.handlePost.bind(this);
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

  render() {
    return (
      <div className='create-post'>
        <FormControl
          type='text'
          value={this.state.text}
          placeholder='Whats on your mind?'
          onChange={this.handleTextChange}/>
        <ButtonToolbar>
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
          <Button
            onClick={this.handlePost}>
            Post
          </Button>
        </ButtonToolbar>
      </div>
    );
  }
}

CreatePost.propTypes = {
  addPost: PropTypes.func.isRequired
};

export default CreatePost;