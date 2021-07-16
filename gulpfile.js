'use strict';

const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

function compile() {
  return gulp.src('./src/*.scss')
    .pipe(sass.sync())
    .pipe(autoprefixer({
      browsers: ['ie > 9', 'last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./lib'));
}

function copyfont() {
  return gulp.src('./src/fonts/**')
    .pipe(gulp.dest('./lib/fonts'));
}

gulp.task('build', gulp.series([compile, copyfont]))

gulp.task('watch', gulp.series(['build', () => {
	gulp.watch('./src/**/*.scss', gulp.series(['build']));
}]));

