var os = require('os'),
    fs = require('fs');

var PREFS =
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n' +
    'user_pref("dom.disable_open_during_load", false);\n' +
    'user_pref("dom.max_script_run_time", 0);\n';

var getFirefoxExe = function (firefoxDirName) {
    if (process.platform !== 'win32') {
        return null;
    }


    var prefix;
    var prefixes = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];
    var suffix = '\\' + firefoxDirName + '\\firefox.exe';

    for (var i = 0; i < prefixes.length; i++) {
        prefix = prefixes[i];
        if (fs.existsSync(prefix + suffix)) {
            return prefix + suffix;
        }
    }

    return 'C:\\Program Files' + suffix;
};

var DEFAULT_CMD = {
    linux: 'firefox',
    darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
    win32: getFirefoxExe('Mozilla Firefox')
};

/**
 * Returns cmd & args for spawn
 * @param url
 */
module.exports = {
    name: 'Firefox',
    cmd: function () {
        if (!DEFAULT_CMD[os.platform()]) {
            throw new Error('Unknown platform');
        }

        return DEFAULT_CMD[os.platform()];
    },
    args: function () {
        var tmpDir = os.tmpdir() + '/tda' + Math.floor(Math.random() * 1000);
        if (fs.existsSync(tmpDir)) {
            fs.rmdirSync(tmpDir);
        }

        fs.mkdirSync(tmpDir);

        fs.writeFileSync(tmpDir + '/prefs.js', PREFS);

        return ['%url%', '-profile', tmpDir, '-no-remote'];
    }
};