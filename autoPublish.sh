#!/usr/bin/env bash
cd /GGHexo/source
git pull
cd ..
git pull
file_num=$(ls /GGHexo/source/_posts -1 --file-type | grep -v '/$' | wc -l)
babel-node generatePosts.js
file_num_now=$(ls /GGHexo/source/_posts -1 --file-type | grep -v '/$' | wc -l)
if (( file_num_now > file_num )); then
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
else
  git reset --hard HEAD
  cd source
  git reset --hard HEAD
fi
