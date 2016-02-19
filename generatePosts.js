import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import nameMap from './nameMap'


let basePath = './src'
let deletedPath = './unauthorized'
let targetPath = './source/_posts'
let imgMap = {
  "shanks": "shanksyang.jpg",
  "小锅": "buginux.jpg",
  "lfb_CD": "lfb-CD.jpg",
  "mmoaay": "mmoaay.jpg",
  "Yake": "wangyake.jpg",
  "小铁匠Linus": "xiaotiejiang.jpg",
  "SergioChan": "SergioChan.jpg",
  "天才175": "175.jpg",
  "靛青K": "DianQK.jpg",
  "CMB": "CMB.jpg",
  "saitjr": "http://www.brighttj.com",
  "Prayer": "Prayer.jpg"
}

function* entries(obj) {
   for (let key of Object.keys(obj)) {
     yield [key, obj[key]]
   }
}

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)))
}

// copy unauthorized files from ./unauthorized
let deletedInfo = new Promise(function (resolve, reject) {
  fs.readdir(deletedPath, (err, files) => {
    if (err) reject(err)
    resolve(files.filter(file => !(file.indexOf(".") === 0)))
  })
})
.then(files => Promise.all(
  files.map(
    file => new Promise((resolve, reject) =>
      fs.readFile(path.join(deletedPath, file), function (err, content) {
        if (err) reject(err)
        content = content.toString()
        resolve({
          fileName: file,
          content: content
        })
      })
    )
  )
))
.then(finalContents => finalContents.map(finalContent => {
  new Promise((resolve, reject) => {
    let fullPath = path.join(targetPath, finalContent.fileName)
    console.log(fullPath)
    fs.writeFile(fullPath, finalContent.content, {flag: 'w'}, (err) => {
      if (err) throw err
      resolve()
    })
  })
}))
.catch(err => console.log(err))

// get origin file content and generate posts
let originInfo = new Promise(function (resolve, reject) {
  fs.readdir(basePath, (err, files) => {
    if (err) reject(err)
    resolve(files.filter(file => !(file.indexOf(".") === 0)))
  })
})
.then(files => Promise.all(
  files.map(
    file => new Promise((resolve, reject) =>
      fs.readFile(path.join(basePath, file), function (err, content) {
        if (err) reject(err)
        content = content.toString()
        resolve({
          fileName: file,
          content: content
        })
      })
    )
  )
))
.then(fileInfos => fileInfos.map(fileInfo => {
  function publishNow() {
      let reg = new RegExp('发布时间=(.*)')
      if (fileInfo.content.match(reg)) {
        result = result.replace(reg, "")
        let publishDate = new Date(fileInfo.content.match(reg)[1].trim())
        publishDate = new Date(publishDate.getUTCFullYear(), publishDate.getUTCMonth(), publishDate.getUTCDate(),  publishDate.getUTCHours(), publishDate.getUTCMinutes(), publishDate.getUTCSeconds())
        let now = new Date()
        if (publishDate > now) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
  }
  let result = fileInfo.content
  if (!publishNow()) {
    return undefined
  }
  let regs = {
    originUrl: '原文链接=(.*)',
    author: '作者=(.*)',
    originDate: '原文日期=(.*)',
    translators: '译者=(.*)',
    auditors: '校对=(.*)',
    finalmans: '定稿=(.*)',
  }
  let info = {}
  for (let [key, value] of entries(regs)) {
    let reg = new RegExp(value)
    console.log(fileInfo.fileName, reg)
    info[key] = fileInfo.content.match(reg)[1].trim()
    result = result.replace(reg, "")
  }

  let fixer = {
    title: 'title:(.*)',
    date: 'date:(.*)',
    tags: 'tags:(.*)',
    categories: 'categories:(.*)',
    permalink: 'permalink:(.*)',
    keywords: 'keywords:(.*)',
    custom_title: 'custom_title:(.*)',
    description: 'description:(.*)',
  }

  let breakPoint = result.indexOf('---') + 3
  var configContent = result.substring(0, breakPoint)
  let postContent = result.substring(breakPoint)

  for (let [key, value] of entries(fixer)) {
    let reg = new RegExp(value)
    let temp = configContent.match(reg)
    if (!temp) continue
    var temp2 = temp[1].trim()
    temp2 = key + ': ' + temp2
    configContent = configContent.replace(reg, temp2)
  }

  result = configContent + postContent

  let infoStr = `
> 作者：${info.author}，[原文链接](${info.originUrl})，原文日期：${info.originDate}
> 译者：${info.translators.split(",").map(name => `[${name}](${nameMap[name]})`).join("，")}；校对：${info.auditors.split(",").map(name => `[${name}](${nameMap[name]})`).join("，")}；定稿：${info.finalmans.split(",").map(name => `[${name}](${nameMap[name]})`).join("，")}
  `
  result = result.splice(result.indexOf("---") + 3, 0, infoStr)
  // result += info.translators.split(",").map(name => `\n<center>![给译者打赏](/img/QRCode/${imgMap[name]})</center>`).join("\n")
  result += "\n> 本文由 SwiftGG 翻译组翻译，已经获得作者翻译授权，最新文章请访问 [http://swift.gg](http://swift.gg)。"
  return {
    fileName: fileInfo.fileName,
    content: result
  }
}).filter(a => a)
)
.then(finalContents => finalContents.map(finalContent => {
  new Promise((resolve, reject) => {
    let fullPath = path.join(targetPath, finalContent.fileName)
    console.log(fullPath)
    fs.writeFile(fullPath, finalContent.content, {flag: 'w'}, (err) => {
      if (err) throw err
      resolve()
    })
  })
}))
.catch(err => console.log(err))
