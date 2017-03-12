import React, {Component, PropTypes} from 'react';
import {Panel, Button, Glyphicon} from 'react-bootstrap';
import {ListGroupItem} from 'react-bootstrap';

class FriendListItem extends Component {
  createGlyphiconButton(glyph) {
    return (
      <Button>
        <Glyphicon glyph={glyph}/>
      </Button>
    );
  }
  render() {
    return (
      <ListGroupItem className='friend-list-item'>
          <span >{this.props.username}</span>
          <span className="friend-list-button-group">
            {!this.props.isFollower && this.createGlyphiconButton('ok')}
            {!this.props.isFollower && this.createGlyphiconButton('remove')}
          </span>
      </ListGroupItem>
    );
  }
}

FriendListItem.propTypes = {
  isFollower: PropTypes.bool,
  username: PropTypes.string.isRequired
};

export default FriendListItem;