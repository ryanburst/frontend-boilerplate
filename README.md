# Gulp Boilerplate

Boilerplate for a project built with Gulp. It is built using the following technologies:

- [Gulp](https://gulpjs.com/)
- [ES6](http://es6-features.org/) (syntax + modules)
- [Nunjucks templating](https://mozilla.github.io/nunjucks/)
- [SASS](https://sass-lang.com/)

## Dependencies

- Node 9.8.0
- NPM 5.8.0
- Gulp 3.9.1

## Installation
1. First clone the repository with `git clone git@[repo] .`. This will pull down all files necessary for the project.

2. Next, remove the origin to the boilerplate repository with `git remote rm origin`. We don't specific project work making its way into the boilerplate repository.

3. After that, run `npm install` to install all node dependencies.

4. Develop!


## Builds
This project utilizes [Gulp](https://gulpjs.com/) task running to build out assets into a distribution folder (www). All delivered files are flat files (html, css, js, static assets).

**Default Build:** Running `gulp` without any arguments will perform all tasks and build everything into the distribution folder.

**Production/Clean Build:** Running `gulp build` will first delete all files from the distribution folder before running the default build task. This is handy for clearing out any files that may no longer be relevant or built and install a fresh build into the distribution folder.

**Watch Build:** During development you can use `gulp watch` to automatically build files while you code. Files will automatically compile and be pushed into the distribution folder.

## Structure
The source files for this repository can be divided into the following categories:
- Templates
- Data
- CSS
- JS
- Images
- Statics

### Templates
The templating engine currently in use is [Nunjucks](https://mozilla.github.io/nunjucks/). Files for templating can be found in two main folders, `pages` and `templates`.

```
\_src
    \_pages
        \_index.njk
    \_templates
        \_layouts
            \default.njk
        \_macros
            \example-macro.njk
        \_partials
            \_header.njk
            \_footer.njk
```

`src/pages` contain all the actual pages that will be compiled out into `.html` files. These files extend layouts, found in `src/templates/layouts` and include partial files found in `src/templates/partials`.

In addition to the actual markup, most of the templates require data to fully compile. This may be meta information, body classes, categories, or other pieces of data that need to be rendered dynamically. This data is inserted into the templating engine during the build process and can be used with Nunjucks syntax. The source of the data is covered in the next section.

### Data
Data for the templating engine can be found in `src/data` as `.json` files. Each file represents a specific set of page data, with the exception of the `data.json` file. Pages are matched based on their filename, so `index.json` will be applied as page data to the `index.html` page. The following examples were taken from the Bayview Project:

Data files should follow the same folder structure as their pages. `pages/account/index.html` would match to `data/account/index.json`. The folder structure, minus the file name, is used as the index or key within the data object that gets passed to the template file (`account/index`).

The matched json file will always have its data pushed to the top level of the object. If the json file is `{title: "Account Home"}`, then using `{{ title }}` in the Nunjucks template file, will output `Account Home`. In addition to the data in the matched json file, the following keys are also available:

* *pages* - Every page and its corresponding data inside a single object, with their folder structure as the key.
* *page* - Stores the current page object in addition to it being available at the top level. Access this if you're worried about collisions at the top level.
* *data* - Base, site wide data you want to give to every page. This data comes from the `data/data.json` file. Like the current page, it is also available at the top level as well as within this index. Because of this, you can override any of the site data by using the same keys in your page data file. `{title:"Bayview",description: "Welcome!"}` in `data.json` and `{title:"Account Home"}` in `data/account/index.json` will become `{title:"Account Home",description: "Welcome!"}`.

Data files can use other data files as a base data file through the use of the `useDataFile` key. This merges the JSON file with the data file specified with the `useDataFile` key. For example, `useDataFile: account/index` in `data/account/index-current.json` will merge with `data/account/index.json`. The use of this key is recursive, enabling you to merge multiple data files at once. This is particularly handy for multiple states of the same page that share base information.

### CSS
CSS is compiled via Gulp from SCSS files in the `src/scss/` folder to the `www/css` folder. This project utilizes the [BEM Methodology](https://en.bem.info/methodology/key-concepts/) and the [DoCSSa folder structure](http://mlarcher.github.io/docssa/#fileStructure).

```
\_src
    \scss
        \__config
            \_...
        \_base
            \_...
        \_components
            \_...
        \_specifics
            \_...
        common.scss
```

All common components and styles that are not page specific should be bundled into the `common.min.css` file. Page specific styles should be bundled separately so they can be included on an "as needed" basis.

### JS
Javascript files can be found in the `src/js` folder. Each JS file in this root folder will be bundled separately, much like the CSS. Sub-folders should contain all the components and features necessary to import into each of the main bundle files.

```
\_src
    \_js
        \_common.js
        \_components
            \_...
        \_features
            \_...
        \util
            \_...
```

This project utilizes newer [ES6 syntax](http://es6-features.org/) and leverages imports and exports that are normally only available through node and the server side. The Gulp build task uses `browserfy` and `babel` to compile the JS into bundles that can be properly used by browsers, while still allowing developers to leverage the newer style code.

### Images
All images should be put into the `src/images` folder so the Gulp task can minify them before moving them into the distribution folder.

### Statics
All static files such as fonts, demos, TOC, etc should be included in the `src/statics` folder. The contents of this folder get copied directly into the distribution (www) folder.
