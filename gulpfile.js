var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['copy-html', 'copy-images', 'styles'], function() {
  gulp.watch('sass/**/*.scss', ['styles']);
  gulp.watch('js/**/*.js', ['lint']);
  gulp.watch('./index.html', ['copy-html']);
  gulp.watch('./dist/index.html', browserSync.reload);


  browserSync.init({
    server: './dist'
  });
});


gulp.task('copy-html', function () {
  gulp.src('./index.html')
			.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function () {
  gulp.src('./images/*')
			.pipe(gulp.dest('./dist/images'));
});

gulp.task('styles', function() {
  gulp.src('sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('scripts', function () {
  gulp.src('js/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function () {
  gulp.src('js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('dist', [
  'copy-html',
  'copy-images',
  'styles',
  'scripts-dist'
]);
