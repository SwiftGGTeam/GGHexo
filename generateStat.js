import fs from 'fs'
import path from 'path'


let basePath = './source/_posts'
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
.then(contents => contents.map(
  content => ({
    words: content.substr(content.indexOf("---") + 3).replace(/\s+/g, "").length,
    translator: content.match(/> 译者：(\[.*?\]\(.*?)[\/]?\)/)[1] + ")",
    auditor: content.match(/> 校对：(\[.*?\]\(.*?)[\/]?\)/)[1] + ")",
    finalMan: content.match(/> 定稿：(\[.*?\]\(.*?)[\/]?\)/)[1] + ")",
  })
))

let finalStat = originInfo
.then(contentArr => contentArr.reduce(
  (contentMap, item) => 
    contentMap.has(item.finalMan) ? 
      contentMap.set(item.finalMan, contentMap.get(item.finalMan) + 1) : 
      contentMap.set(item.finalMan, 1),
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
    contentMap.has(item.auditor) ? 
      contentMap.set(item.auditor, contentMap.get(item.auditor) + 1) : 
      contentMap.set(item.auditor, 1),
  new Map()
))
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1] - a[1]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1]} |`
))
.then(mdPartials => auditHeader + mdPartials.join("\n"))


let translationInfo = originInfo
.then(contentArr => contentArr.reduce(
  (contentMap, item) => 
    contentMap.has(item.translator) ? 
      contentMap.set(item.translator, [contentMap.get(item.translator)[0] + item.words, contentMap.get(item.translator)[1] + 1]) : 
      contentMap.set(item.translator, [item.words, 1]),
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
    if (err) reject(err)
    resolve()
  })
))
.catch(err => console.log(err))
