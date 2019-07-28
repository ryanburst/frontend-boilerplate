const path = require('path');
const gulp = require('gulp');
const nunjucks = require('gulp-nunjucks-render');
const sass = require('gulp-sass');
const browserify = require('browserify');
const babelify = require('babelify');
const sourcemaps = require('gulp-sourcemaps');
const source = require("vinyl-source-stream");
const clean = require('del');
const rename = require('gulp-rename');
const htmlbeautify = require('gulp-html-beautify');
const es = require('event-stream');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const glob = require('glob');;
const data = require('gulp-data');
const fs = require('fs');
const exists = require('file-exists');
const clone = require('clone-deep');

/**
 * Gulp config options
 */
const config = {
  src: './src',
  // Update to final delivery URL
  // -------
  // This may be the same as rootDist if you want to compile your
  // pages to the root directory, or it can be different if you
  // want your pages to exist deeper in (/credit-cards/etc/)
  dist: './www',
  // The root public dist file, not specific to project, for things
  // like static global files, or anything that needs to go to root
  rootDist: './www'
};


/**
 * data
 * ---------------------------------------------
 * Compiles a data object for the templates. Read
 * in all of the json files in the src/data folder
 * and add them to one massive object that is used
 * by the templates. Each key is turned into a
 * variable by the templating engine.
 * 
 * "useDataFile": "path/to/base/file.json"
 * The above key can be used to specify which json file
 * you would like to use as a base data file. The data
 * in the file using this key will be merged over top
 * of the specified file. This is recursive and will
 * continue to merge data overtop of base data files
 * so long as the key exists.
 *
 * Order:
 *   - data.json
 *   - All other files (file name as key)
 *   - Page template name matches json name
 *
 * data.json: Used as base object. Usually contains
 * keys like "site", "title", "description".
 *
 * other.json: Any file added into the data folder
 * will be added into the master object with the
 * file name (categories.json -> categories) as
 * the key. Will store folder path as key for any
 * nested files (_styleguide/index.json ->
 * _styleguide/index)
 *
 * page.json: If the current page being compiled
 * by the templating engine matches the name of
 * one of the pages keys in the master object, the
 * data is merged into the master object. Collisions
 * will result in the page.json data overwriting
 * any key/values already in the master object.
 *
 * Subfiles are matched based on their folder
 * structure.
 *
 * Example (Rendering - index.html):
 *   - data.json
 *   - index.json
 *
    {
      site: { name: 'Client Name' },
      title: 'Home',
      data: { site: { name: 'Test Site' }, title: 'Test' },
      pages: {index: { name: 'Client Name', title: 'Home', categories: [ 'Test', 'Two', 'Three' ] }},
      page: { name: 'Client Name', title: 'Home', categories: [ 'Test', 'Two', 'Three' ] },
      categories: [ 'Test', 'Two', 'Three' ]
    }
 */
let templateData = {};
const dataFile = config.src + '/data/data.json'
const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}
const merge = (target, source) => {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        merge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }
  return target;
}
// Load page data into page key, as well as merging into master object
const loadTemplateData = file => {
  let dir = file.path.split('src' + path.sep + 'pages' + path.sep)[1];
  let dataKey = dir.replace('.njk', '');
  let pageData = templateData.pages[dataKey] ? clone(templateData.pages[dataKey]) : {};
  let cloneTemplatedata = clone(templateData);

  // Data files can use another page data file as a starting template, merge them together
  // with this data file. This is helpful for alternate versions of page that mostly use
  // the same data with some modifications (ex: index page, index page with alerts).
  let useDataFile = pageData.useDataFile;
  while (useDataFile && templateData.pages[useDataFile]) {
    let linkedData = clone(templateData.pages[useDataFile]);

    useDataFile = linkedData.useDataFile;
    pageData = merge(linkedData, pageData);
  }

  cloneTemplatedata['page'] = pageData;
  cloneTemplatedata['pageIndex'] = dataKey;

  return merge(cloneTemplatedata, pageData);
}

/**
 * data
 * ---------------------------------------------
 * Assembles data for the templates
 */
gulp.task('data', done => {
  // Set the master object with the base data file
  templateData = exists.sync(dataFile)
    ? merge({ pages: {}, data: JSON.parse(fs.readFileSync(dataFile)) }, JSON.parse(fs.readFileSync(dataFile)))
    : { pages: {} };
  // Load all the json files into master object with filename as key
  glob.sync(path.normalize(config.src + '/data/**/*.json')).map((file) => {
    let dir = file.split('src/data/')[1];
    let index = dir.replace('.json', '');
    templateData.pages[index] = JSON.parse(fs.readFileSync(file));
  });

  done();
});

/**
 * clean
 * ---------------------------------------------
 * Completely wipes out the distribution folder.
 */
gulp.task('clean', () => {
  return clean([
    config.dist + '/*'
  ]);
});

/**
 * styles
 * ---------------------------------------------
 * Compiles the scss files into a bundled .css files.
 * This task includes sourcemaps and error logging.
 */
gulp.task('styles', () => {
  return gulp.src(config.src + '/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      noLineComments: true,
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(rename((file) => {
      file.basename += ".min";
      file.extname = ".css"
    }))
    .pipe(gulp.dest(config.dist + '/css'));
});

/**
 * scripts
 * ---------------------------------------------
 * Turns ES6 module JS into JS that can be consumed
 * on the browser through browserify and babel. This
 * task also uglifies the code and includes sourcemaps.
 *
 * Loops through all base JS files in the JS folder
 * and treats them each as a separate bundle.
 */
gulp.task('scripts', (done) => {
  return glob('./src/js/*.js', (err, files) => {
    if(err) done(err);

    let babelifyConfig = {
      "presets":[
        ["babel-preset-env"]
      ],
      "plugins":[
        ["transform-es2015-modules-simple-commonjs"]
      ]
    };

    let tasks = files.map((entry) => {
      return browserify({
        entries: entry
      })
      .transform(babelify, babelifyConfig)
      .bundle()
      .on('error', (err) => {
        console.log(err);
      })
      .pipe(source(entry))
      .pipe(rename({
        dirname: '',
        extname: '.min.js'
      }))
      .pipe(gulp.dest('./www/js'));
    });
    es.merge(tasks).on('end', done);
  });
});

/**
 * images
 * ---------------------------------------------
 * Minifies and copies over image files.
 */
gulp.task('images', () => {
  return gulp.src(config.src + '/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest(config.dist + '/images'));
});

/**
 * statics
 * ---------------------------------------------
 * Copies folder over wholesale
 */
gulp.task('statics', () => {
  return gulp.src(config.src + '/statics/**/*')
    .pipe(gulp.dest(config.dist));
});

/**
 * assemble
 * ---------------------------------------------
 * Puts together template files. The current
 * templating engine is nunjucks and is structured
 * like the following:
 *   \_src
 *     \_pages
 *       \_index.njk
 *       \_about.njk
 *     \_templates
 *       \_layouts
 *         \_default.njk
 *       \_partials
 *         \_header.njk
 *         \_footer.njk
 * https://mozilla.github.io/nunjucks/templating.html
 */
// Custom global Functions for nunjucks
const manageEnvironment = (environment) => {
  environment.addGlobal('randomHash', function () { return Math.random() * 0xffffffff | 0; });
  environment.addGlobal('todaysDate', function () { return new Date(Date.now()).toLocaleString("en-US").split(',')[0]; });
}

gulp.task('assemble', done => {
  return gulp.src(config.src + '/pages/**/*.+(html|njk)')
    .pipe(data(loadTemplateData))
    .pipe(nunjucks({
      path:
        [
          config.src + '/statics/',
          config.src + '/templates'
        ],
      manageEnv: manageEnvironment
    }).on('error', (error) => {
      done(error);
    }))
    .pipe(htmlbeautify({
      indent_size: 2,
      indent_level: 0,
      preserve_newlines: false
    }))
    .pipe(gulp.dest(config.dist));
});

/**
 * watch
 * ---------------------------------------------
 * Watches all files for changes and performs
 * runs the necessary build tasks.
 */
gulp.task('watch', ()=> {
  gulp.watch('./src/scss/**/*.scss', gulp.series('styles'));
  gulp.watch('./src/js/**/**/*.js', gulp.series('scripts'));
  gulp.watch('./src/images/**/*', gulp.series('images'));
  gulp.watch(['./src/**/**/*.njk', config.src + '/data/**/*.json'], gulp.series('data','assemble'));
  gulp.watch('./src/statics/**/**/**', gulp.series('statics'));
});

/**
 * default
 * ---------------------------------------------
 * Runs the main build tasks all at once.
 */
gulp.task('default', gulp.series('styles', 'scripts', 'images', 'statics', 'data', 'assemble'));

/**
 * build
 * ---------------------------------------------
 * Runs the cleaning task to clean the distribution
 * folder before running the default build task.
 */
gulp.task('build', gulp.series('clean', 'default'));