'use strict';

const gulp        = require('gulp');
const path        = require('path');
const sourcemaps  = require('gulp-sourcemaps');
const rollup      = require('gulp-better-rollup');
const babel       = require('rollup-plugin-babel');
const commonjs    = require('rollup-plugin-commonjs');
const resolve     = require('rollup-plugin-node-resolve');

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
    .pipe(gulp.dest(paths.demo.js.dest));
});


// Stylesheets
gulp.task('css', () => {
  return gulp.src(path.css.src)
    .pipe(gulp.dest(path.css.dest))
});
