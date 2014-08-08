// Generated on 2013-12-19 using generator-angular 0.6.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var replaceFiles = [{
    expand: true,
    cwd: '<%= doshi.app %>',
    src: ['{,*/}*.html', 'scripts/{,*/}*.js'],
    dest: '.tmp'
  }];

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    doshi: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist',
      domain: 'doshi.clee.kr'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        spawn: false
      },
      js: {
        files: ['.tmp/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all', 'karma:background:run']
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma:background:run']
      },
      compass: {
        files: ['<%= doshi.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      svg2png: {
        files: ['<%= doshi.app %>/images/*.svg'],
        tasks: ['newer:svg2png']
      },
      replace: {
        files: [
          '<%= doshi.app %>/{,*/}*.html',
          '<%= doshi.app %>/scripts/{,*/}*.js'
        ],
        tasks: ['replace:dev', 'newer:jshint:all', 'karma:background:run']
      },
      styles: {
        files: ['<%= doshi.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
      // livereload: {
      //   options: {
      //     livereload: '<%= connect.options.livereload %>'
      //   },
      //   files: [
      //     '<%= doshi.app %>/{,*/}*.html',
      //     '.tmp/styles/{,*/}*.css',
      //     '<%= doshi.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
      //   ]
      // }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35729
      },
      // livereload: {
      //   options: {
      //     open: true,
      //     base: [
      //       '.tmp',
      //       '<%= doshi.app %>'
      //     ]
      //   }
      // },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= doshi.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= doshi.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '.tmp/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= doshi.dist %>/*',
            '!<%= doshi.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },




    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= doshi.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= doshi.app %>/images',
        javascriptsDir: '.tmp/scripts',
        fontsDir: '<%= doshi.app %>/styles/fonts',
        importPath: '<%= doshi.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= doshi.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    svg2png: {
      all: {
        files: [{
          src: [
            '<%= doshi.app %>/images/icon-*.svg'
          ],
          dest: '.tmp/images'
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= doshi.dist %>/scripts/{,*/}*.js',
            '<%= doshi.dist %>/styles/{,*/}*.css',
            '<%= doshi.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= doshi.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '.tmp/index.html',
      options: {
        dest: '<%= doshi.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= doshi.dist %>/{,*/}*.html'],
      css: ['<%= doshi.dist %>/styles/{,*/}*.css'],
      js: [
        '<%= doshi.dist %>/scripts/{,*/}*.js',
        '!<%= doshi.dist %>/scripts/*worker.js'
      ],
      worker: ['<%= doshi.dist %>/scripts/*worker.js'],
      options: {
        assetsDirs: ['<%= doshi.dist %>'],
        patterns: {
          js: [
            [
              /Worker\(['"]([^'"]+.js)['"]\)/,
              'Replacing reference to Worker URLs'
            ]
          ],
          worker: [
            [
              /importScripts\(['"]([^'"]+\.js)['"]\)/,
              'Replacing reference to lib.js',
              function (m) { return 'scripts/' + m; },
              function (m) { return m.replace(/^scripts\//, ''); }
            ]
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= doshi.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= doshi.dist %>/images'
        }]
      }
    },
    // svgmin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= doshi.app %>/images',
    //       src: '{,*/}*.svg',
    //       dest: '<%= doshi.dist %>/images'
    //     }]
    //   }
    // },
    htmlmin: {
      dist: {
        options: {
          // Optional configurations that you can uncomment to use
          // removeCommentsFromCDATA: true,
          // collapseBooleanAttributes: true,
          // removeAttributeQuotes: true,
          // removeRedundantAttributes: true,
          // useShortDoctype: true,
          // removeEmptyAttributes: true,
          // removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '.tmp',
          src: ['*.html'],
          dest: '<%= doshi.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    ngtemplates: {
      doshi: {
        cwd: '.tmp',
        src: ['templates/*.html', 'views/*.html'],
        dest: '.tmp/templates.js',
        options: {
          usemin: 'scripts/scripts.js'
        }
      }
    },

    replace: {
      options: {
        force: true
      },
      dev: {
        options: {
          variables: {
            'debug': 'true',
            'production': 'false',
            'domain': '<%= doshi.domain %>'
          }
        },
        files: replaceFiles
      },
      test: {
        options: {
          variables: {
            'debug': 'false',
            'production': 'false',
            'domain': '<%= doshi.domain %>'
          }
        },
        files: replaceFiles
      },
      dist: {
        options: {
          variables: {
            'debug': 'false',
            'production': 'true',
            'domain': '<%= doshi.domain %>'
          }
        },
        files: replaceFiles
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= doshi.app %>',
          dest: '<%= doshi.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/{,*/}*.{webp}',
            'styles/fonts/*.ttf'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= doshi.dist %>/images',
          src: [
            'icon-*.png',
            'generated/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= doshi.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    manifest: {
      generate: {
        options: {
          basePath: '<%= doshi.dist %>',
          cache: [
            // Font Awesome add query strings when requesting font files.
            // These cannot be described in src.
            'bower_components/font-awesome/fonts/fontawesome-webfont.eot?v=4.0.3',
            'bower_components/font-awesome/fonts/fontawesome-webfont.svg?v=4.0.3',
            'bower_components/font-awesome/fonts/fontawesome-webfont.ttf?v=4.0.3',
            'bower_components/font-awesome/fonts/fontawesome-webfont.woff?v=4.0.3'
          ],
          network: [
            'http://www.google-analytics.com/*',
            'https://www.google-analytics.com/*'
          ]
        },
        src: [
          'index.html',
          'favicon.ico',
          'images/*.png',
          'styles/*.css',
          'styles/fonts/*',
          // 'bower_components/sass-bootstrap/fonts/*',
          'scripts/*.js'
        ],
        dest: '<%= doshi.dist %>/manifest.appcache'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server',
        'svg2png',
        'copy:styles'
      ],
      test: [
        'compass',
        'copy:styles'
      ],
      dist: [
        'compass:dist',
        'svg2png',
        'copy:styles',
        'imagemin',
        // 'svgmin',
        'htmlmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= doshi.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= doshi.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= doshi.dist %>/scripts/scripts.js': [
    //         '<%= doshi.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Test settings
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      background: {
        singleRun: false,
        background: true,
        runnerPort: 9999
      },
      continuous: {
        singleRun: true,
        browsers: ['Firefox']
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'replace:dev',
      'concurrent:server',
      'autoprefixer',
      // 'connect:livereload',
      'livereload',
      'karma:background',
      'watch'
    ]);
  });

  grunt.registerTask('livereload', 'Spawn a separate process for LiveReload', function () {
    grunt.util.spawn({
      grunt: true,
      args: ['--gruntfile', 'Gruntfile-LR.js']
    }, function (error, result, code) {
      console.log(error, result, code);
    });
  });

  grunt.registerTask('test', [
    'clean:server',
    'replace:test',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma:continuous'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'replace:dist',
    'useminPrepare',
    'ngtemplates',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'manifest'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
