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
import {Panel, Button, Glyphicon} from 'react-bootstrap';
import {ListGroupItem} from 'react-bootstrap';

/*
* Renders a user with accept or delete options contextually
*/
class FriendListItem extends Component {
  constructor(props) {
    super(props);

    this.handleOk = this.handleOk.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleOk() {
    if (this.props.handleOk) {
      this.props.handleOk(this.props.user);
    }
  }

  handleRemove() {
    if (this.props.handleRemove) {
      this.props.handleRemove(this.props.user);
    }
  }

  render() {
    return (
      <ListGroupItem
        className='friend-list-item'>
          <span>{this.props.user.displayName}</span>
          <span className="friend-list-button-group">
            {this.props.handleOk && (
              <Button onClick={this.handleOk}>
                <Glyphicon glyph={'ok'}/>
              </Button>
            )}
            {this.props.handleRemove && (
              <Button onClick={this.handleRemove}>
                <Glyphicon glyph={'remove'}/>
              </Button>
            )}
          </span>
      </ListGroupItem>
    );
  }
}

FriendListItem.propTypes = {
  handleOk: PropTypes.func,
  handleRemove: PropTypes.func,
  user: PropTypes.object.isRequired
};

export default FriendListItem;