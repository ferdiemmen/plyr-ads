'use strict';

let gulp            = require('gulp');
let sass            = require('gulp-sass');
let browserSync     = require('browser-sync');


gulp.task('demo', ['demo:build'], () => {
  browserSync.init({
    server: {
      baseDir: './docs'
    }
  });

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
    .pipe(gulp.dest('./docs/js'))
    .pipe(browserSync.reload({stream: true}));
})