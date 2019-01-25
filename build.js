const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const git = require('simple-git/promise')('../working');

const CONFIG = "./static/admin/config.yml"
const REPO = "github.com/hringleikur/aeskusirkus";
const WORKING_BRANCH = 'master';
const TARGET_BRANCH = 'master';
const CONTENT_DIR = "content/cms/";
const CONTENT_SUFFIX = ".yml";
const REMOTE = `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_PASSWORD}@${REPO}`;

try
{
  var handlers = [];
  yaml.safeLoad(fs.readFileSync(CONFIG, 'utf8'))
    .collections
    .filter(collection=>collection.t_translations)
    .forEach(collection=>{
      if(collection.files)
      {
        collection.files.forEach(file=>handlers.push({
          path : file.file,
          languages : file.t_languages,
          fields : file.fields
        }))
      }
      else
      {
          handlers.push({
            path : collection.folder,
            languages : collection.t_languages,
            fields: collection.fields
          });
      }
    });
}
catch (e)
{
  console.log(e);
}

git
  .silent(true)
  .checkIsRepo()
  .then(isRepo => isRepo ? git.pull(REMOTE) : git.clone(REMOTE, '.'))
  .then(r => git.checkout(WORKING_BRANCH))
  .then(r => git.diff(["--name-only", "HEAD", "HEAD~1"]))
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
    var handler = handlers.find(handler=>file.startsWith(handler.path));
    if(!handler)
    {
      return;
    }
    try
    {
      var content = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
      if(!content)
      {
        throw new Error("Fine empty or not found");
      }
      handler.languages.forEach(lang=>{
        var frontmatter = {};
        var body = "";
        handler.fields.forEach(field=>{
          var value;
          var key;
          if(field.t_root)
          {
            key = field.t_root;
            if(content[field.t_root + '_' + lang.code])
            {
              value = content[field.t_root + '_' + lang.code];
            }
            else if(lang.langIfEmpty && content[field.t_root + '_' + lang.langIfEmpty])
            {
              value = content[field.t_root + '_' + lang.langIfEmpty];
            }
          }
          else
          {
            key = field.name;
            if(content[field.name])
            {
              value = content[field.name];
            }
          }
          if(value)
          {
            if(key == 'body')
            {
              body = value;
            }
            else
            {
              frontmatter[key] = value;
            }
          }
        });
        frontmatter.translationKey = file
          .replace(CONTENT_DIR, '')
          .replace(CONTENT_SUFFIX, '');

        var outputFile = lang.file ? lang.file : lang.folder + frontmatter.translationKey + CONTENT_SUFFIX;
        mkdirp.sync(lang.file ? path.dirname(lang.file) : lang.folder);

        var stream = fs.createWriteStream(outputFile);
        stream.once('open', function(fd) {
          stream.write("---\n");
          stream.write(yaml.safeDump(frontmatter));
          stream.write("---\n");
          stream.write(body);
          stream.end();
        });
      });
    }
    catch(e)
    {
      console.log("Aborting file: ", e);
    }
  }
