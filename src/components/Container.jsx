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