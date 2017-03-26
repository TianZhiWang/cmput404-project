import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
/*
* Renders a author profile page
*/

let URL_PREFIX = `http://${  window.location.hostname  }:8000`;
/*eslint-disable */
if(process.env.NODE_ENV === 'production') {
  URL_PREFIX = 'https://' + window.location.hostname;
}
function getUUIDFromId(id) {
  return /author\/([a-zA-Z0-9-]+)\/?$/.exec(id, 'g')[1];
}
/*eslint-enable */
class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.toggleFriend = this.toggleFriend.bind(this);
  }

  componentDidMount() {
    fetch(`${URL_PREFIX}/author/${getUUIDFromId(this.props.currentuser.id)}/friends/${getUUIDFromId(this.props.user.id)}/`, {
      method: 'GET',
      headers: {
        // Written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539 (MIT)
        'Authorization': `Basic ${btoa(`${this.props.currentuser.username  }:${ this.props.currentuser.password}`)}`
      }
    })
    .then(res => {
      if (!res.ok) {
        return Promise.reject();
      }
      return res;
    })
    .then(res => res.json())
    .then(res => {this.setState({isFriends:res.friends});})
    .catch(err => {
      console.log(err, 'Could not get isfriends');
    });
  }

  toggleFriend() {
    this.props.toggleFollowStatus(this.props.user, this.state.isFriends);
  }

  render() {
    //TODO fix this
    const button = () => {
      if(this.props.user.id === this.props.currentuser.id) {
        return <noscript/>;
      }
      if(this.state.isFriends === true) {
        return <Button onClick={this.toggleFriend}>Remove Friend</Button>;
      } else if (this.state.isFriends === false) {
        return <Button onClick={this.toggleFriend}>Add Friend</Button>;
      } else {
        return <noscript/>;
      }
    };

    return (
      <div className='profile'>
        <h1>{this.props.user.displayName}'s Profile</h1>
        <p>Display Name: {this.props.user.displayName}</p>        
        <p>Id: {this.props.user.id}</p>
        {button()}
      </div>
    );
  }
}

Profile.propTypes = {
  currentuser: PropTypes.object.isRequired,
  toggleFollowStatus: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

export default Profile;