const { watch, series } = require("gulp"),
  //{ styles } = require('./styles'),
  scripts = require("./scripts"),
  browserSync = require("browser-sync");

function browse() {
  console.log("browse ....");
  browserSync.init({
    notify: false,
    server: {
      baseDir: "dist"
    }
  });
  //watch(['./src/index.html'], series('html'));
  //watch(['./src/css/**/*.css'], series(styles));
  watch(["./src/js/**/*.js"], series(scripts, reload));//reload
}

// function injectCss() {
//   return gulp.src("./css/styles.css").pipe(browserSync.stream());
// }
function reload() {
  return new Promise(resolve=>{
    browserSync.reload();
    resolve();
  });
}

module.exports.watch = browse;
