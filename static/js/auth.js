var cn = "aesku_login";
var cpp = "bb5a8e029f5a731dd3cdaa452068a738ca88a1c917b3a0ae30931ddb4e31287d";
var c = Cookies.get(cn);
if(c)
{
  var pp = CryptoJS.AES.decrypt(c, cpp).toString(CryptoJS.enc.Utf8);
  try {
    ready(function(){
      decrypt(pp);
    });
  }
  catch(e) {
    document.getElementById("badpw").style.display = "block";
  }
}
else
{
  document.getElementById("load").style.display = "none";
  document.getElementById("form").style.display = "block";
}

document.getElementById('sc-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var passphrase = document.getElementById('pw').value
    Cookies.set(cn, CryptoJS.AES.encrypt(passphrase, cpp).toString(), { expires: 365 });

    try {
      decrypt(passphrase)
    }
    catch(e) {
      document.getElementById("badpw").style.display = "block";
    }
});

function decrypt(pp)
{
  var encryptedHMAC = encryptedMsg.substring(0, 64),
      encryptedHTML = encryptedMsg.substring(64),
      decryptedHMAC = CryptoJS.HmacSHA256(encryptedHTML, CryptoJS.SHA256(pp).toString()).toString();

  if (decryptedHMAC !== encryptedHMAC)
  {
      throw new Error("Bad passphrase");
  }

  var plainHTML = CryptoJS.AES.decrypt(encryptedHTML, pp).toString(CryptoJS.enc.Utf8);

  document.write(plainHTML);
  document.close();
}

function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
  }
}
