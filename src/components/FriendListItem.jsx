import React, {Component, PropTypes} from 'react';
import {Panel, Button, Glyphicon} from 'react-bootstrap';
import {ListGroupItem} from 'react-bootstrap';

/*
* Renders a user with accept or delete options contextually
*/
class FriendListItem extends Component {
  constructor(props) {
    super(props);

    this.handleFollowStatusChange = this.handleFollowStatusChange.bind(this);
  }

  handleFollowStatusChange() {
    this.props.toggleFollowStatus(this.props.user);
  }

  createGlyphiconButton(glyph) {
    return (
      <Button onClick={this.handleFollowStatusChange}>
        <Glyphicon glyph={glyph}/>
      </Button>
    );
  }
  render() {
    return (
      <ListGroupItem className='friend-list-item'>
          <span>{this.props.user.username}</span>
          <span className="friend-list-button-group">
            {(!this.props.user.isFollowing) && this.createGlyphiconButton('ok')}
            {this.props.user.isFollowing && this.createGlyphiconButton('remove')}
          </span>
      </ListGroupItem>
    );
  }
}

FriendListItem.propTypes = {
  toggleFollowStatus: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

export default FriendListItem;