"use strict";

var gulp          = require('gulp'),
    browserify    = require('gulp-browserify'),
    rename        = require('gulp-rename'),
    jshint        = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    footer        = require('gulp-footer'),
    fs            = require('fs'),
    jsbeautify    = require('js-beautify').js_beautify;

gulp.task('browserifyKiwapp', function(){
    fs.readFile('dev/kiwapp/version.js', 'utf8', function (err,data) {

        if(err) {
            throw err;
        }

        var version = data.split('\'')[1].replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
      gulp.src('./dev/kiwapp/kiwapp.js')
        .pipe(browserify())
        .pipe(rename('kiwapp.js'))
        .pipe(footer(';'))
        .pipe(gulp.dest('.'));
    });

});

gulp.task('checkKiwapp', function () {
  return gulp.src(['./dev/kiwapp/**/*.js', './dev/utils/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(jshintStylish));
});

gulp.task('default', function(){
    gulp.run('checkKiwapp');
    gulp.run('browserifyKiwapp');
    gulp.run('version');
});


gulp.task('watch', function(){
    gulp.watch( './dev/**/*.js',function(evt){
        console.log(evt.path, 'changed');
        gulp.run('default');
    });
});

// Auto update the version inside bower and package.json
gulp.task("version", function() {

    fs.readFile('dev/kiwapp/version.js', 'utf8', function (err,data) {

        if(err) {
            throw err;
        }

        var version = data.split('\'')[1].replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');

        fs.readFile('./bower.json', function(err, bower) {
            if(err) {
                throw err;
            }
            var content = JSON.parse(bower);
            content.version = version;
            fs.writeFile("./bower.json", jsbeautify(JSON.stringify(content)));
        });

        fs.readFile('./package.json', function(err, pck) {
            if(err) {
                throw err;
            }
            var content = JSON.parse(pck);
            content.version = version;
            fs.writeFile("./package.json", jsbeautify(JSON.stringify(content)));
        });

    });
});
