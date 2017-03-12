import React, {Component, PropTypes} from 'react';
import {Panel, Button, FormControl} from 'react-bootstrap';

class UserAccount extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      type:"login"
    };
    this.switchLogIn = this.switchLogIn.bind(this);
    this.switchSignUp = this.switchSignUp.bind(this);
  }
  switchLogIn() {
    this.setState({type:"login"});
  }

  switchSignUp(){
    this.setState({type:"signup"});
  }

  render() {
    const logInContent = ()=>(
      <Panel className="wrapper">
        <form >       
          <h2>Please login</h2>
          <FormControl type="text" 
          name="username" 
          placeholder="Email Address" 
          required 
          autoFocus />
          <FormControl type="password" 
          name="password" 
          placeholder="Password" 
          required />      
          <a onClick = {this.switchSignUp} >need an account?</a>
          <Button className="btn btn-lg btn-primary btn-block user-button-login" 
          type="submit">Login</Button>   
        </form>
      </Panel>
    );

    const signUpContent = () => (
      <Panel className="wrapper">
        <form >       
          <h2>Sign Up</h2>
          <FormControl type="text" 
          name="username" 
          placeholder="Email Address" 
          required 
          autoFocus />
          <FormControl type="password" 
          name="password" 
          placeholder="Password" 
          required />     
          <FormControl type="password" 
          name="password" 
          placeholder="Re-Enter PW" 
          required />  
          <a onClick = {this.switchLogIn} >have an account already?</a>
          <Button className="btn btn-lg btn-primary btn-block user-button-login" 
          type="submit">Register</Button>   
        </form>
      </Panel>
    );
    if (this.state.type == "login"){
      return (
        logInContent()
      );
    }else{
      return (
        signUpContent()
      );
    }
  }
}


export default UserAccount;