import gulp from 'gulp';
import gutil from 'gulp-util';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';

const $ = gulpLoadPlugins();
const bs = browserSync.create();

const scssPaths = {
  scssAssets: './assets/scss'
};

const distPaths = {
  distCss: './public/css',
  distJs: './public/js'
};

function errorAlert(err) {
  $.notify.onError({
    title: 'Gulp Error',
    message: 'An error occured, check your terminal',
    sound: 'Basso'
  })(err);
  gutil.log(gutil.colors.red(err.toString()));
  this.emit('end');
}

gulp.task('scss->css', () => {
  return gulp.src(scssPaths.scssAssets + '/main.scss')
  .pipe($.plumber({errorHandler: errorAlert}))
  .pipe($.sass({
    includePaths: [
      scssPaths.scssAssets]}))
  .pipe($.autoprefixer({
    browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Android >= 4']
  }))
	.pipe($.minifyCss())
	.pipe($.rename({
  suffix: '.min'
}))
  .pipe(gulp.dest(distPaths.distCss))
  .pipe($.notify({
    title: 'Stylesheets recompiled',
    message: '<%= file.relative %>'
  }));
});

gulp.task('default', () => {
  bs.init({
    browser: 'google chrome',
    server: './'
  });
  gulp.watch(scssPaths.scssAssets + '/**/*.scss', ['scss->css', bs.reload]);
});
