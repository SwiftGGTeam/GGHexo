import fs from 'fs'
import path from 'path'


let basePath = './src'
let pageHeader = `
# SwiftGG团队贡献榜

本页面会记录团队内所有成员的贡献，方便大家进行查看。

你的付出，全世界都看得到:]。
`
let wordHeader = `
# 翻译字数统计

| 译者 | 字数 |
| :------------: | :------------: |
`
let articleHeader = `
# 翻译篇数统计

| 译者 | 篇数 |
| :------------: | :------------: |
`
let auditHeader = `
# 校对篇数统计

| 校对者 | 篇数 |
| :------------: | :------------: |
`
let finalHeader = `
# 定稿篇数统计

| 定稿者 | 篇数 |
| :------------: | :------------: |
`
let targetFile = './source/stat/index.md'

function* entries(obj) {
   for (let key of Object.keys(obj)) {
     yield [key, obj[key]];
   }
}

let originInfo = new Promise(function (resolve, reject) {
  fs.readdir(basePath, (err, files) => {
    if (err) throw err
    resolve(files.filter(file => !(file.indexOf(".") === 0)))
  })
})
.then(files => Promise.all(
  files.map(
    file => new Promise((resolve, reject) =>
      fs.readFile(path.join(basePath, file), function (err, content) {
        if (err) throw err
        resolve(content.toString())
      })
    )
  )
))
// .then(contents => contents.map(
//   content => {
//     console.log(content)
//     return {
//     words: content.substr(content.indexOf("---") + 3).replace(/\s+/g, "").length,
//     translator: content.match(/> 译者：(\[.*?\]\(.*?\))/)[1],
//     auditor: content.match(/> 校对：(\[.*?\]\(.*?\))/)[1],
//     finalMan: content.match(/> 定稿：(\[.*?\]\(.*?\))/)[1],
//   }
//   }
// ))
.then(contents => contents.map(content => {
  let regs = {
    translators: '译者=(.*)',
    auditors: '校对=(.*)',
    finalmans: '定稿=(.*)'
  }
  let info = {}
  for (let [key, value] of entries(regs)) {
    let reg = new RegExp(value)
    info[key] = content.match(reg)[1].trim()
  }
  return {
    words: content.substr(content.indexOf("---") + 3).replace(/\s+/g, "").length,
    translators: info.translators.split(","),
    auditors: info.auditors.split(","),
    finalMans: info.finalmans.split(","),
  }
}))


let finalStat = originInfo
.then(contentArr => contentArr.reduce(
  (contentMap, item) => 
  {
    for (let finalMan of item.finalMans) {
      contentMap.has(finalMan) ? 
      contentMap.set(finalMan, contentMap.get(finalMan) + 1) : 
      contentMap.set(finalMan, 1)
    }
    return contentMap
  },
  new Map()
))
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1] - a[1]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1]} |`
))
.then(mdPartials => finalHeader + mdPartials.join("\n"))


let auditStat = originInfo
.then(contentArr => contentArr.reduce(
  (contentMap, item) => 
  {
    for (let auditor of item.auditors) {
      contentMap.has(auditor) ? 
      contentMap.set(auditor, contentMap.get(auditor) + 1) : 
      contentMap.set(auditor, 1)
    }
    return contentMap
  },
  new Map()
))
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1] - a[1]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1]} |`
))
.then(mdPartials => auditHeader + mdPartials.join("\n"))


let translationInfo = originInfo
.then(contentArr => contentArr.reduce(
  (contentMap, item) => {
    for (let translator of item.translators) {
      contentMap.has(translator) ? 
      contentMap.set(translator, [contentMap.get(translator)[0] + item.words, contentMap.get(translator)[1] + 1]) : 
      contentMap.set(translator, [item.words, 1])
    }
    return contentMap
  },
  new Map()
))


let wordsStat = translationInfo
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][0] - a[1][0]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1][0]} |`
))
.then(mdPartials => wordHeader + mdPartials.join("\n"))


let articlesStat = translationInfo
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][1] - a[1][1]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1][1]} |`
))
.then(mdPartials => articleHeader + mdPartials.join("\n"))


let writeBack = Promise.all([wordsStat, articlesStat, auditStat, finalStat])
.then(statPartials => new Promise((resolve, reject) =>
  fs.writeFile(targetFile, pageHeader + statPartials.join("\n\n"), (err) => {
    if (err) throw err
    resolve()
  })
))
.catch(err => console.log(err))
