#!/usr/bin/env node

const inquirer = require("inquirer")
const program = require('commander')
const path =require('path')
const fs = require('fs')
const _ = require('lodash')
const ejs = require('ejs')
const chalk = require('chalk')

const {log} = console

// 路径声明
function pathChange(root,file){
  return path.resolve(root,file)
}
const  pathLink= _.curry(pathChange)
const tmpPathLink = pathLink(path.resolve(__dirname,'../templates'))

const destDir = process.cwd()
const commonPathLink = pathLink(tmpPathLink('common'))
const vuePathLink = pathLink(tmpPathLink('vue'))
const reactPathLink = pathLink(tmpPathLink('react'))

const commonFiles = [
  'package.json',
  '.gitignore',
  'index.html'
]

const vueFiles = [
  'vue.vue'
]
const reactFiles = [
  'react.jsx'
]

// copy tempaltes
function copyTemp(answers,readFile,writeFile){
  // log(readFile)
  // log(writeFile)
  ejs.renderFile(readFile,answers,(err,res)=>{
     if (err) throw err
      fs.writeFileSync(writeFile,res)
  })
}
const copy= _.curry(copyTemp)

function delDir(path){
  let files = [];
  if(fs.existsSync(path)){
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
          let curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()){
              delDir(curPath); //递归删除文件夹
          } else {
              fs.unlinkSync(curPath); //删除文件
          }
      });
      fs.rmdirSync(path);
  }
}

program
  .version(`vr-cli ${require('../package').version}`)
  // .option('-h, --help', 'Command info~')
  .usage('<command> [options]')

program
.command('create <app-name>')
.description('create a new Vue or React project')
  .option('-v, --vue', 'Vue Project init')
  .option('-r, --react', 'React project init')
  .action((source, destination) => {
    if( destination.vue && destination.react){
      log(chalk.red("Error: -v can't coexist with -r"))
      process.exit(1)
    }

    inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        description: 'Your Project\'s name?',
        default: source 
      // },
      // {
      //   type:'checkbox',
      //   name: 'checked',
      //   choices: ['axios', '@babel/core'],
      //   message: 'Select Your modules',
      //   default: ['axios']
      }
    ]).then(answers=>{
      const dist = path.resolve(destDir,answers.name)
      if(fs.existsSync(dist)){delDir(dist)}
      fs.mkdirSync(dist)

      const copyTemplate = copy(answers)
      commonFiles.forEach(file=>{
        copyTemplate(commonPathLink(file),path.resolve(dist,file))
      })

      if(destination.vue){
        answers.modVer = "^2.5.2"
        answers.mod = 'vue'

        const vueDir = path.resolve(dist,'vue')
        const vuePath = pathLink(vueDir)
        fs.mkdirSync(vueDir)
        vueFiles.forEach(file=>{
          copyTemplate(vuePathLink(file),vuePath(file))
        })
      }
      if(destination.react){
        answers.mod = 'react'
        answers.modVer = "^16.13.1"

        const reactDir = path.resolve(dist,'react')
        const reactPath = pathLink(reactDir)
        fs.mkdirSync(reactDir)
        reactFiles.forEach(file=>{
          copyTemplate(reactPathLink(file),reactPath(file))
        })
      }
      
    })
  })
program.parse(process.argv)