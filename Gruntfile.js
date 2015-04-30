module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['Gruntfile.js','perlin_noise.js']
    },

    uglify: {
      options: {
        compress: {
          drop_console: true
        }
      },
      js_files: {
        files: {
          'js/chance.min.js': ['_assets/js/chance.js'],
          'js/perlin_noise.min.js':['_assets/js/perlin_noise.js']
        }
      }
    },

    'link-checker': {
      dev: {
        site: 'localhost',
        options: {
          initialPort: 4000
        }
      }
    }


  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-link-checker');

  // Default task(s).
  grunt.registerTask('default', ['uglify','jshint']);

};
