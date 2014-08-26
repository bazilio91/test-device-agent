var os = require('os'),
    fs = require('fs');

var args = [
    '--no-default-browser-check',
    '--no-first-run',
    '--disable-default-apps',
    '--disable-popup-blocking',
    '--disable-translate'
];

// Return location of chrome.exe file for a given Chrome directory (available: "Chrome", "Chrome SxS").
function getChromeExe(chromeDirName) {
    if (process.platform !== 'win32') {
        return null;
    }
    var windowsChromeDirectory, i, prefix;
    var suffix = '\\Google\\' + chromeDirName + '\\Application\\chrome.exe';
    var prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];

    for (i = 0; i < prefixes.length; i++) {
        prefix = prefixes[i];
        if (fs.existsSync(prefix + suffix)) {
            windowsChromeDirectory = prefix + suffix;
            break;
        }
    }

    return windowsChromeDirectory;
}

var DEFAULT_CMD = {
    linux: 'google-chrome',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: getChromeExe('Chrome')
};


var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/**
 * Returns cmd & args for spawn
 * @param url
 */
module.exports = {
    name: 'Chrome',
    cmd: function () {
        if (!DEFAULT_CMD[os.platform()]) {
            throw new Error('Unknown platform');
        }

        return DEFAULT_CMD[os.platform()];
    },
    args: function () {
        var tmpDir = os.tmpdir() + '/tda' + Math.floor(Math.random() * 1000);
        if (fs.existsSync(tmpDir)) {
            deleteFolderRecursive(tmpDir);
        }

        fs.mkdirSync(tmpDir);

        return args.concat(['--user-data-dir=' + tmpDir, '%url%'])
    }
};