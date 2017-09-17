// Yukon Admin (AngularJS version)

var gulp = require('gulp'),
    plugins = require("gulp-load-plugins")({
        pattern: ['gulp-*', 'gulp.*', '*'],
        replaceString: /\bgulp[\-.]/
    });

// browser sync
var reload = plugins.browserSync.reload;

gulp.task('minify_js', function () {
    gulp.src([
        'assets/angular/*.js',
        '!assets/angular/*.min.js',
        'assets/angular/states_jquery/*.js',
        '!assets/angular/states_jquery/*.min.js',
        'assets/js/**/*.js',
        '!assets/js/**/*.min.js'
    ])
        .pipe(plugins.size({
            showFiles: true
        }))
        .pipe(plugins.uglify({
            mangle: false
        }))
        .pipe(plugins.rename({
            extname: ".min.js"
        }))
        .pipe(plugins.size({
            showFiles: true
        }))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

gulp.task('less', function() {
    gulp.src('assets/less/main.less')
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer({
            browsers: ['> 5%','last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('assets/css/'))
        .pipe(plugins.minifyCss({ keepSpecialComments: 0 }))
        .pipe(plugins.rename('main.min.css'))
        .pipe(gulp.dest('assets/css/'))
        .pipe(reload({stream: true}));
});

gulp.task('default', [ 'less', 'minify_js' ], function() {
    plugins.browserSync({
        // Proxy an EXISTING vhost
        // http://www.browsersync.io/docs/options/#option-proxy
        proxy: "localhost/yukon/App/"
    });
    gulp.watch('assets/less/**/*.less', ['less']);
    gulp.watch([
        'index.html',
        'assets/angular/*.js',
        'assets/angular/states_jquery/*.js',
        'assets/js/**/*.js'
    ]).on('change', reload);
});