#!/usr/bin/env bash
cd /GGHexo
git fetch origin
reslog=$(git log HEAD..origin/master --oneline)
if [[ "${reslog}" != "" ]] ; then
  git merge origin/master
  cd source
  git pull
  cd .. 
  babel-node generatePosts.js
  babel-node generateStat.js
  babel-node generateShareMD.js
  python 3-extractImgs.py
  hexo clean
  hexo g
  hexo d
  cd source
  git add .
  git commit -m 'AUTO: publish'
  git push
  cd ..
  git add .
  git commit -m 'AUTO: publish'
  git push
 fi
