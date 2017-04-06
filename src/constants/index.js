let URL_PREFIX = `http://${window.location.hostname}:8000`;
/*eslint-disable */
if (process.env.NODE_ENV === 'production') {
  URL_PREFIX = 'http://' + window.location.hostname;
}

export {URL_PREFIX};
