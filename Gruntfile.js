module.exports = function(grunt){

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      coffee: {
        planit: {
          files: {
            'planit.js': [
              'js/plan.coffee',
              'js/marker.coffee'
            ]
          }
        }
      },
      uglify: {
        options: {
          sourceMap: true
        },
        planit: {
          files: {
            'planit.min.js': ['planit.js']
          }
        }
      }
  });

  grunt.registerTask('default', []);

};
