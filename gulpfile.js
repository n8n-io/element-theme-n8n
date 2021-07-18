'use strict';

const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const StyleDictionary = require('style-dictionary')
	.extend({
		source: ['src/tokens/**/*.json'],
		platforms: {
			scss: {
				transforms: ["attribute/cti", "name/cti/kebab", "size/rem"],
				buildPath: 'src/',
				files: [{
					destination: '_tokens.scss',
					format: 'css/custom'
				}]
			}
		}
	});


const {
	fileHeader,
	formattedVariables
} = StyleDictionary.formatHelpers;

StyleDictionary.registerFormat({
	name: 'css/custom',
	formatter: function ({
		dictionary,
		file,
		options
	}) {
		const {
			outputReferences
		} = options;
		dictionary.allTokens = dictionary.allTokens.reduce((accu, token) => {
			if (token.attributes.category === 'color' && token.value.startsWith('hsl(')) {
				const colors = token.value.replace('hsl(', '').replace(')', '').split(',');
				const parts = ['h', 's', 'l'];
				accu = accu.concat(colors.map((value, i) => {
					return {
						...token,
						value,
						name: `${token.name}-${parts[i]}`,
					};
				}));
				return accu;
			}

			accu.push(token);
			return accu;
		}, []);
		
		return fileHeader({
				file
			}) +
			':root {\n' +
			formattedVariables({
				format: 'css',
				dictionary,
				outputReferences
			}) +
			'\n}\n';
	}
});

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
	StyleDictionary.buildAllPlatforms();
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