'use strict';

const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const StyleDictionary = require('./style-dictionary');

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

function compileTokens(done) {
	StyleDictionary.build({
		source: ['src/tokens/base/*.json', 'src/tokens/globals/*.json'],
		themeSource: ['src/tokens/base/*.json', `src/tokens/themes/:theme/*.json`],
		themes: ['dark'],
		buildPath: 'src/',
	});
	done();
};

function copyfont() {
	return gulp.src('./src/fonts/**')
		.pipe(gulp.dest('./lib/fonts'));
}

gulp.task('build', gulp.series([compileTokens, compile, copyfont]))

gulp.task('build:tokens', compileTokens);

gulp.task('watch', gulp.series(['build', () => {
	gulp.watch('./src/tokens/**/*.json', gulp.series(['build:tokens']));
	gulp.watch('./src/**/*.scss', gulp.series(['build']));
}]));