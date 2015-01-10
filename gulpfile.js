'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var paths = {
  js: ['src/*.js'],
  sass: ['src/style/sass/*.scss'],
  demoSource: ['demo/public/index.html', 'demo/public/bundle.js', 'demo/public/style/css/*.css']
};

var watchifyArgs = {
  cache: {}, 
  packageCache: {}, 
  fullPaths: true,
  debug: true
};

var bundler = watchify(browserify('./src/index.js', watchifyArgs));

function compileJS() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./')) 
    .pipe(gulp.dest('./demo/public'));
}

gulp.task('js', compileJS);
bundler.on('update', compileJS);

gulp.task('sass', function compileSass() {
  gulp.src('./src/style/sass/*.scss')
    .pipe(sass())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('demo/public/style/css'));
});

gulp.task('serve', function serveDemo() {
  browserSync({
    server: {
      baseDir: 'demo/public'
    }
  });
});

gulp.task('watch', function watchFiles() {
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.demoSource, reload);
})

gulp.task('default', ['js', 'sass', 'serve', 'watch']);
