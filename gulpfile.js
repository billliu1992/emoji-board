const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const firefoxTsProject = ts.createProject('src/firefox/tsconfig.json');

function clean(cb) {
	del(['build/**/*.js', 'build/**/*.ts'], cb);
}

function firefox() {
	return firefoxTsProject.src()
		.pipe(concat('emoji.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/firefox'));
}

exports.clean = clean;
exports.firefox = firefox;