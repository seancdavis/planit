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
  gulp.src('source/javascripts/*.coffee')
    .pipe(concat('planit.coffee'))
    .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./'))
});

// Lint Task
gulp.task('jslint', function() {
  return gulp.src('./planit.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Minify JS
gulp.task('uglify', function() {
  return gulp.src('./planit.js')
    .pipe(rename('planit.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Compile Sass
gulp.task('sass', function() {
  return gulp.src('source/stylesheets/*.scss')
    .pipe(sass())
    .pipe(cssbeautify())
    .pipe(gulp.dest('./'))
    .pipe(cssmin())
    .pipe(rename('planit.min.css'))
    .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('source/javascripts/*.coffee', ['coffee', 'jslint', 'uglify']);
  gulp.watch('source/stylesheets/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['watch']);
