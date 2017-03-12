import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl} from 'react-bootstrap';

class UserAccount extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      isLoginPage: true
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.toggleLoginOrRegister = this.toggleLoginOrRegister.bind(this);
  }

  handleUsernameChange(event) {
    this.setState({
      username: event.target.value
    });
  }

  handlePasswordChange(event) {
    this.setState({
      password: event.target.value
    });
  }

  handleLogin() {
    if (this.state.username && this.state.password) {
      this.props.attemptLogin(this.state.username, this.state.password);
    }
  }

  handleRegister() {
    if (this.state.username && this.state.password) {
      this.props.attemptRegister(this.state.username, this.state.password);
    }
  }

  toggleLoginOrRegister() {
    this.setState({
      isLoginPage: !this.state.isLoginPage
    });
  }

  render() {
    return (
      <Panel className="wrapper">
        <form >       
          <h2>{this.state.isLoginPage ? "Please login" : "Please register"}</h2>
          <FormControl
            type="text"
            name="username"
            onChange={this.handleUsernameChange}
            placeholder="Username"
            required
            autoFocus />
          <FormControl
            type="password"
            name="password"
            onChange={this.handlePasswordChange}
            placeholder="Password"
            required />      
          <a onClick={this.toggleLoginOrRegister}>
            {this.state.isLoginPage ? "Need an account?" : "I have an account"}
          </a>
          <Button
            className="btn btn-lg btn-primary btn-block user-button-login"
            onClick={this.state.isLoginPage ? this.handleLogin : this.handleRegister}>
            {this.state.isLoginPage ? "Login" : "Register"}
          </Button>   
        </form>
      </Panel>
    );
  }
}

UserAccount.propTypes = {
  attemptLogin: PropTypes.func.isRequired,
  attemptRegister: PropTypes.func.isRequired
};


export default UserAccount;