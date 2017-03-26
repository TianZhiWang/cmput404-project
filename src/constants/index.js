/**
 * Constants for Permissions
 */
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

/*eslint-disable */
export const URL_PREFIX = process.env.NODE_ENV === 'production' ? `https://${window.location.hostname}` : `http://${window.location.hostname}:8000`;
/*eslint-enable */