const { src, dest, task, series, parallel, watch } = require('gulp'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  usemin = require('gulp-usemin'),
  rev = require('gulp-rev'),
  cssnano = require('gulp-cssnano'),
  uglify = require('gulp-uglify'),
  browserSync = require('browser-sync'),
  { icons } = require('./sprites'),
  { styles } = require('./styles'),
  { scripts } = require('./scripts')
  ;

function copySdkFiles() {
  const path = '../sdk/sdk-javascript/udc-3g-sdk/**/*'
  return src(path)
    .pipe(dest('./dist/udc-3g-sdk'));
}

function previewDist() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: "dist"
    }
  });

  
  watch(['./src/css/**/*.css'], series(styles, injectCss));
  watch(['./src/js/**/*.js'], series(scripts, scriptsRefresh));

};
function injectCss(){
  return src('./temp/css/style.css')
  .pipe(browserSync.stream());
}
function scriptsRefresh(){
  return browserSync.reload();
}
function deleteDistFolder() {
  return del('./dist');
};


function copyFontFiles() {
  const pathsToCopy = ['./src/css/fonts/**/*'];
  return src(pathsToCopy)
    .pipe(dest('./dist/css/fonts'));
};

function copyGoJsFiles() {
  const pathsToCopy = [
    './src/js/gojs/extensions.min.js',
    './src/js/gojs/db25.svg',
    './src/js/gojs/db25.png'
  ];
  return src(pathsToCopy)
    .pipe(dest('./dist/js/gojs'));
};


function optimizeImages() {
  const config = {
    progressive: true,
    interlaced: true,
    multipass: true
  }
  return src(['./src/img/**/*', '!./src/img/sprites'])
    .pipe(imagemin(config))
    .pipe(dest('./dist/img'));
};

function htmlAndAssets() {
  const config = {
    css: [function () { return rev() }, function () { return cssnano() }],
    js: [function () { return rev() }, function () { return uglify() }]
  }
  return src('./src/index.html')
    .pipe(usemin(config))
    .pipe(dest('./dist'));
};



exports.build =
  series(
    deleteDistFolder,
    icons,
    scripts,
    styles,
    optimizeImages,
    parallel(htmlAndAssets, copyFontFiles, copyGoJsFiles)
  );
exports.previewDist =
  series(
    deleteDistFolder,
    icons,
    scripts,
    styles,
    optimizeImages,
    parallel(
      htmlAndAssets, 
      copyFontFiles, 
      copyGoJsFiles,
    ),
    parallel(
      copyCommonFiles,
      copyCommonSdkFiles,
      copySdkFiles,
    ),
    previewDist
  );


  // if (process.env.NODE_ENV === 'production') {
  //   exports.build = series(transpile, minify);
  // } else {
  //   exports.build = series(transpile, livereload);
  // }