import React, {Component, PropTypes} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import CreatePost from './CreatePost';
import FriendList from './FriendList';
import PostList from './PostList';
import Profile from './Profile';
import Sidebar from './Sidebar';
import {connect} from 'react-redux';
import * as actions from '../actions';

/*
* Container renders a siderbar and one of two components: the PostList or the FriendList
*/
class Container extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'stream'
    };

    this.switchTabs = this.switchTabs.bind(this);
  }

  componentDidMount() {
    this.props.loadAuthors();
  }

  switchTabs(tab) {
    this.setState({
      activeTab: tab
    });
  }

  render() {
    const pickTab = () => {
      switch(this.state.activeTab) {
      case 'stream':
        return (
          <div>
            <CreatePost />
            <PostList />
          </div>
        );
      case 'friends':
        return <FriendList/>;
      case 'profile':
        return <Profile/>;
      }
    };
    return (
    <div className='coolbears-app'>
      <Grid>
        <Row>
            <Col md={3}>
            <Sidebar
                activeTab={this.state.activeTab}
                switchTabs={this.switchTabs} />
            </Col>
            <Col md={9}>{pickTab()}</Col>
        </Row>
      </Grid>
    </div>
    );
  }
}

Container.propTypes = {
  loadAuthors: PropTypes.func.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      user: stateProps.app.user,
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user} = stateProps;
    const {dispatch} = dispatchProps;

    return {
      loadAuthors: function() {
        dispatch(actions.getUsers(user));
      }
    };
  })(Container);