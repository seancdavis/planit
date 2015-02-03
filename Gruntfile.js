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
          'build/planit.js': [
            'src/javascripts/plan.coffee', 
            'src/javascripts/marker.coffee'
          ]
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
          'build/planit.css': 'src/stylesheets/planit.scss'
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
        files: ['src/javascripts/*.coffee'],
        tasks: ['coffee', 'uglify'],
      },
      styles: {
        files: ['src/stylesheets/*.scss'],
        tasks: ['sass', 'cssmin'],
      },
    }
  });

  grunt.registerTask('default', []);

};
