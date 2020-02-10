const gulp = require('gulp');
const del = require('del');
const emoji = require('emoji.json');
const file = require('gulp-file');
const fs = require('fs')
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const nunjucks = require('nunjucks');
const htmlmin = require('gulp-htmlmin');

const BUILD_DIR = './build/';
const SRC_DIR = './src/';
const CSS_CLASSNAME_PREFIX = 'emoji_kb_ext-';
const EMOJI_FILE = './emoji.json';

const nunjucksEnv = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(),
	{
		trimBlocks: true,
		noCache: true,
	});
nunjucksEnv.addFilter('cssPre', (text) => {
	return text.split(' ').map((baseClass) => CSS_CLASSNAME_PREFIX + baseClass).join(' ');
});

function buildEmojiConfig() {
	// Nastiness that basically transforms emoji.json into something we can use.
	const textToEmojiMap = {};
	const emojiToTextMap = {};
	const categorizedEmoji = {}
	emoji.forEach((entry) => {
		const {char, name, keywords, category} = entry;
		if (category === 'Component') {
			return;
		}
		if (name.indexOf('⊛') > -1) {
			return;
		}
		if (!(category in textToEmojiMap)) {
			textToEmojiMap[category] = char;
			emojiToTextMap[char] = category;
		}
		if (!(textToEmojiMap[category] in categorizedEmoji)) {
			categorizedEmoji[textToEmojiMap[category]] = [];
		}
		const searchWordsList = keywords.split(' | ');
		if (category === 'Flags') {
			if (name.indexOf('flag: ') === 0) {
				searchWordsList.push(name.substring(6).toLowerCase());
			}
		}
		categorizedEmoji[textToEmojiMap[category]].push({
			text: char,
			altText: name,
			searchWords: searchWordsList.join(','),
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

function init(callback) {
	if (fs.existsSync(EMOJI_FILE)) {
		callback();
		return;
	}
	fs.writeFile(EMOJI_FILE, JSON.stringify(buildEmojiConfig(), null, 2), callback);
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
	const emojiConfig = fs.readFileSync(EMOJI_FILE);
	const renderedTemplate =
		nunjucksEnv.render(SRC_DIR + 'templates/keyboard.html.nj', JSON.parse(emojiConfig));
	
	return file('keyboard.html', renderedTemplate, { src: true })
		.pipe(htmlmin())
		.pipe(gulp.dest(BUILD_DIR + 'firefox'));
}

function firefoxCss() {
	const emojiConfig = fs.readFileSync(EMOJI_FILE);
	const renderedTemplate =
		nunjucksEnv.render(SRC_DIR + 'templates/keyboard.css.nj', JSON.parse(emojiConfig));
	
	return file('keyboard.css', renderedTemplate, { src: true })
		.pipe(gulp.dest(BUILD_DIR + 'firefox'));
}

function watchFirefox() {
	return gulp.watch([SRC_DIR + '**/*'], firefox).on('error', (error) => {
		console.log(error);
		this.emit('end');
	});
}

function chromeScripts() {
	return browserify()
		.add(SRC_DIR + 'chrome/ContentScript.ts')
		.plugin(tsify, {project: SRC_DIR + 'chrome/tsconfig.json'})
		.bundle()
		.pipe(source('ContentScript.js'))
		.pipe(gulp.dest(BUILD_DIR + 'chrome'));
}

function chromeManifest() {
	return gulp.src(SRC_DIR + 'chrome/manifest.json')
		.pipe(gulp.dest(BUILD_DIR + 'chrome'));
}

function chromeHtml() {
	const emojiConfig = fs.readFileSync(EMOJI_FILE);
	const renderedTemplate =
		nunjucksEnv.render(SRC_DIR + 'templates/keyboard.html.nj', JSON.parse(emojiConfig));

	return file('keyboard.html', renderedTemplate, { src: true })
		.pipe(htmlmin())
		.pipe(gulp.dest(BUILD_DIR + 'chrome'));
}

function chromeCss() {
	const emojiConfig = fs.readFileSync(EMOJI_FILE);
	const renderedTemplate =
		nunjucksEnv.render(SRC_DIR + 'templates/keyboard.css.nj', JSON.parse(emojiConfig));

	return file('keyboard.css', renderedTemplate, { src: true })
		.pipe(gulp.dest(BUILD_DIR + 'chrome'));
}

function watchChrome() {
	return gulp.watch([SRC_DIR + '**/*'], chrome).on('error', (error) => {
		console.log(error);
		this.emit('end');
	});
}

const firefox = gulp.series(
	clean,
	init,
	gulp.parallel(firefoxScripts, firefoxManifest, firefoxHtml, firefoxCss));

const chrome = gulp.series(
	clean,
	init,
	gulp.parallel(chromeScripts, chromeManifest, chromeHtml, chromeCss));

exports.clean = clean;
exports['init'] = init;
exports['build-ff'] = firefox;
exports['watch-ff'] = gulp.series(firefox, watchFirefox);
exports['build-chr'] = chrome;
exports['watch-chr'] = gulp.series(chrome, watchChrome);