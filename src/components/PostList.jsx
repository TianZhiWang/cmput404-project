import React, {Component, PropTypes} from 'react';
import Post from './Post';
import {connect} from 'react-redux';
import * as actions from '../actions';

/*
* Renders a list of posts
*/
class PostList extends Component {
  componentDidMount() {
    const id = getAllUrlParams(window.location.href).id;
    if (id){
      this.props.getPost(id);
    }else{
      this.props.loadPosts();
    }

  }
  render() {
    return (
      <div className='post-list'>
        {this.props.posts.map(post => (
          <Post key={post.id}
            addComment={this.props.addComment}
            author={post.author}
            contentType = {post.contentType}
            user = {this.props.user}
            deletePost = {this.props.deletePost}
            image = {post.image}
            unlisted = {post.unlisted}
            {...post}
          />
        ))}
      </div>
    );
  }
}

PostList.propTypes = {
  addComment: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  getPost:PropTypes.func.isRequired,
  loadPosts: PropTypes.func.isRequired,
  posts: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
};


// https://www.sitepoint.com/get-url-parameters-with-javascript/
function getAllUrlParams(url) {

  // get query string from url (optional) or window
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  const obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    const arr = queryString.split('&');

    for (let i=0; i<arr.length; i++) {
      // separate the keys and the values
      const a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      let paramNum = undefined;
      let paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      let paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

export default connect(
  function(stateProps, ownProps) {
    return {
      posts: stateProps.posts,
      users: stateProps.users,
      user: stateProps.app.user,
      ...ownProps
    };
  },
  null,
  function(stateProps, dispatchProps, ownProps) {
    const {users} = stateProps;
    const {user} = stateProps;
    const {dispatch} = dispatchProps;
    return {
      ...stateProps,
      ...ownProps,
      addComment: function(text, postId, postOrigin) {
        dispatch(actions.addComment(text, postId, postOrigin, user));
      },
      loadPosts: function() {
        dispatch(actions.loadPosts(user));
      },
      deletePost: function(post) {
        dispatch(actions.deletePost(post,user));
      },
      getPost: function(id) {
        dispatch(actions.getPost(id,user));
      }
    };
  })(PostList);
