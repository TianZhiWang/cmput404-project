import React, { Component } from 'react';
import {FormControl, ButtonToolbar, ButtonGroup, Button, Glyphicon} from 'react-bootstrap';

class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      isPlainText: true
    };

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handlePlainTextSelected = this.handlePlainTextSelected.bind(this);
    this.handleMarkdownSelected = this.handleMarkdownSelected.bind(this);
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

  handlePlainTextSelected() {
    this.setState({
      isPlainText: true
    });
  }

  handleMarkdownSelected() {
    this.setState({
      isPlainText: false
    });
  }

  handlePost() {
    // Call callback for handle post in the props
    // this.props.postStatus(this.state.text, this.state.isPlainText)
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
            <Button
              onClick={this.handlePlainTextSelected}>
              Plain Text
            </Button>
            <Button
              onClick={this.handleMarkdownSelected}>
              Markdown
            </Button>
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

export default CreatePost;