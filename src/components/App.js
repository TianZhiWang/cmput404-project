import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Container from './Container';
import UserAccount from './UserAccount';
import '../../style/style.scss';
import * as actions from '../actions';

/*
* The root component, renders container if logged in or the login page otherwise
*/
class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let user = sessionStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);

      this.props.attemptLogin(user.username, user.password);
    }
  }

  render() {
    return this.props.loggedIn ? <Container/> : <UserAccount/>;
  }
}

App.propTypes = {
  attemptLogin: PropTypes.func.isRequired,
  loggedIn: PropTypes.bool.isRequired
};

/*
* Connects the component to the app state, also specifies action that can be used to update the state
*/
export default connect(
  function(stateProps, ownProps) {
    return {
      loggedIn: stateProps.app.loggedIn
    };
  },
  function(dispatch) {
    return {
      attemptLogin: function(username, password) {
        dispatch(actions.attempLogin(username, password));
      }
    };
  }
  )(App);
