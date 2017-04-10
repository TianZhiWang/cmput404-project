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
import {connect} from 'react-redux';
import * as actions from '../actions';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

/*
* Renders a list of posts
*/
class GithubEventsList extends Component {
  componentWillMount(){
    this.props.loadGithub();
  }
  render() {
    return (
      <div>
        <h1>Github Stream</h1>
        <ListGroup >
         {this.props.github.map(githubEvent => (
            <ListGroupItem key={githubEvent.id} 
            header={githubEvent.created_at.substr(0, 10)}>
            {githubEvent.actor.login} performed {githubEvent.type} at {githubEvent.repo.name} 
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    );
  }
}

GithubEventsList.propTypes = {
  github: PropTypes.array.isRequired,
  loadGithub: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  
  
};

export default connect(
  function(stateProps,ownProps) {
    return {
      user: stateProps.app.user,
      github: stateProps.github,
      ...ownProps
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {user} = stateProps;
    const {dispatch} = dispatchProps;
    return {
      ...stateProps,
      ...ownProps,
      loadGithub: function(){
        dispatch(actions.loadGithub(user.github));
      }
    };
  })(GithubEventsList);
