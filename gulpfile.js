const fs = require('fs')

const gulp = require('gulp')
const csso = require('gulp-csso')
const uglify = require('gulp-uglify')
const htmlmin = require('gulp-htmlmin')
const htmlclean = require('gulp-htmlclean')
const prettyData = require('gulp-pretty-data')
const dom = require('gulp-dom')
const concat = require('gulp-concat')
const insert = require('gulp-insert')

gulp.task('css', function css() {
    return gulp
        .src('./public/**/*.css')
        .pipe(csso())
        .pipe(gulp.dest('./public'))
})
gulp.task('html', function html() {
    return gulp
        .src(['./public/**/*.html'])
        .pipe(
            dom(function () {
                const $ = s => this.querySelector(s)
                const $$ = s => [...this.querySelectorAll(s)]

                const rsslink = $('a[href="/atom.xml"]')
                if (rsslink) {
                    rsslink.target = '_blank'
                }

                /*eslint-disable*/
                let loadCSScode = `function loadCSS(l){var a=document.createElement("link");a.rel="stylesheet";a.href=l;document.head.appendChild(a)}`
                /*eslint-enable*/

                const vrgx = /\?v=[\d\.]*/
                const scripts = $$('script')
                scripts
                    .filter(el => vrgx.test(el.src)) //remove ?v=a.b.c
                    .forEach(el => (el.src = el.src.replace(vrgx, '')))
                scripts
                    .filter(el => el.src && !el.src.includes('cdn.jsdelivr.net/npm/'))
                    .forEach(el => el.remove())

                const links = $$('link')
                links
                    .filter(el => vrgx.test(el.href)) //remove ?v=a.b.c
                    .forEach(el => (el.href = el.href.replace(vrgx, '')))

                links
                    .filter(el => el.rel === 'stylesheet')
                    .filter(el => !el.href.includes('main.css'))
                    .forEach(el => {
                        loadCSScode += `loadCSS("${el.href}");`
                        el.remove()
                    })
                const lc = this.createElement('script')
                lc.textContent = loadCSScode
                this.head.appendChild(lc)

                //append bundle.js
                const bundle = this.createElement('script')
                bundle.type = 'text/javascript'
                bundle.src = '/bundle.js'
                this.body.appendChild(bundle)

                // h1->h2,h2->h3,... for proper seo
                for (let i = 5; i >= 1; i--) {
                    const h = 'h' + i
                    const hn = 'h' + (i + 1)
                    $$(`.post-body ${h}`).forEach(x => (x.outerHTML = x.outerHTML.replace(h, hn)))
                }

                return this
            })
        )
        .pipe(htmlclean())
        .pipe(
            htmlmin({
                minifyJS: true,
                minifyCSS: true,
                removeComments: true,
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true
            })
        )
        .pipe(gulp.dest('./public'))
})
gulp.task('js', function js() {
    return gulp
        .src([
            './public/js/src/scrollspy.js',
            './public/js/src/utils.js',
            './public/js/src/post-details.js',
            './public/js/src/motion.js',
            './public/js/src/bootstrap.js',
            './source/_data/medium-zoom.js'
        ])
        .pipe(concat('bundle.js'))
        .pipe(
            insert.wrap(
                'window.onload=function(){',
                `
                    mediumZoom('#posts img')
                }
            `
            )
        )
        .pipe(uglify())
        .pipe(gulp.dest('./public'))
})
gulp.task('xmlJson', function xmlJson() {
    return gulp
        .src('./public/**.{xml,xsl,json,xlf,svg}')
        .pipe(
            prettyData({
                type: 'minify',
                preserveComments: true,
                extensions: {
                    xlf: 'xml',
                    svg: 'xml'
                }
            })
        )
        .pipe(gulp.dest('public'))
})
gulp.task('default', gulp.parallel(gulp.series('css', 'html'), 'xmlJson', 'js'))
