'use strict';

const gulp            = require('gulp');
const gutil           = require('gulp-util');
const babel           = require('gulp-babel');
const sass            = require('gulp-sass');
const cssnano         = require('gulp-cssnano');
const postcss         = require('gulp-postcss');
const rename          = require('gulp-rename');
const uglify          = require('gulp-uglify');
const browserSync     = require('browser-sync');


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
});

gulp.task('build', [
  'build:css',
  'build:js'
], (done) => {

  done();
});


gulp.task('build:css', () => {

  return gulp.src('./src/scss/plyr-ads.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(postcss([require('autoprefixer'), require('precss')]))
    .pipe(cssnano({
      zindex: false
    }))
    .pipe(rename('plyr-ads.min.css'))
    .pipe(gulp.dest('./dist'))
});


gulp.task('build:js', () => {

  return gulp.src('./src/js/plyr-ads.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify({
      preserveComments: false,
      mangle: true,
      sequences: true,
      dead_code: true,
      conditionals: true,
      booleans: true,
      unused: true,
      if_return: true,
      join_vars: true,
      drop_console: true,
    })).on('error', gutil.log)
    .pipe(rename('plyr-ads.min.js'))
    .pipe(gulp.dest('./dist'));
});
