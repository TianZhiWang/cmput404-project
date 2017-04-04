import React, {Component, PropTypes} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import CreatePost from './CreatePost';
import PostList from './PostList';
import Profile from './Profile';
import Sidebar from './Sidebar';

/*
* Container renders a siderbar and one of two components: the PostList or the FriendList
*/
class Container extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const contentPosts = () => (
        <Col md={9}>
          <CreatePost
            addPost={this.props.addPost}
          />
           <PostList
            toggleFollowStatus={this.props.toggleFollowStatus}
            posts={this.props.posts}
            addComment={this.props.addComment}
            loadPosts={this.props.loadPosts}
            user = {this.props.user}
            deletePost = {this.props.deletePost}
            getPost = {this.props.getPost}
          />
        </Col>
      );
    const contentFriends = () => (
        <Col md={9}>
          <FriendList
            toggleFollowStatus={this.props.toggleFollowStatus}
            user={this.props.user}
            deletePost={this.props.deletePost}
          />
        </Col>
      );
    const contentProfile = () => (
        <Col md={9}>
          <Profile
            toggleFollowStatus={this.props.toggleFollowStatus}
            currentuser={this.props.user}
            user={this.props.user}
          />
        </Col>
    );
    const pickTab = () => {
      switch(this.props.activeTab) {
      case 'stream':
        return contentPosts();
      case 'profile':
        return contentProfile();
      default:
        return contentPosts();
      }
    };
    return (
    <div className='coolbears-app'>
      <Grid>
        <Row>
            <Col md={3}>
            <Sidebar
                activeTab={this.props.activeTab}
                switchTabs={this.props.switchTabs} />
            </Col>
            {pickTab()}
        </Row>
      </Grid>
    </div>
    );
  }
}

Container.propTypes = {
  activeTab: PropTypes.string.isRequired,
  addComment: PropTypes.func.isRequired,
  addPost: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  loadPosts: PropTypes.func.isRequired,
  posts: PropTypes.array.isRequired,
  switchTabs: PropTypes.func.isRequired,
  toggleFollowStatus: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  getPost: PropTypes.func.isRequired,
};

export default Container;