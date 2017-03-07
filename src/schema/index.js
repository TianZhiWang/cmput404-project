import {schema} from 'normalizr';

const user = new schema.Entity('users');
const comment = new schema.Entity('comments', {author: user
 });
const post = new schema.Entity('posts', {
  author: user,
  comments: [comment]
});
const posts = [post];

export default posts;
