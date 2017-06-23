'use strict';

const gulp            = require('gulp');
const sass            = require('gulp-sass');
const browserSync     = require('browser-sync');
const babel           = require('gulp-babel');


gulp.task('demo', ['demo:build'], () => {
  browserSync.init({
    server: {
      baseDir: './docs'
    }
  });

  gulp.watch('./docs/**/*.html', [browserSync.reload]);
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
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./docs/js'))
    .pipe(browserSync.reload({stream: true}));
})