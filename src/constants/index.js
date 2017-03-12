export const PERMISSIONS = Object.freeze({
  PUBLIC: Object.freeze({
    value: 'PUBLIC',
    label: 'Public'
  }),
  FRIENDS: Object.freeze({
    value: 'FRIENDS',
    label: 'Friends'
  }),
  FRIENDS_OF_FRIENDS: Object.freeze({
    value: 'FOAF',
    label: 'Friends of Friends'
  }),
  SELF: Object.freeze({
    value: 'PRIVATE',
    label: 'Self'
  }),
  USER: Object.freeze({
    value: 'PRIVATE',
    label: 'User'
  }),
  SERVERONLY: Object.freeze({
    value: 'SERVERONLY',
    label: 'Server Only'
  })
});