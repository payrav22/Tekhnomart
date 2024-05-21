const { src, dest, parallel, series, watch } = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const rename = require('gulp-rename');
const sync = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const del = require('del');

const buildStyles = () => src('src/sass/style.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([
    autoprefixer(),
    csso(),
  ]))
  .pipe(rename('style.min.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('build/css'))
  .pipe(sync.stream());

const buildHtml = () => src('src/**/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(dest('build'));

const buildScripts = () => src('src/js/**/*.js')
  .pipe(terser())
  .pipe(dest('build/js'))
  .pipe(sync.stream());

const optimizeImages = () => src('src/img/**/*.{png,jpeg,jpg,svg}')
  .pipe(imagemin([
    imagemin.mozjpeg({ progressive: true }),
    imagemin.optipng({ optimizationLevel: 3 }),
    imagemin.svgo()
  ]))
  .pipe(dest('build/img'));

const copyImages = () => src('src/img/**/*.{png,jpeg,jpg,svg}')
  .pipe(dest('build/img'));

const buildWebp = () => src('src/img/**/*.{jpeg,jpg,png}')
  .pipe(webp({ quality: 80 }))
  .pipe(dest('build/img'));

const buildSprite = () => src('src/img/icons/*.svg')
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(dest('build/img'));

const copy = (done) => {
  src([
    'src/fonts/*.{woff2,woff}',
    'src/manifest.webmanifest',
    'src/img/**/*.svg',
    '!src/img/icons/*.svg',
  ], {
    base: 'src'
  })
    .pipe(dest('build'))
  done();
};

const clean = () => del('build');

const runServer = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

const reload = (done) => {
  sync.reload();
  done();
}

const runWatcher = () => {
  watch('src/sass/**/*.scss', series(buildStyles));
  watch('src/js/**/*.js', series(buildScripts));
  watch('src/**/*.html', series(buildHtml, reload));
}

exports.build = series(
  clean,
  copy,
  optimizeImages,
  parallel(
    buildStyles,
    buildHtml,
    buildScripts,
    buildSprite,
    buildWebp,
  ),
);

exports.default = series(
  clean,
  copy,
  copyImages,
  parallel(
    buildStyles,
    buildHtml,
    buildScripts,
    buildSprite,
    buildWebp,
  ),
  series(
    runServer,
    runWatcher,
  ));
