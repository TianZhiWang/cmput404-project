import {schema} from 'normalizr';

// https://github.com/paularmstrong/normalizr/blob/master/docs/quickstart.md Paula Armstrong (MIT)
const user = new schema.Entity('users');
const comment = new schema.Entity('comments', {
  author: user
});
const post = new schema.Entity('posts', {
  author: user,
  comments: [comment]
});
const posts = [post];

export default posts;
