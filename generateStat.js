import fs from 'fs'
import path from 'path'


let basePath = './source/_posts'
let pageHeader = `
# SwiftGG团队贡献榜

本页面会记录团队内所有成员的贡献，方便大家进行查看。你的努力，全世界都看得到:]。

# 翻译统计

| 译者 | 字数 |
| :------------: | :------------: |
`
let targetFile = './source/stat/index.md'


new Promise(function (resolve, reject) {
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
    translator: content.match(/> 译者：\[(.*?)\]\((.*?)\)/)[1]
  })
))
.then(contentArr => contentArr.reduce(
  (contentMap, item) => 
    contentMap.has(item.translator) ? 
      contentMap.set(item.translator, contentMap.get(item.translator) + item.words) : 
      contentMap.set(item.translator, item.words),
  new Map()
))
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1] - a[1]))
.then(contentArr => contentArr.map(
  contentItem => `| ${contentItem[0]} | ${contentItem[1]} |`
))
.then(mdPartials => pageHeader + mdPartials.join("\n"))
.then(md => new Promise((resolve, reject) =>
  fs.writeFile(targetFile, md, (err) => {
    if (err) reject(err)
    resolve()
  })
))
.catch(err => console.log(err))