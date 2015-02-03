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
          'planit.js': ['js/plan.coffee', 'js/marker.coffee']
        }
      }
    },
    uglify: {
      planit: {
        files: {
          'planit.min.js': ['planit.js']
        }
      }
    },
    watch: {
      scripts: {
        files: ['js/*.coffee'],
        tasks: ['coffee', 'uglify'],
      }
    }
  });

  grunt.registerTask('default', []);

};
