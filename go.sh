#!/usr/bin/env bash
cd source
git pull
cd ..
git pull
pythonversion=$(python -c 'import sys; print(sys.version_info[:])')
pythonversion=${pythonversion:1:1}
babel-node generatePosts.js
babel-node generateStat.js
babel-node generateShareMD.js
hexo clean
hexo g
hexo d
cd source
git add .
git add -u
git commit -m 'SCRIPT: update'
git push
cd ..
git add .
git add -u
git commit -m 'SCRIPT: update'
git push
