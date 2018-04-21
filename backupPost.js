const fs = require('fs-extra')

const files = fs.readdirSync('./src')
files.forEach(fileName => {
  const year = fileName.substring(0, 4)
  if (year == (new Date()).getFullYear() || fileName === '.gitkeep') {
    return
  }
  const destDir = `./backup/${year}`
  if (fs.existsSync(destDir) == false) {
    fs.mkdir(destDir)
  }
  fs.move(`./src/${fileName}`, `${destDir}/${fileName}`, (err) => {
    if (err) return console.error(err)
  })
});