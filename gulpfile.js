'use strict';

const gulp          = require('gulp');
const util          = require('gulp-util');
const sass          = require('gulp-sass');
const path          = require('path');
const sourcemaps    = require('gulp-sourcemaps');
const rollup        = require('gulp-better-rollup');
const babel         = require('rollup-plugin-babel');
const commonjs      = require('rollup-plugin-commonjs');
const resolve       = require('rollup-plugin-node-resolve');
const browserSync   = require('browser-sync');


// Browserlist
const browsers = ['> 1%'];

// Babel config
const babelrc = {
  presets: [
    'stage-3',
    [
      'env',
        {
          targets: {
            browsers,
          },
          useBuiltIns: true,
          modules: false,
        },
    ]
  ],
  exclude: 'node_modules/**',
};


// Paths
const root = process.cwd();
const paths = {
  js: {
    src: path.join(root, 'src', 'js', '**', '*.js'),
    dest: path.join(root, 'dist')
  },
  css: {
    src: path.join(root, 'src', 'js', '**', '*.css'),
    dest: path.join(root, 'dist')
  },
  demo: {
    js: {
      dest: path.join(root, 'demo', 'js')
    },
    css: {
      dest: path.join(root, 'demo', 'css')
    }
  }
}


// Default
gulp.task('default', ['demo']);


// Javascript
gulp.task('js', () => {
  return gulp.src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(rollup({
      plugins: [
        resolve(),
        babel(babelrc)
      ]
    }, {
      name: 'PlyrAds', format: 'umd',
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.js.dest))
    .pipe(gulp.dest(paths.demo.js.dest))
    .pipe(browserSync.reload({ stream: true }));
});


// Stylesheets
gulp.task('css', () => {
  return gulp.src(paths.css.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(gulp.dest(paths.demo.css.dest))
    .pipe(browserSync.reload({ stream: true }));
});


// BrowserSync
gulp.task('demo', ['js', 'css'], () => {

  browserSync.init({
    server: {
      baseDir: './demo'
    }
  });

  if (util.env.watch) {
    gulp.watch(paths.css.src, ['css']);
    gulp.watch(paths.js.src, ['js']);
  }
});
