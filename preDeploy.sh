#!/usr/bin/env bash
yarn run babel-node generatePosts.js
cp -a treasure/. source/_posts
yarn run babel-node generateStat.js
yarn run babel-node generateShareMD.js
node backupPost.js
python 3-extractImgs.py
yarn run hexo clean
current_branch=`git branch | grep "*"`
if [[ $current_branch == "* master" ]]; then 
  echo 'swift.gg' > ./source/CNAME
  echo 'deploy to SwiftGG/SwiftGGTeam.github.io'
  cd source
  git pull
  git add .
  git commit -m 'AUTO: Publish'
  git push
  cd ..
  git add .
  git commit -m 'AUTO: Publish'
  git push
else
  echo 'test.forelax.space' > ./source/CNAME
  echo 'deploy to SwiftGGSite/SwiftGGSite.github.io'
fi
yarn run hexo g --bail --silent