var browserTemplates = {},
    _ = require('lodash');

require('fs').readdirSync(__dirname).forEach(function (file) {
    if (file.indexOf('.js') === -1 || file === 'index.js') {
        return;
    }

    var template = require('./' + file);
    if (typeof template === 'function') {
        browserTemplates[template.name] = template;
        return;
    }

    if (typeof template === 'array') {
        _.each(template, function (t) {
            browserTemplates[t.name] = t;
        })
    }
});

module.exports = browserTemplates;