#!/usr/bin/env python
from __future__ import with_statement
from __future__ import absolute_import
import urllib2, urllib
from os import walk, path, mkdir
import re
from io import open
from itertools import imap


basepath = u".\source\_posts"
files = walk(basepath).next()[2]


def getcontent(filepath):

    fileurl = u''
    content = u''
    imgs = []

    with open(filepath, u"r", encoding=u"utf-8") as f:
        for line in f.readlines():
            content += line
            if line.startswith(u"permalink"):
                fileurl = line.split(u":")[1].strip()
            imgurls = re.findall(ur'(!\[.*?\]\(http.*?\))', line)
            if imgurls:
                imgs.extend(imgurls)

    if not fileurl:
        raise ValueError(u"No permalink in %s! Please add permalink before run this script!" % (filepath, ))

    return (filepath, fileurl, content, imgs)

def writeback(option):

    (filepath, fileurl, content, imgs, downloadimgs) = option

    with open(filepath, u"w", encoding=u"utf-8") as f:
        f.write(content)


def changeurls(option):

    (filepath, fileurl, content, imgs, downloadimgs) = option

    for i, img in enumerate(imgs):
        content = content.replace(img, downloadimgs[i])

    return (filepath, fileurl, content, imgs, downloadimgs)


def downloadimgs(option):

    targetpath = u"./themes/jacman/source/img/articles"
    targeturl = u"/img/articles"
    (filepath, fileurl, content, imgs) = option
    downloadimgs = []

    for img in imgs:
        (imgoriname, imgurl, imgname) = re.findall(ur'!\[(.*)\]\((.*/(.*))\)', img)[0]

        if not path.isdir(path.join(targetpath, fileurl)):
            mkdir(path.join(targetpath, fileurl)) 
        if not path.exists(path.join(targetpath, fileurl, imgname)):
            try:
                urllib.urlretrieve(imgurl, path.join(targetpath, fileurl, imgname)) 
            except:
                raise ValueError(u"Can't download %s-->%s, please check the url!" % (fileurl, imgurl))
        downloadimgs.append(u"![%s](%s)" % (imgoriname, targeturl + u"/" + fileurl + u"/" + imgname))

    return (filepath, fileurl, content, imgs, downloadimgs)


list(imap(lambda x: writeback(changeurls(downloadimgs(getcontent(path.join(basepath, x))))), files))
