const { src, dest } = require('gulp'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cssvars = require('postcss-simple-vars'),
  nested = require('postcss-nested'),
  cssImport = require('postcss-import');



function styles() {
  return src('./src/css/style.css')
    .pipe(postcss([cssImport, cssvars, nested, autoprefixer]))
    .pipe(dest('./temp/css'));
}


exports.styles = styles;