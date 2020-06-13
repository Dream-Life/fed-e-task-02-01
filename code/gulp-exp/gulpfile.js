// 实现这个项目的构建任务
const {src, dest, parallel, series, watch} = require('gulp')
const loadPlugin = require('gulp-load-plugins')
const del = require('del')
const browserSync =require('browser-sync')

const plugin = loadPlugin()
const bs = browserSync.create()

const data = {
    menus: [
      {
        name: 'Home',
        icon: 'aperture',
        link: 'index.html'
      },
      {
        name: 'Features',
        link: 'features.html'
      },
      {
        name: 'About',
        link: 'about.html'
      },
      {
        name: 'Contact',
        link: '#',
        children: [
          {
            name: 'Twitter',
            link: 'https://twitter.com/w_zce'
          },
          {
            name: 'About',
            link: 'https://weibo.com/zceme'
          },
          {
            name: 'divider'
          },
          {
            name: 'About',
            link: 'https://github.com/zce'
          }
        ]
      }
    ],
    pkg: require('./package.json'),
    date: new Date()
  }

const paths = {
    styles: 'src/assets/styles/*.scss',
    script: 'src/assets/scripts/*.js',
    html: 'src/*.html',
    image:'src/assets/images/**',
    font: 'src/assets/fonts/**',
    extra:'public/**'
}

const distPath = 'dist'
const tempPath = '.temp'

// 清除dist目录
const clean = ()=>{
    return del([distPath])
}

// css文件处理
const styles = ()=>{
    return src(paths.styles,{base: 'src'})
            .pipe(plugin.sass())
            .pipe(dest(distPath))
            .pipe(bs.reload({ stream: true }))
}

// js文件处理
const script = ()=>{
    return  src(paths.script,{base: 'src'})
            .pipe(plugin.babel({presets: ["@babel/preset-env"]}))
            .pipe(dest(distPath))
            .pipe(bs.reload({ stream: true }))

}

// html处理
const html = ()=>{
    return src(paths.html,{base: 'src'})
            .pipe(plugin.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
            .pipe(dest(tempPath))
            .pipe(dest(distPath))
            .pipe(bs.reload({ stream: true }))
}

// 图片和字体文件处理
const image = ()=>{
    return src(paths.image,{base:'src'})
            .pipe(plugin.imagemin())
            .pipe(dest(distPath))
}

const font = ()=>{
    return src(paths.font,{base:'src'})
            .pipe(plugin.imagemin())
            .pipe(dest(distPath))
}

// public文件copy
const extra = () => {
    return src(paths.extra, { base: 'public' })
      .pipe(dest('dist'))
}

// serve
const serve = ()=>{
    watch(paths.styles,styles)
    watch(paths.script,script)
    watch(paths.html,html)
    watch([
        paths.extra,
        paths.image,
        paths.font
    ],bs.reload)

    bs.init({
        notify:false,
        port:8080,
        server: {
            baseDir: [distPath, 'src', 'public'],
            routes: {
              '/node_modules': 'node_modules'
            }
          }
    })
}

// useref
const useref = ()=>{
    return src(`${tempPath}/*.html`,{base: tempPath})
            .pipe(plugin.useref({ searchPath: [tempPath,'.']}))
            .pipe(plugin.if(/\.js$/, plugin.uglify()))
            .pipe(plugin.if(/\.css$/, plugin.cleanCss()))
            .pipe(plugin.if(/\.html$/, plugin.htmlmin({
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true
              })))
            .pipe(dest(distPath))
}

const compile = parallel(styles,script,html)

const start = series(clean,compile,serve)
const build = series(clean,parallel(series(compile, useref),font,extra,image))

module.exports = {
    clean,
    start,
    build
}