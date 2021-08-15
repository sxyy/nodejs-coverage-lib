
var fs = require('fs');
    // baselineCoverage = {};
var baselineCoverage = JSON.parse(JSON.stringify(getCoverageObject()));

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



//deep-copy object
function clone(obj) {
  if (!obj) { return obj; }
  return JSON.parse(JSON.stringify(obj));
}



//single place to get global coverage object
function getCoverageObject() {
  /*jslint nomen: true */
  global.__coverage__ = global.__coverage__ || {};
  return global.__coverage__;
}


/**
 * overwrites the coverage stats for the global coverage object to restore to baseline
 * @method restoreBaseline
 */
 function restoreBaseline() {
  var cov = getCoverageObject(),
      fileCoverage,
      fileBaseline;
  Object.keys(baselineCoverage).forEach(function (file) {
      fileBaseline = baselineCoverage[file];
      if (cov[file]) {
          fileCoverage = cov[file];
          fileCoverage.s = clone(fileBaseline.s);
          fileCoverage.f = clone(fileBaseline.f);
          fileCoverage.b = clone(fileBaseline.b);
      }
  });
  Object.keys(cov).forEach(function (file) {
      if (!baselineCoverage[file]) { //throw it out
          delete cov[file];
      }
  });
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
  restoreBaseline,
}