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
            <ListGroupItem key={githubEvent.id} header={githubEvent.created_at.substr(0, 10)}>
            {githubEvent.actor.login} profroms {githubEvent.type} at {githubEvent.repo.name} 
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    );
  }
}

GithubEventsList.propTypes = {
  user: PropTypes.object.isRequired,
  github: PropTypes.array.isRequired,
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
