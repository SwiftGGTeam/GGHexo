#!/usr/bin/env bash
yarn run babel-node generatePosts.js
cp -a treasure/. source/_posts
yarn run babel-node generateStat.js
yarn run babel-node generateShareMD.js
node backupPost.js
python 3-extractImgs.py
if [[ $1 == 'local' ]]; then
  yarn run hexo s
fi
yarn run hexo clean
current_branch=`git branch | grep "*"`
if [[ $current_branch == "* stage" ]]; then 
  echo 'deploy to SwiftGG/SwiftGGTeam.github.io'
  cd source
  git pull
  echo 'stage.swift.gg' > ./CNAME
  git add .
  git commit -m 'AUTO: Publish'
  git push
  cd ..
  git add .
  git commit -m 'AUTO: Publish'
  git push
fi
yarn run hexo g --bail --silent