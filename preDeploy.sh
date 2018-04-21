#!/usr/bin/env bash
yarn run babel-node generatePosts.js
cp -a treasure/. source/_posts
node backupPost.js
yarn run babel-node generateStat.js
yarn run babel-node generateShareMD.js
python 3-extractImgs.py
if [[ $1 == 'local' ]]; then
  yarn run hexo s
fi
yarn run hexo clean
if [[ $TRAVIS_BRANCH == "stage" ]]; then 
  echo 'deploy to SwiftGG/SwiftGGTeam.github.io'
  cd source
  git checkout master
  git pull
  echo 'stage.swift.gg' > ./CNAME
  git add .
  git commit -m 'AUTO: Publish'
  git push
  cd ..
  git checkout stage
  git add .
  git commit -m 'AUTO: Publish'
  git push 
fi
yarn run hexo g --bail --silent