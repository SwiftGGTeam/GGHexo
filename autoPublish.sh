#!/usr/bin/env bash

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})
if [ $LOCAL = $REMOTE ]; then
  echo "Up-to-date"
elif [ $LOCAL = $BASE ]; then
  cd /GGHexo/source
  git pull
  cd ..
  git pull
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
