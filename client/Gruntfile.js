module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/everything.js',
                dest: 'dist/everything.min.js'
            }
        },
        concat:{
            dist:{
                src:['stylesheets/*.css',
                    'stylesheets/everything_package/*.css',
                    'stylesheets/everything_theme/*.css',
                    'stylesheets/codemirror_themes/monokai.css',
                    'stylesheets/codemirror_themes/xq-light.css',
                    'stylesheets/codemirror_themes/xq-light-big.css',
                    'stylesheets/codemirror_themes/zenburn.css'
                ],
                dest:'dist/style-build.css'
            }
        },
        cssmin: {
            css: {
                src: 'dist/style-build.css',
                dest: 'dist/style-build.min.css'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-css');

    // Default task(s).
    grunt.registerTask('default', ['concat','cssmin']);

};