
const REPO = 'github.com/hringleikur/aeskusirkus';
const WORKING_BRANCH = 'master';
const TARGET_BRANCH = 'master';
const CONTENT_DIR = "content/";
const CONTENT_SUFFIX = ".md";
const git = require('simple-git/promise')('../working');
const remote = `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_PASSWORD}@${REPO}`;

git
  .silent(true)
  .checkIsRepo()
  .then(isRepo => isRepo ? git.pull(remote) : git.clone(remote, '.'))
  .then(r => git.checkout(WORKING_BRANCH))
  .then(r => git.show(["--pretty=","--name-only"]))
  .then(checkFiles)
  .catch(err => console.error('failed: ', err));


  function checkFiles(list)
  {
    var allFiles = list.split("\n");
    var contentFiles = allFiles
        .filter(file=>file.startsWith(CONTENT_DIR) && file.endsWith(CONTENT_SUFFIX))
    contentFiles.forEach(handleContentFile);
  }

  function handleContentFile(file)
  {
    console.log(file);
  }
