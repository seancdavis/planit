module.exports = function(grunt){

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      options: {
        sourceMap: true
      },
      planit: {
        files: {
          'build/planit.js': ['js/plan.coffee', 'js/marker.coffee']
        }
      }
    },
    uglify: {
      planit: {
        files: {
          'build/planit.min.js': ['build/planit.js']
        }
      }
    },
    sass: {
      // options: {
      //   sourcemap: 'none'
      // },
      dist: {
        files: {
          'build/planit.css': 'scss/planit.scss'
        }
      }
    },
    cssmin: {
      target: {
        files: {
          'build/planit.min.css': ['build/planit.css']
        }
      }
    },
    watch: {
      scripts: {
        files: ['js/*.coffee'],
        tasks: ['coffee', 'uglify'],
      },
      styles: {
        files: ['scss/*.scss'],
        tasks: ['sass', 'cssmin'],
      },
    }
  });

  grunt.registerTask('default', []);

};
