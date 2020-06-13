// 实现这个项目的构建任务
const grunt = require('grunt')
const loadGruntTasks = require('load-grunt-tasks')

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

module.exports = grunt=>{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean:['dist','.temp'],
        copy: {
            main: {
              files: [
                // includes files within path
                {expand: true, src: ['public/**'], dest: 'dist/'},
                // {expand: true, src: ['src/assets/images/**'], dest: 'dist/assets/images/', filter: 'isFile'},
                // {expand: true, src: ['src/assets/fonts/**'], dest: 'dist/assets/fonts/', filter: 'isFile'},
              ],
            }
          },
        sass:{
            main: {
                files: {
                    'dist/assets/styles/main.css' : 'src/assets/styles/main.scss',
                    '.temp/main.css' : 'src/assets/styles/main.scss',
                  }
            }
        },
        babel: {
            options: {
              sourceMap: true,
              presets: ['@babel/preset-env']
            },
            main: {
              files: {
                'dist/assets/scripts/main.js' : 'src/assets/scripts/main.js',
                '.temp/main.js' : 'src/assets/scripts/main.js',
              }
            }
          },
          watch: {
            js: {
              files: ['src/assets/scripts/*.js'],
              tasks: ['babel']
            },
            css: {
              files: ['src/assets/styles/*.scss'],
              tasks: ['sass']
            },
            html:{
              files: ['src/*.html'],
              tasks: ['swigtemplates','copy:swig']
            }
          },
        uglify:{
            dist:{
                src:'.temp/main.js',
                dest:'dist/assets/scripts/main.js'
            }
        },
        cssmin: {
            dist: {
              files: {
                'dist/assets/styles/main.css': '.temp/main.css'
              }
            }
          },
          swigtemplates: {
            temp: {
              context: data,
              dest: '.temp',
              src: 'src/*.html'
            }
          },
          browserSync: {
            dev: {
                bsFiles: {
                    src : [
                        'dist/assets/styles/*.css',
                        'dist/assets/scripts/*.js',
                        'dist/*.html',
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: ['dist', 'src', 'public'],
                        routes: {
                          '/node_modules': 'node_modules'
                        }
                      }
                }
            }
        },
        htmlmin: {
            options: {
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true
            },
            dist: {
                expand: true,
                cwd: '.temp/src',
                src: '*.html',
                dest: 'dist'
            }
        },
        move: {
            index: {
              src: '.temp/src/index.html',
              dest: 'dist/index.html'
            },
            about: {
              src: '.temp/src/about.html',
              dest: 'dist/about.html'
            }
          },
          imagemin: {
            imagesandfonts: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['assets/images/*..{jpg,jpeg,gif,png,svg}','assets/fonts/*.{svg,eot,ttf,woff}'],
                    dest: 'dist/'
                }]
            }
        }
    })

    loadGruntTasks(grunt)

    grunt.registerTask('clear',['clean'])
    grunt.registerTask('start',['clean','sass','babel','swigtemplates','move','browserSync','watch'])
    grunt.registerTask('build',['clean','sass','babel','copy','swigtemplates','cssmin','uglify','htmlmin','imagemin'])
}