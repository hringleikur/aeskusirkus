
const REPO = 'github.com/hringleikur/aeskusirkus';
const git = require('simple-git/promise');
const remote = `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_PASSWORD}@${REPO}`;

git().silent(true)
  .fetch({"--unshallow":null})
  .then(() => console.log('finished'))
  .catch((err) => console.error('failed: ', err));
