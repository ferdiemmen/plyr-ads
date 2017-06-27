'use strict';

const gulp            = require('gulp');
const sass            = require('gulp-sass');
const babel           = require('gulp-babel');
const sourcemaps      = require('gulp-sourcemaps');
const browserSync     = require('browser-sync');


// Initialize BrowserSync
browserSync.init({
  server: {
    baseDir: './docs'
  }
});


gulp.task('demo', ['demo:build'], () => {
  gulp.watch('./src/scss/**/*.scss', ['demo:build:css']);
  gulp.watch('./src/js/**/*.js', ['demo:build:js']);
});


gulp.task('demo:build',
  [
    'demo:build:css',
    'demo:build:js',
  ], (done) => {

  done();
});


gulp.task('demo:build:css', () => {
  return gulp.src('./src/scss/plyr-ads.scss')
    .pipe(sass())
    .pipe(gulp.dest('./docs/css'))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('demo:build:js', () => {
  return gulp.src('./src/js/plyr-ads.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./docs/js'))
    .pipe(browserSync.reload({stream: true}));
})