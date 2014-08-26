var browserTemplates = {},
    _ = require('lodash');

module.exports = function (logger) {
    function loadTemplate(t) {
        if (_.isFunction(t)) {
            return t(logger)
        }

        return t;
    }

    require('fs').readdirSync(__dirname).forEach(function (file) {
        if (file.indexOf('.js') === -1 || file === 'index.js') {
            return;
        }

        var template = require('./' + file);
        if (_.isArray(template)) {
            _.each(template, function (t) {
                t = loadTemplate(t);
                browserTemplates[t.name] = t;
            });

            return;
        }

        if (_.isObject(template)) {
            loadTemplate(template);
            browserTemplates[template.name] = template;
        }
    });

    return browserTemplates;
};