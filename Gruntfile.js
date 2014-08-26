/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        pkgGui: grunt.file.readJSON('./gui/package.json'),
        // Task configuration.
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                globals: {
                    jQuery: true
                }
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['agent/**/*.js', 'gui/**/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            }
        },
        'install-dependencies': {
            options: {
                cwd: '.tmp',
                isDevelopment: false
            },
            build: {}
        },
        copy: {
            build: {
                files: [
                    // includes files within path and its sub-directories
                    {expand: true, src: ['**'], cwd: 'agent', dest: '.tmp/agent'},
                    {expand: true, src: ['**'], cwd: 'gui', dest: '.tmp/'}
                ]
            }
        },
        nodewebkit: {
            options: {
                build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
                mac: false, // We want to build it for mac
                win: false, // We want to build it for win
                linux32: false, // We don't need linux32
                linux64: true, // We don't need linux64
                version: '0.10.2'
//                mac_icns: '.tmp/styles/icons/icon.icns'
            },
            // ResHacker.exe -addoverwrite "Project.exe", "Project.exe", "ProgramIcon.ico", ICONGROUP, MAINICON, 0
            src: ['./.tmp/**/*'] // Your node-wekit app
        },
        clean: {
            build: {
                src: ['.tmp']
            }
        },
        shell: {
            dmg: {
                command: 'hdiutil create ./webkitbuilds/test-device-agent/osx/TestDeviceAgent.dmg -srcfolder ./webkitbuilds/test-device-agent/osx/ -ov'
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-install-dependencies');
    grunt.loadNpmTasks('grunt-shell');

    // Default task.
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('build', ['clean:build', 'copy:build', 'package', 'install-dependencies:build',
        'nodewebkit',
        //'shell:dmg'
    ]);

    grunt.registerTask('package', function () {
        var cfg = grunt.config.get('pkgGui');
        cfg.dependencies = grunt.config.get('pkg').dependencies;
        grunt.file.write('./.tmp/package.json', JSON.stringify(cfg));
    });
};
