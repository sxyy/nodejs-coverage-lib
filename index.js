var path = require('path'),
    express = require('express'),
    nopt = require('nopt'),
    bodyParser = require('body-parser'),
    config = nopt({ port: Number }),
    port = config.port || 8787;
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const {
    readNycOptions,
} = require('./common/task-utils');
const {
    deleteFiles, restoreBaseline
} = require('./common/common-utils');
const fs = require('fs');
const adm_zip = require("adm-zip");
const NYC = require('nyc')
const debug = require('debug')('code-coverage')
const app = express();

console.log('Turning on coverage; ensure this is not production');
const serverPath = path.resolve(__dirname, '..', '..');
console.log(serverPath);
console.log('Turn on coverage reporting at /coverage');
// 删除coverage 目录下的内容

const COVERAGE_NAME = 'coverage-final.json';
const NYC_OUT_FOLDER = '.nyc_output';
const COVERAGE_FOLDER = 'coverage';
deleteFiles(join(serverPath, COVERAGE_FOLDER))


function saveCoverage(coverage, coverageFolder, nycFilename) {
    if (!existsSync(coverageFolder)) {
        mkdirSync(coverageFolder)
        console.log('created folder %s for output coverage', coverageFolder)
    }

    writeFileSync(nycFilename, JSON.stringify(coverage, null, 2))
}


/**
 * 生成报告
 */
async function generateReport() {
    const nycReportOptions = readNycOptions(serverPath);
    // 这个设置很重要 指定了根路径
    nycReportOptions.cwd = serverPath;
    debug('生成全量报告with options %o', nycReportOptions)
    console.log(nycReportOptions);
    const nyc = new NYC(nycReportOptions)
    await nyc.report()

}

//reset coverage to baseline on POST /reset
app.post('/reset', function (req, res) {
    restoreBaseline();
    res.json({ ok: true });
});


//show main page for coverage report for /
app.get('/download', function (req, res) {
    let coveargeFolder = join(serverPath, NYC_OUT_FOLDER);
    saveCoverage(global.__coverage__, coveargeFolder, join(coveargeFolder, COVERAGE_NAME));
    var process = require('child_process');
    process.exec('nyc report --reporter=html --reporter=json', function () {
        if (!existsSync(join(serverPath, COVERAGE_FOLDER))) {
            res.json({ statusCode: 4001, msg: "覆盖率目录未找到, 请检查实际项目的运行环境" })
        } else {
            var zip = new adm_zip();
            zip.addLocalFolder(join(serverPath, COVERAGE_FOLDER));
            zip.writeZip(join(serverPath, "coverage.zip"), () => {
                res.setHeader('Content-type', 'application/octet-stream');
                res.setHeader('Content-Disposition', 'attachment;filename=coverage.zip');
                var fileStream = fs.createReadStream(join(serverPath, "coverage.zip"));
                fileStream.on('data', function (data) {
                    res.write(data, 'binary');
                });
                fileStream.on('end', function () {
                    res.end();
                    fs.unlinkSync(join(serverPath, "coverage.zip"));
                });
                fileStream.on('error', (error) => {
                    console.log(error);
                })
            });
        }

    });


});
console.log('Starting coverage server at: http://localhost:' + port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(port);
