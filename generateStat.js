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
let targetFile = './source/stat/index.md'


let contentMap = new Promise(function (resolve, reject) {
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
.then(contents => contents.map(
  content => ({
    words: content.substr(content.indexOf("---") + 3).replace(/\s+/g, "").length,
    translator: content.match(/> 译者：(\[.*?\]\(.*?\))/)[1]
  })
))
.then(contentArr => contentArr.reduce(
  (contentMap, item) => 
    contentMap.has(item.translator) ? 
      contentMap.set(item.translator, [contentMap.get(item.translator)[0] + item.words, contentMap.get(item.translator)[1] + 1]) : 
      contentMap.set(item.translator, [item.words, 1]),
  new Map()
))


let wordsStat = contentMap
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][0] - a[1][0]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1][0]} |`
))
.then(mdPartials => wordHeader + mdPartials.join("\n"))


let articlesStat = contentMap
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][1] - a[1][1]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1][1]} |`
))
.then(mdPartials => articleHeader + mdPartials.join("\n"))


let writeBack = Promise.all([wordsStat, articlesStat])
.then(statPartials => new Promise((resolve, reject) =>
  fs.writeFile(targetFile, pageHeader + statPartials.join("\n\n"), (err) => {
    if (err) reject(err)
    resolve()
  })
))
.catch(err => console.log(err))
