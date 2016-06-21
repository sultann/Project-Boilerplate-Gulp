var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var flatten      = require('gulp-flatten');
var imagemin     = require('gulp-imagemin');
var jshint       = require('gulp-jshint');
var lazypipe     = require('lazypipe');
var runSequence  = require('run-sequence');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var browserSync  = require('browser-sync').create();
var changed      = require('gulp-changed');
var concat       = require('gulp-concat');
var cssNano      = require('gulp-cssnano');
var plumber      = require('gulp-plumber');
var rev          = require('gulp-rev');
var development    = true;
var devUrl        = 'http://example.com';
//fonts, images, styles, scripts
gulp.task('styles', function () {
  return gulp.src(['./build/styles/main.scss', './build/styles/plugins/*.css'])
      .pipe(gulpif(development,sourcemaps.init()))
      .pipe(sass({
              outputStyle: 'nested', // libsass doesn't support expanded yet
              precision: 10,
              includePaths: ['.'],
      }).on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: [
          'last 2 versions',
          'android 4',
          'opera 12',
          'IE 7'
        ]
      }))
      .pipe(concat('main.min.css'))
      .pipe(cssNano({
          discardComments: {removeAll: true},
          safe:true
      }))
      .pipe(gulpif(development,sourcemaps.write('.')))
      .pipe(gulp.dest('./assets/styles/'))
      .pipe(browserSync.stream());
});

gulp.task('scripts', function (){
    return gulp.src([
        './build/scripts/primary/*js','./build/scripts/plugins/*js', './build/scripts/scripts.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulpif(development,sourcemaps.init()))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify({
            compress: {
                'drop_debugger': true,
                'drop_console':true,
                'unused':true,
            }
        }))
        .pipe(gulpif(development,sourcemaps.write('.')))
        .pipe(gulp.dest('./assets/scripts/'))
        .pipe(browserSync.stream());
});
gulp.task('fonts', function() {
    return gulp.src(['./builds/fonts/*.*'])
        .pipe(flatten())
        .pipe(gulp.dest('./assets/fonts/'))
        .pipe(browserSync.stream());
});

gulp.task('images', function() {
    return gulp.src(['./builds/images/*.*'])
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest('./assets/images/'))
        .pipe(browserSync.stream());
});

gulp.task('watch', function() {
    browserSync.init({
        files: ['**/*.php', '*.php','*.html'],
        proxy: devUrl,
    });
    gulp.watch([ './builds/styles/**/*'], ['styles']);
    gulp.watch(['./builds/scripts/**/*'], ['scripts']);
    gulp.watch(['./builds/fonts/**/*'], ['fonts']);
    gulp.watch(['./builds/images/**/*'], ['images']);
});

//Build process
gulp.task('build', function(callback) {
  runSequence('styles',
              'scripts',
              ['fonts', 'images'],
              callback);
});

// Deletes the build folder completely
gulp.task('clean', require('del').bind(null, ['./assets/']));

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
