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
if [[ $TRAVIS_BRANCH == "master" ]]; then 
  echo 'deploy to SwiftGG/SwiftGGTeam.github.io aliyun-pages branch'
  cd source
  git checkout master
  git pull
  echo 'swift.gg' > ./CNAME
  git add .
  git commit -m 'AUTO: Publish'
  git push
  cd ..
  git checkout master
  git add .
  git commit -m 'AUTO: Publish'
  git push
elif [[ $TRAVIS_BRANCH == "stage" ]]; then
  echo 'deploy to SwiftGG/SwiftGGTeam.github.io master branch'
  echo 'stage.swift.gg' > source/CNAME
fi
yarn run hexo g --bail --silent