
var fs = require('fs');

function combineNycOptions({
  pkgNycOptions,
  nycrc,
  nycrcJson,
  defaultNycOptions
}) {
  // last option wins
  const nycOptions = Object.assign(
    {},
    defaultNycOptions,
    nycrc,
    nycrcJson,
    pkgNycOptions
  )

  if (typeof nycOptions.reporter === 'string') {
    nycOptions.reporter = [nycOptions.reporter]
  }
  if (typeof nycOptions.extension === 'string') {
    nycOptions.extension = [nycOptions.extension]
  }

  return nycOptions
}






function deleteFiles(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFiles(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


const defaultNycOptions = {
  'report-dir': './coverage',
  reporter: ['json', 'json-summary', 'html'],
  extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
  excludeAfterRemap: true
}

module.exports = {
  deleteFiles,
  combineNycOptions,
  defaultNycOptions,
}