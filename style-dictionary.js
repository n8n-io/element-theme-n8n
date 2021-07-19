const StyleDictionaryPackage = require('style-dictionary');
const TRANSFORMS = ["attribute/cti", "name/cti/kebab", "size/rem"];
const CUSTOM_FORMAT = 'css/custom';
const THEMES = ['dark'];

const build = () => {
	buildDictionary(getGlobalConfig(), {
		wrapper: ':root'
	});

	THEMES.forEach((theme) => {
		buildDictionary(getThemeConfig(theme), {
			wrapper: `body.theme-${theme}`
		});
	});
};

function buildDictionary(config, {wrapper}) {
	const StyleDictionary = StyleDictionaryPackage.extend(config);
	const {
		fileHeader,
		formattedVariables
	} = StyleDictionary.formatHelpers;

	StyleDictionary.registerFormat({
		name: CUSTOM_FORMAT,
		formatter: function ({
			dictionary,
			file,
			options
		}) {
			const {
				outputReferences
			} = options;
			dictionary.allTokens = dictionary.allTokens.reduce((accu, token) => {
				if (token.attributes.ignore) {
					return accu;
				}

				if (isHSLColorToken(token)) {
					return accu.concat(getColorTokens(token));
				}

				accu.push(token);
				return accu;
			}, []);
			
			return fileHeader({
					file
				}) +
				`@mixin theme {\n` +
				formattedVariables({
					format: 'css',
					dictionary,
					outputReferences
				}) +
				`\n}\n ${wrapper} { @include theme }`;
		}
	});
	StyleDictionary.buildAllPlatforms();
}


function getGlobalConfig() {
	return {
		source: ['src/tokens/base/*.json', 'src/tokens/globals/*.json'],
		platforms: {
			scss: {
				transforms: TRANSFORMS,
				buildPath: 'src/',
				files: [{
					destination: '_tokens.scss',
					format:CUSTOM_FORMAT 
				}]
			}
		}
	}
}

function getThemeConfig(theme) {
	return {
		source: ['src/tokens/base/*.json', `src/tokens/themes/${theme}/*.json`],
		platforms: {
			scss: {
				transforms: TRANSFORMS,
				buildPath: 'src/',
				files: [{
					destination: `_tokens.${theme}.scss`,
					format:CUSTOM_FORMAT 
				}]
			}
		}
	}
}


function isHSLColorToken(token) {
	return token.attributes.category === 'color' && typeof token.value === 'string' && token.value.startsWith('hsl(');
}

function getColorTokens(token) {
	const res = [];
	const colors = token.value.replace('hsl(', '').replace(')', '').split(',');
	const parts = ['h', 's', 'l'];
	colors.map((v, i) => {
		res.push({
			...token,
			value: v,
			name: `${token.name}-${parts[i]}`,
		});
	});

	res.push({
		...token,
		value: `hsl(var(--${token.name}-h), var(--${token.name}-s), var(--${token.name}-l))`
	});

	if (token.tint && Array.isArray(token.tint)) {
		token.tint.forEach((tint, i) => {
			res.push({
				...token,
				name: `${token.name}-tint-${i + 1}`,
				value: `hsl(var(--${token.name}-h), var(--${token.name}-s), ${tint}%)`
			});
		});
	}

	if (token.shade && Array.isArray(token.shade)) {
		token.shade.forEach((shade, i) => {
			res.push({
				...token,
				name: `${token.name}-shade-${i + 1}`,
				value: `hsl(var(--${token.name}-h), var(--${token.name}-s), ${shade}%)`
			});
		});
	}

	return res;
}

module.exports = {
	build
};
