// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var coffee = require('gulp-coffee');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var cssbeautify = require('gulp-cssbeautify');
var cssmin = require('gulp-cssmin');

// Coffee
gulp.task('coffee', function() {
  return gulp.src([
    // Planit
    'source/javascripts/planit.coffee',
    // Plan
    'source/javascripts/planit/plan.coffee',
    'source/javascripts/planit/plan/init.coffee',
    'source/javascripts/planit/plan/zoomable.coffee',
    'source/javascripts/planit/plan/events.coffee',
    // Marker
    'source/javascripts/planit/marker.coffee',
    // Init
    'source/javascripts/planit/init.coffee'
  ])
    .pipe(concat('planit-tmp.coffee'))
    .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(sourcemaps.write())
    .pipe(rename('planit.js'))
    .pipe(gulp.dest('./'));
});

// Lint Task
gulp.task('jslint', function() {
  return gulp.src('./planit.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Minify JS
gulp.task('jsdist', function() {
  return gulp.src('./planit.js')
    .pipe(rename('planit.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Compile Sass
gulp.task('sass', function() {
  return gulp.src('source/stylesheets/*.scss')
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .pipe(cssbeautify())
    .pipe(gulp.dest('./'));
});

// Minify CSS
gulp.task('cssdist', function() {
  return gulp.src('./planit.css')
    .pipe(cssmin())
    .pipe(rename('planit.min.css'))
    .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('source/javascripts/**/*.coffee', ['coffee', 'jslint']);
  gulp.watch('source/stylesheets/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['watch']);
