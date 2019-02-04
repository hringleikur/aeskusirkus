const yaml = require('js-yaml');
const fs   = require('fs');
const klaw = require('klaw');
const { exec } = require('child_process');

const CONFIG = "content/cms/auth.yml"

try
{
  var password = yaml.safeLoad(fs.readFileSync(CONFIG, 'utf8')).password;
  exec('find ./public/en/members -name "*.html" -exec node ./node_modules/staticrypt/index.js {} "'+password+'" -f ./public/en/auth/index.html -o {}  \\;', (err, stdout, stderr) => {
    if (err) {
      console.log("Error", err);
      return;
    }

    console.log("Done encrypting.")
  });
  exec('find ./public/innri-vefur -name "*.html" -exec node ./node_modules/staticrypt/index.js {} "'+password+'" -f ./public/auth/index.html -o {}  \\;', (err, stdout, stderr) => {
    if (err) {
      console.log("Error", err);
      return;
    }

    console.log("Done encrypting.")
  });
}
catch(e)
{
  console.log(e);
}
