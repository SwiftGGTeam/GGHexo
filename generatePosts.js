import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'


let basePath = './src'
let deletedPath = './unauthorized'
let targetPath = './source/_posts'
let nameMap = {
  "shanks": "http://codebuild.me/",
  "小锅": "http://www.swiftyper.com/",
  "lfb_CD": "http://weibo.com/lfbWb",
  "mmoaay": "http://blog.csdn.net/mmoaay",
  "Yake": "http://blog.csdn.net/yake_099",
  "小铁匠Linus": "http://weibo.com/linusling",
  "SergioChan": "https://github.com/SergioChan",
  "天才175": "http://weibo.com/u/2916092907",
  "靛青K": "http://www.dianqk.org/",
  "numbbbbb": "https://github.com/numbbbbb",
  "千叶知风": "http://weibo.com/xiaoxxiao",
  "CMB": "https://github.com/chenmingbiao",
  "saitjr": "http://www.brighttj.com",
  "Prayer": "http://www.futantan.com",
  "pmst": "http://blog.csdn.net/colouful987",
  "ray16897188": "http://swift.gg"
}
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
  let result = fileInfo.content
  for (let [key, value] of entries(regs)) {
    let reg = new RegExp(value)
    console.log(fileInfo.fileName, reg)
    info[key] = fileInfo.content.match(reg)[1].trim()
    result = result.replace(reg, "")
  }

  let infoStr = `
> 作者：${info.author}，[原文链接](${info.originUrl})，原文日期：${info.originDate}
> 译者：${info.translators.split(",").map(name => `[${name}](${nameMap[name]})`).join("，")}；校对：${info.auditors.split(",").map(name => `[${name}](${nameMap[name]})`).join("，")}；定稿：${info.finalmans.split(",").map(name => `[${name}](${nameMap[name]})`).join("，")}
  `
  result = result.splice(result.indexOf("---") + 3, 0, infoStr)
  // result += info.translators.split(",").map(name => `\n<center>![给译者打赏](/img/QRCode/${imgMap[name]})</center>`).join("\n")
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
