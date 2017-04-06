function getUUIDFromId(id) {
  return /author\/([a-zA-Z0-9-]+)\/?$/.exec(id, 'g')[1];
}

export {
    getUUIDFromId
};