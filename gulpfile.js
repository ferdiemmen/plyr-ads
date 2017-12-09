'use strict';

const gulp          = require('gulp');
const util          = require('gulp-util');
const sass          = require('gulp-sass');
const size          = require('gulp-size');
const sourcemaps    = require('gulp-sourcemaps');
const plumber       = require('gulp-plumber');
const rollup        = require('gulp-better-rollup');
const babel         = require('rollup-plugin-babel');
const uglify        = require('rollup-plugin-uglify');
const { minify }    = require('uglify-es');
const resolve       = require('rollup-plugin-node-resolve');
const path          = require('path');
const browserSync   = require('browser-sync');


// Browserlist
const browsers = ['> 1%'];

// Size plugin
const sizeOptions = { showFiles: true, gzip: true };

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
    src: path.join(root, 'demo', '**', '*'),
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
    .pipe(plumber())
    .pipe(rollup({
      plugins: [
        resolve(),
        babel(babelrc),
        uglify({}, minify)
      ]
    }, {
      name: 'PlyrAds', format: 'umd',
    }))
    .pipe(size(sizeOptions))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.js.dest))
    .pipe(gulp.dest(paths.demo.js.dest))
    .pipe(browserSync.reload({ stream: true }));
  });
  
  
  // Stylesheets
  gulp.task('css', () => {
    return gulp.src(paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(size(sizeOptions))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(gulp.dest(paths.demo.css.dest))
    .pipe(browserSync.reload({ stream: true }));
});


// BrowserSync
gulp.task('demo', ['js', 'css'], () => {

  browserSync.init({
    open: false,
    files: [
      paths.demo.src
    ],
    server: {
      baseDir: './demo',
    }
  });

  if (util.env.watch) {
    gulp.watch(paths.css.src, ['css']);
    gulp.watch(paths.js.src, ['js']);
  }
});
