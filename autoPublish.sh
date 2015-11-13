#!/usr/bin/env bash

cd /GGHexo
git fetch
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})
if [ $LOCAL = $REMOTE ]; then
  echo "Up-to-date"
  file_num=$(ls /GGHexo/source/_posts -1 --file-type | grep -v '/$' | wc -l)
  babel-node generatePosts.js
  file_num_now=$(ls /GGHexo/source/_posts -1 --file-type | grep -v '/$' | wc -l)
  if (( file_num_now > file_num )); then
    git pull
    python 3-extractImgs.py
    babel-node generatePosts.js
    babel-node generateStat.js
    babel-node generateShareMD.js
    hexo clean
    hexo g
    hexo d
    cd source
    git pull
    git add .
    git commit -m 'AUTO: publish1'
    git push
    cd ..
    git add .
    git commit -m 'AUTO: publish1'
    git push
  else
    git reset --hard HEAD
    cd source
    git reset --hard HEAD
  fi
elif [ $LOCAL = $BASE ]; then
  cd /GGHexo/source
  git pull
  cd ..
  git pull
  python 3-extractImgs.py
  babel-node generatePosts.js
  babel-node generateStat.js
  babel-node generateShareMD.js
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
