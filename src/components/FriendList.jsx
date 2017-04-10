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
import FriendListItem from './FriendListItem';
import {ListGroup} from 'react-bootstrap';

/*
* Renders a list of friends in three sections: Friends, Following, and Everyone Else
*/
class FriendList extends Component {
  render() {
    return (
        <ListGroup>
            {this.props.users.map(user => {
              return (
                <FriendListItem
                  key={user.id}
                  handleOk={this.props.handleOk}
                  handleRemove={this.props.handleRemove}
                  user={user}
                />
              );
            })}
        </ListGroup>
    );
  }
}

FriendList.propTypes = {
  handleOk: PropTypes.func,
  handleRemove: PropTypes.func,
  users: PropTypes.array.isRequired
};

export default FriendList;