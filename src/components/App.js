import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col} from 'react-bootstrap';
import CreatePost from './CreatePost';
import FriendList from './FriendList';
import PostList from './PostList';
import Sidebar from './Sidebar';
import UserAccount from './UserAccount';
import '../../style/style.scss';
import * as actions from '../actions';
import schema from '../schema';
import {denormalize} from 'normalizr';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content : "posts-list"
    };
    this.updateContent=this.updateContent.bind(this);
  }

  componentDidMount() {
    this.props.loadPosts();
  }

  updateContent(key){
    if (key == "posts-list"){
      this.setState({content:key});
    }
    else if (key == "friends-list"){
      this.setState({content:key});
    }
  }


  render() {
    // TODO: hardcoded login status
    const isLoggedIn = true;

    const contentPosts = () => (
        <Col md={9}>
          <CreatePost
            addPost={this.props.addPost}
            users={this.props.users}
          />
          <PostList
            posts={this.props.posts}
            addComment={this.props.addComment}
          />
        </Col>
      );
    const contentFriends = () => (
        <Col md={9}>
          <FriendList
            friends = {this.props.friends.friendList}
            friendRequests = {this.props.friends.friendRequests}
          />
        </Col>
    );
    let content=contentFriends();

    if (this.state.content == "posts-list"){
      content = contentPosts(); 
    }else if (this.state.content == "friends-list"){
      content = contentFriends();
    }else{
      content = contentPosts(); 
    }

    if (isLoggedIn){
      return (
        <div className='coolbears-app'>
          <Grid>
            <Row>
              <Col md={3}>
                <Sidebar updateContent ={this.updateContent} />
              </Col>
              {content}
            </Row>
          </Grid>
        </div>
      );
    }else{

      return(
      <UserAccount/>
      );
    }
  }
}

App.propTypes = {
  addComment: PropTypes.func.isRequired,
  addPost: PropTypes.func.isRequired,
  friends: PropTypes.object.isRequired,
  loadPosts: PropTypes.func.isRequired,
  posts: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired
  
};

// TODO: Temporary, get this from somewhere else
const user = {
  id: 96853,
  name: 'Batman'
};
// TODO: Move this into seperate file as container
export default connect(
  function(stateProps, ownProps) {
    return {
      posts: denormalize(Object.keys(stateProps.posts), schema, stateProps),
      users: Object.values(stateProps.users),
      friends: stateProps.friends
    };
  }, function(dispatch, ownProps) {
  return {
    addComment: function(text, postId) {
      dispatch(actions.addComment(text, postId, user.id));
    },
    addPost: function(post) {
      dispatch(actions.addPost(post, user.id));
    },
    loadPosts: function() {
      dispatch(actions.loadPosts());
    }
  };
})(App);