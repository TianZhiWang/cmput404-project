import React, {Component, PropTypes} from 'react';
import {Grid, Row, Col, Button} from 'react-bootstrap';
import CreatePost from './CreatePost';
import FriendPage from './FriendPage';
import PostList from './PostList';
import Profile from './Profile';
import Sidebar from './Sidebar';
import GithubEventsList from './Github';
import {connect} from 'react-redux';
import * as actions from '../actions';

/*
* Container renders a siderbar and one of two components: the PostList or the FriendList
*/
class Container extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    sessionStorage.clear();
    this.props.logout();
  }

  render() {
    const pickTab = () => {
      switch(this.props.activeTab) {
      case 'stream':
        return (
          <div>
            <CreatePost isEdit={false}/>
            <PostList />
          </div>
        );
      case 'friends':
        return <FriendPage/>;
      case 'profile':
        return <Profile/>;
      case 'github':
        return <GithubEventsList/>;
      }
    };
    return (
    <div className='coolbears-app'>
      <Grid>
        <Row>
            <Col md={3}>
            <Sidebar
                activeTab={this.props.activeTab}
                switchTabs={this.props.switchTabs}
                logout={this.props.logout} 
                user={this.props.user}/>
            </Col>
            <Col md={9}>{pickTab()}</Col>
        </Row>
      </Grid>
      <Button className="logout" 
        onClick={this.logout}><i className="fa fa-sign-out"/></Button>        
    </div>
    );
  }
}

Container.propTypes = {
  activeTab: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  switchTabs: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

export default connect(
  function(stateProps, ownProps) {
    return {
      user: stateProps.app.user,
      activeTab: stateProps.app.activeTab
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user} = stateProps;
    const {activeTab} = stateProps;
    const {dispatch} = dispatchProps;

    return {
      activeTab: activeTab,
      user: user,
      switchTabs: function(tab) {
        dispatch(actions.switchTabs(tab));
      },
      logout: function() {
        dispatch(actions.logout());
      }
    };
  })(Container);