import React, {Component, PropTypes} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import CreatePost from './CreatePost';
import FriendList from './FriendList';
import PostList from './PostList';
import Sidebar from './Sidebar';

/*
* Container renders a siderbar and one of two components: the PostList or the FriendList
*/
class Container extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getUsers();
  }

  render() {
    const contentPosts = () => (
        <Col md={9}>
          <CreatePost
            addPost={this.props.addPost}
            users={this.props.users}
          />
           <PostList
            posts={this.props.posts}
            addComment={this.props.addComment}
            loadPosts={this.props.loadPosts}
            user = {this.props.user}
            deletePost = {this.props.deletePost}
          />
        </Col>
      );
    const contentFriends = () => (
        <Col md={9}>
          <FriendList
            toggleFollowStatus={this.props.toggleFollowStatus}
            users={this.props.users}
          />
        </Col>
    );
    return (
    <div className='coolbears-app'>
      <Grid>
        <Row>
            <Col md={3}>
            <Sidebar
                activeTab={this.props.activeTab}
                switchTabs={this.props.switchTabs} />
            </Col>
            {this.props.activeTab === 'stream' ? contentPosts(): contentFriends()}
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
  getUsers: PropTypes.func.isRequired,
  loadPosts: PropTypes.func.isRequired,
  posts: PropTypes.array.isRequired,
  switchTabs: PropTypes.func.isRequired,
  toggleFollowStatus: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired
};

export default Container;