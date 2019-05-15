const gulp = require('gulp');
const del = require('del');
const emoji = require('emoji.json');
const file = require('gulp-file');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const nunjucks = require('nunjucks');
const htmlmin = require('gulp-htmlmin');

const BUILD_DIR = './build/';
const SRC_DIR = './src/';
const CSS_CLASSNAME_PREFIX = 'emoji_kb_ext-';

const nunjucksEnv = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(),
	{
		trimBlocks: true,
		noCache: true,
	});
nunjucksEnv.addFilter('cssPre', (text) => {
	return text.split(' ').map((baseClass) => CSS_CLASSNAME_PREFIX + baseClass).join(' ');
});

function buildEmojiMap() {
	// Nastiness that basically transforms emoji.json into something we can use.
	const textToEmojiMap = {};
	const emojiToTextMap = {};
	const categorizedEmoji = {}
	emoji.forEach((entry) => {
		const {char, name, keywords, category} = entry;
		if (!(category in textToEmojiMap)) {
			textToEmojiMap[category] = char;
			emojiToTextMap[char] = category;
		}
		if (!(textToEmojiMap[category] in categorizedEmoji)) {
			categorizedEmoji[textToEmojiMap[category]] = [];
		}
		categorizedEmoji[textToEmojiMap[category]].push({
			text: char,
			altText: name,
			searchWords: keywords.split(' | ').join(','),
		});	
	});
	const categories = [];
	for(let category in categorizedEmoji) {
		categories.push({
			name: category,
			altText: emojiToTextMap[category],
			emojis: categorizedEmoji[category],
		});
	}
	return {categories};
}


function clean() {
	return del([
		BUILD_DIR + '**/*.js',
		BUILD_DIR + '**/*.ts',
		BUILD_DIR + '**/*.tsbuildinfo',
		BUILD_DIR + '**/*.json',
		BUILD_DIR + '**/*.html',
		BUILD_DIR + '**/*.css',
	]);
}

function firefoxScripts() {
	return browserify()
		.add(SRC_DIR + 'firefox/ContentScript.ts')
		.plugin(tsify, {project: SRC_DIR + 'firefox/tsconfig.json'})
		.bundle()
		.pipe(source('ContentScript.js'))
		.pipe(gulp.dest(BUILD_DIR + 'firefox'));
}

function firefoxManifest() {
	return gulp.src(SRC_DIR + 'firefox/manifest.json')
		.pipe(gulp.dest(BUILD_DIR + 'firefox'));
}

function firefoxHtml() {
	const renderedTemplate =
		nunjucksEnv.render(SRC_DIR + 'templates/keyboard.html.nj', buildEmojiMap());
	
	return file('keyboard.html', renderedTemplate, { src: true })
		.pipe(htmlmin())
		.pipe(gulp.dest(BUILD_DIR + 'firefox'));
}

function firefoxCss() {
	const renderedTemplate =
		nunjucksEnv.render(SRC_DIR + 'templates/keyboard.css.nj', {});
	
	return file('keyboard.css', renderedTemplate, { src: true })
		.pipe(gulp.dest(BUILD_DIR + 'firefox'));
}

function watchFirefox() {
	return gulp.watch([SRC_DIR + '**/*'], firefox);
}

const firefox = gulp.series(
	clean,
	gulp.parallel(firefoxScripts, firefoxManifest, firefoxHtml, firefoxCss));

exports.clean = clean;
exports['build-ff'] = firefox;
exports['watch-ff'] = gulp.series(firefox, watchFirefox);