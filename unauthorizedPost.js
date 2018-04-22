// 没有获得授权的文章列表，这些数据用于在统计时加到每个人的统计中，以及在生成 share md 的时候过滤掉这些文章
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

module.exports = deleted