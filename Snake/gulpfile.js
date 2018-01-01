const gulp = require('gulp');
const uglify = require('gulp-uglify');
const size = require('gulp-size');
const concat = require('gulp-concat');
const minify = require('gulp-minify');

var jsFiles = 'assets/scripts/**/*.js',
    jsDest = 'dist/scripts';

gulp.task('default', function () {
    return gulp.src(['node_modules/jquery/dist/**/*.js', jsFiles])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(uglify())
        .pipe(minify({
                ext: {
                    src: '-debug.js',
                    min: '.js'
                },
                exclude: ['tasks'],
                ignoreFiles: ['.combo.js', '-min.js']
        }))

        //.pipe(size())

    //return gulp.src([
    //    //'d:\\Users\Emran\\documents\\visual studio 2017\\Projects\\Snake\\Snake\\public\\javascripts\\**\\*.js'
    //    'assets/scripts/**/*.js',
    //    //'./resources/js/app.js'
    //    //'./resources/js/app.js'
    //])
    //    .pipe(concat('script.min.js'))
    //    .pipe(uglify())
    //    .pipe(size())
    //    .pipe(gulp.dest('dist/scripts'));
});