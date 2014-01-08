// Spawn a separate process for LiveReload for a much better performance.
// See:
// https://github.com/gruntjs/grunt-contrib-watch/issues/69
// https://github.com/gruntjs/grunt-contrib-watch/issues/231
'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    yeoman: {
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },
    watch: {
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '.tmp/{,*/}*.html',
          '.tmp/scripts/{,*/}*.js',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      }
    }
  });
  grunt.registerTask('default', [
    'connect:livereload',
    'watch'
  ]);
};
