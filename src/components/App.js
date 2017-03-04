import React, { Component } from 'react';
import CreatePost from './CreatePost';
import PostList from './PostList';
import '../../style/style.scss';

class App extends Component {
  render() {
    const postListData = [
      {id:20525, username: 'Too Yung', privacy: 1, date: '56-10-2020', textContent: 'Age is just a number', hasPic: false, picURL: "", comments: [{key:"ASdfasdf",author:"Kyle",text:"I Have anger issues"},{key:"asssssdf",author:"Xin",text:"I Too Have anger issues"}]},
      {id:10241, username: 'Bob Bobby', privacy: 2, date: '01-01-1990', textContent: 'Jail is just a room', hasPic: true, picURL: "https://i.imgflip.com/1ks3kw.jpg", comments: [{key:"ASdfasdf",author:"Kyle",text:"I Have anger issues"},{key:"asssssdf",author:"Xin",text:"I Too Have anger issues"}]}
    ];
    return (
      <div>
        <h1>Hello World</h1>
        <CreatePost/>
        <PostList
          posts={postListData}
        />
      </div>
    );
  }
}

export default App;
