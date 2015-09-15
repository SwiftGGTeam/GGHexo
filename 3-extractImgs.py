#!/usr/bin/env python
import urllib.request
from os import walk, path, mkdir
import re


basepath = "./source/_posts"
files = next(walk(basepath))[2]
files = filter(lambda x: not x.startswith("."), files)


def getcontent(filepath):

    fileurl = ''
    content = ''
    imgs = []

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f.readlines():
            content += line
            if line.startswith("permalink"):
                fileurl = line.split(":")[1].strip()
            imgurls = re.findall(r'(!\[.*?\]\(http.*?\))', line)
            if imgurls:
                imgs.extend(imgurls)

    if not fileurl:
        raise ValueError("No permalink in %s! Please add permalink before run this script!" % (filepath, ))

    return (filepath, fileurl, content, imgs)

def writeback(option):

    (filepath, fileurl, content, imgs, downloadimgs) = option

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def changeurls(option):

    (filepath, fileurl, content, imgs, downloadimgs) = option

    for i, img in enumerate(imgs):
        content = content.replace(img, downloadimgs[i])

    return (filepath, fileurl, content, imgs, downloadimgs)


def downloadimgs(option):

    targetpath = "./themes/jacman/source/img/articles"
    targeturl = "/img/articles"
    (filepath, fileurl, content, imgs) = option
    downloadimgs = []

    for img in imgs:
        (imgoriname, imgurl, imgname) = re.findall(r'!\[(.*)\]\((.*/(.*))\)', img)[0]
        imgname = imgname.replace("?", "")

        if not path.isdir(path.join(targetpath, fileurl)):
            mkdir(path.join(targetpath, fileurl)) 
        if not path.exists(path.join(targetpath, fileurl, imgname)):
            try:
                urllib.request.urlretrieve(imgurl, path.join(targetpath, fileurl, imgname)) 
            except:
                raise ValueError("Can't download %s-->%s, please check the url!" % (fileurl, imgurl))
        downloadimgs.append("![%s](%s)" % (imgoriname, targeturl + "/" + fileurl + "/" + imgname))

    return (filepath, fileurl, content, imgs, downloadimgs)


list(map(lambda x: writeback(changeurls(downloadimgs(getcontent(path.join(basepath, x))))), files))
