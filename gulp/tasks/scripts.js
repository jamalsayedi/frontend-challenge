const { src, dest } = require("gulp");
const browserify = require("gulp-browserify");
const rename = require("gulp-rename");

function scripts() {
  return src("src/js/main.js", { read: false })
    .pipe(
      browserify({
        insertGlobals: true,
        debug: false,
//        transform: ["babelify"],
//        extensions: [".js"]
      })
    )
    .pipe(rename("app.js"))
    .pipe(dest("./dist/js"));

  // return browserify({ insertGlobals: true, debug: true })
  //   .transform(babelify)
  //   .bundle()
  //   .pipe(source("bundle.js"))
  //   .pipe(dest("dist"));

  // src("./src/js/main.js")
  //   .pipe(
  //     browserify({
  //       insertGlobals : true,
  //       debug: true,//!gulp.env.production,

  //     })
  //   )
  //   .transform(babelify)
  //   .pipe(dest("./build/"));
}

module.exports = scripts;
