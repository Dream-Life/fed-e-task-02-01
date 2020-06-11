#!/usr/bin/env node

const inquirer = require("inquirer")
const program = require('commander')
const path =require('path')
const fs = require('fs')
const _ = require('lodash')
const ejs = require('ejs')
const chalk = require('chalk')

const {log} = console

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
  commonPathLink('package.json'),
  commonPathLink('.gitignore')
]

const vueFiles = [
  vuePathLink('vue.vue')
]
const reactFiles = [
  reactPathLink('react.jsx')
]

function copyTemp(answers,readFile,writeFile){
  log(readFile)
  log(writeFile)
  ejs.renderFile(readFile,answers,(err,res)=>{
     if (err) throw err
      fs.writeFileSync(writeFile,res)
  })
}
const copy= _.curry(copyTemp)

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
      },
      {
        type:'checkbox',
        name: 'checked',
        choices: ['axios', '@babel/core'],
        message: 'Select Your modules',
        default: ['axios']
      }
    ]).then(answers=>{
      const dist = path.resolve(destDir,answers.name)
      if(fs.existsSync(dist)){fs.rmdirSync(dist)}
      fs.mkdirSync(dist)

      const copyTemplate = copy(answers)
      commonFiles.forEach(file=>{
        copyTemplate(file,path.resolve(dist,file))
      })

      if(destination.vue){
        const vuePath = pathLink(path.resolve(dist,'vue'))
        fs.mkdirSync(vuePath)
        vueFiles.forEach(file=>{
          copyTemplate(file,vuePath(file))
        })
      }
      if(destination.react){
        const reactPath = pathLink(path.resolve(dist,'react'))
        fs.mkdirSync(reactPath)
        reactFiles.forEach(file=>{
          copyTemplate(file,reactPath(file))
        })
      }
      
    })
  })
program.parse(process.argv)