'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var del = require('del');

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

var bundler = browserify('./index.js');
bundler.transform('brfs');
bundler.transform('serialport-transform');

gulp.task('js', bundle); // so you can run `gulp js` to build the file

function bundle() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you dont want sourcemaps
      // .pipe(buffer())
      // .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      // .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./build'));
}

gulp.task('copy', function() {
  return gulp.src(['./manifest.json', './main.js'])
    .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['js', 'copy']);