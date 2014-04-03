var gulp          = require('gulp'),
    browserify    = require('gulp-browserify'),
    rename        = require('gulp-rename'),
    jshint        = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    footer        = require('gulp-footer'),
    fs            = require('fs');

gulp.task('browserifyKiwapp', function(){
    fs.readFile('dev/kiwapp/version.js', 'utf8', function (err,data) {
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
});


gulp.task('watch', function(){
    gulp.watch( './dev/**/*.js',function(evt){
        console.log(evt.path, 'changed');
        gulp.run('default');
    });
});