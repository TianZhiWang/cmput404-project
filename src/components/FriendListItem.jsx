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