import fs from 'fs'
import path from 'path'
import nameMap from './nameMap'


let basePath = './src'
let pageHeader = `
# SwiftGG 团队贡献榜

本页面会记录团队内所有成员的贡献，方便大家进行查看。

你的付出，全世界都看得到 :]。
`
let nowMonth = (new Date()).getMonth() + 1
let nowYear = (new Date()).getFullYear()
let monthlyWordHeader = `
# ${nowYear} 年 ${nowMonth} 月字数排行

| 译者 | 字数 |
| :------------: | :------------: |
`
let monthlyArticleHeader = `
# ${nowYear} 年 ${nowMonth} 月篇数排行

| 译者 | 篇数 |
| :------------: | :------------: |
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
let deleted = {
  file: [
    "A practical introduction to functional programming.md",
    "A Trie in Swift.md",
    "Checking API Availability With Swift.md",
    "Cryptography in Swift with CommonCrypto.md",
    "ibeacons_ios和swift教程.md",
    "raywenderlich.com官方Swift风格指南.md",
    "Swift 2_面向协议编程.md",
    "Swift面试题及答案.md",
    "Swift中的集合类数据结构.md",
    "UIGestureRecognizer教程：创建自定义手势识别器.md",
    "What's_New_in_Swift_2.md",
    "如何正确使用协议.md",
    "使用泛型与函数式思想高效解析JSON.md",
    "改用swift来思考.md",
    "数组、链表及其性能.md",
    "如何创建一个 iOS 书本打开的动画（第一部分）.md"
  ],
  translatorWord: {
    "shanks": 33883,  
    "mmoaay": 31442,
    "lfb_CD": 17317,
    "靛青K": 41313,
    "Yake": 15217,
    "SergioChan": 14439,
    "小锅": 38411,
    "小铁匠Linus": 10493,
    "ray16897188": 4769,
    "CMB": 43209,
    "天才175": 2642,
    "星夜暮晨": 13486,
    "Cee": 19531,
    "saitjr": 18622,
    "Prayer": 28695,
  },
  translatorArticle: {
    "shanks": 3,  
    "mmoaay": 2,
    "lfb_CD": 2,
    "靛青K": 2,
    "Yake": 1,
    "SergioChan": 1,
    "小锅": 1,
    "小铁匠Linus": 1,
    "ray16897188": 1,
    "CMB": 1,
    "天才175": 1,
    "pmst": 1
  },
  auditor: {
    "numbbbbb": 8,
    "shanks": 4,
    "千叶知风": 2,
    "小锅": 1,
    "lfb_CD": 1
  },
  finalMan: {
    "numbbbbb": 8,
    "小锅": 3,
    "shanks": 3,
    "mmoaay": 1,
    "lfb_CD": 1,
  }
}

function* entries(obj) {
   for (let key of Object.keys(obj)) {
     yield [key, obj[key]];
   }
}

// get origin file content, prepare to generate stat
let originInfo = new Promise(function (resolve, reject) {
  fs.readdir(basePath, (err, files) => {
    if (err) throw err
    resolve(files.filter(file => !((file.indexOf(".") === 0) || (file in deleted.file))))
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
.then(contents => contents.map(content => {
  let regs = {
    translators: '译者=(.*)',
    auditors: '校对=(.*)',
    finalmans: '定稿=(.*)',
    date: 'date: (\\d{4}-\\d{1,2}-\\d{1,2})'
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
    date: info.date,
  }
}))

let monthlyStat = originInfo
.then(contentArr => contentArr.reduce(
  (contentMap, item) => 
  {
    for (let translator of item.translators) {
      if ((new Date(Date.parse(item.date))).getMonth() == nowMonth - 1 && (new Date(Date.parse(item.date))).getFullYear() == nowYear) {
        contentMap.has(translator) ? 
        contentMap.set(translator, [contentMap.get(translator)[0] + item.words, contentMap.get(translator)[1] + 1]) : 
        contentMap.set(translator, [item.words, 1])
      }
    }
    return contentMap
  },
  new Map()
))

let monthlyWordStat = monthlyStat
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][0] - a[1][0]))
.then(contentArr => contentArr.map(
  contentItem => contentItem[0] && `| [${contentItem[0]}](${nameMap[contentItem[0]]}) | ${contentItem[1][0]} |`
))
.then(mdPartials => monthlyWordHeader + mdPartials.filter(part => part.trim()).join("\n"))

let monthlyArticleStat = monthlyStat
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][1] - a[1][1]))
.then(contentArr => contentArr.map(
  contentItem => contentItem[0] && `| [${contentItem[0]}](${nameMap[contentItem[0]]}) | ${contentItem[1][1]} |`
))
.then(mdPartials => monthlyArticleHeader + mdPartials.filter(part => part.trim()).join("\n"))

// generate finalMan stat, return markdown table partial, contain final man name and article count
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
.then(contentMap => {
  for (let [key, value] of entries(deleted.finalMan)) {
    contentMap.has(key) ? 
    contentMap.set(key, contentMap.get(key) + value) : 
    contentMap.set(key, value)
  }
  return contentMap
})
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1] - a[1]))
.then(contentArr => contentArr.map(
  contentItem => contentItem[0] && `| [${contentItem[0]}](${nameMap[contentItem[0]]}) | ${contentItem[1]} |`
))
.then(mdPartials => finalHeader + mdPartials.filter(part => part.trim()).join("\n"))

// generate audit stat, return markdown table partial, contain auditor name and article count
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
.then(contentMap => {
  for (let [key, value] of entries(deleted.auditor)) {
    contentMap.has(key) ? 
    contentMap.set(key, contentMap.get(key) + value) : 
    contentMap.set(key, value)
  }
  return contentMap
})
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1] - a[1]))
.then(contentArr => contentArr.map(
  contentItem => contentItem[0] && `| [${contentItem[0]}](${nameMap[contentItem[0]]}) | ${contentItem[1]} |`
))
.then(mdPartials => auditHeader + mdPartials.filter(part => part.trim()).join("\n"))

// deal with file content, prepare for word count and translation stat
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
.then(contentMap => {
  for (let [key, value] of entries(deleted.translatorWord)) {
    contentMap.has(key) ? 
    contentMap.set(key, [contentMap.get(key)[0] + value, contentMap.get(key)[1]]) : 
    contentMap.set(key, [value, 0])
  }
  for (let [key, value] of entries(deleted.translatorArticle)) {
    contentMap.set(key, [contentMap.get(key)[0], contentMap.get(key)[1] + value])
  }
  return contentMap
})

// generate word count stat, return markdown table partial, contain word count and translator name
let wordsStat = translationInfo
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][0] - a[1][0]))
.then(contentArr => contentArr.map(
  contentItem => contentItem[0] && `| [${contentItem[0]}](${nameMap[contentItem[0]]}) | ${contentItem[1][0]} |`
))
.then(mdPartials => wordHeader + mdPartials.filter(part => part.trim()).join("\n"))

// generate translation stat, return markdown table partial, contain translator name and article count
let articlesStat = translationInfo
.then(contentMap => Array.from(contentMap).sort((a, b) => b[1][1] - a[1][1]))
.then(contentArr => contentArr.map(
  contentItem => contentItem[0] && `| [${contentItem[0]}](${nameMap[contentItem[0]]}) | ${contentItem[1][1]} |`
))
.then(mdPartials => articleHeader + mdPartials.filter(part => part.trim()).join("\n"))

// combine all markdown partials and write to file
let writeBack = Promise.all([monthlyWordStat, monthlyArticleStat, wordsStat, articlesStat, auditStat, finalStat])
.then(statPartials => new Promise((resolve, reject) =>
  fs.writeFile(targetFile, pageHeader + statPartials.join("\n\n"), (err) => {
    if (err) throw err
    resolve()
  })
))
.catch(err => console.log(err))
