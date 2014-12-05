"use strict";

var gulp          = require('gulp'),
    gutil    = require('gulp-util'),
    browserify    = require('gulp-browserify'),
    rename        = require('gulp-rename'),
    jshint        = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    footer        = require('gulp-footer'),
    fs            = require('fs'),
    jsbeautify    = require('js-beautify').js_beautify,
    path          = './src';

gulp.task('browserifyKiwapp', function(){
    fs.readFile(path + '/kiwapp/version.js', 'utf8', function (err,data) {

        if(err) {
            throw err;
        }

        var version = data.split('\'')[1].replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
        gulp.src(path + '/kiwapp/kiwapp.js')
        .pipe(browserify())
        .pipe(rename('kiwapp.js'))
        .pipe(footer(';'))
        .pipe(gulp.dest('.'));
    });

});

gulp.task('checkKiwapp', function () {
  return gulp.src([path + '/kiwapp/**/*.js', path + '/utils/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(jshintStylish));
});

gulp.task('prod', ['default']);

gulp.task('default', function(){
    gulp.start('checkKiwapp');
    gulp.start('browserifyKiwapp');
    gulp.start('version');
});


gulp.task('watch', function(){
    gulp.watch( path + '/**/*.js',function(evt){
        console.log(evt.path, 'changed');
        gulp.start('default');
    });
});

// Auto update the version inside bower and package.json
gulp.task("version", function() {

    fs.readFile(path + '/kiwapp/version.js', 'utf8', function (err,data) {

        if(err) {
            throw err;
        }

        var version = data.split('\'')[1].replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
        if(gutil.env.version) {
            version = gutil.env.version;
            fs.writeFile(path + "/kiwapp/version.js", "module.exports = '" + version + "';");
        }

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
