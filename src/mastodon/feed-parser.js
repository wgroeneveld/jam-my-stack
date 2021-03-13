const got = require("got");
const parser = require("fast-xml-parser");
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const ent = require('ent')
const { getFiles } = require('./../file-utils');
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

function stripBeforeThirdSlash(str) {
  const splitted = str.split('/')
  return splitted.slice(splitted.length - 3).join('/')
}

function stripBeforeLastSlash(str) {
  return str.substring(str.lastIndexOf('/') + 1, str.length)
}

function convertAtomItemToMd(item, notesdir) {
  const path = `${notesdir}/${item.year}/${item.month}`
  if(!existsSync(`${notesdir}/${item.year}`)) mkdirSync(`${notesdir}/${item.year}`)
  if(!existsSync(path)) mkdirSync(path)

  const mddata = `---
source: "${item.url}"
context: "${item.context}"
title: "${item.title}"
date: "${item.year}-${item.month}-${item.day}T${item.date.format("HH:mm:ss")}"
---

${item.content}
  `

  writeFileSync(`${path}/${item.hash}.md`, mddata, 'utf-8')
}

function trimIfNeeded(title, count, prefix) {
  if(title.length > count) {
    return prefix + title.substring(0, count) + "..."
  }
  return prefix + title
}

// opts:
//  notesdir = `${__dirname}/content/notes`
//  url = "https://chat.brainbaking.com/users/wouter/feed";
//  utcOffset = 60 (in minutes)
//  titleCount = 50
//  titlePrefix = "Note: "

async function parseMastoFeed(options) {
  const { notesdir, url, utcOffset = 60, titleCount = 50, titlePrefix = "" } = options

  const notesroot = await getFiles(notesdir)
  const notes = notesroot
    .filter(name => name.endsWith('.md'))
    .map(n => stripBeforeThirdSlash(n.replace('.md', '')))

  const buffer = await got(url, {
    responseType: "buffer",
    resolveBodyOnly: true,
    timeout: 5000,
    retry: 5
  });
  const root = parser.parse(buffer.toString(), {
    ignoreAttributes: false
  })
  const items = root.feed.entry.map(item => {
    const date = dayjs.utc(item.published).utcOffset(utcOffset)
    const year = date.format("YYYY")
    const month = date.format("MM")
    const day = date.format("DD")
    // format: <thr:in-reply-to ref='https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793' href='https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793'/>
    const context = item['thr:in-reply-to'] ? item['thr:in-reply-to']['@_ref'] : ""

    // WHY double decode? &#34; = &amp;#34; - first decode '&', then the other char.'
    return { 
      title: trimIfNeeded(ent.decode(ent.decode(item.title)), titleCount, titlePrefix), // summary (cut-off) of content
      content: ent.decode(ent.decode(item.content['#text'])), // format: &lt;span class=&quot;h-card.... 
      url: item.id, // format: https://chat.brainbaking.com/objects/0707fd54-185d-4ee7-9204-be370d57663c
      context,
      id: stripBeforeLastSlash(item.id),
      hash: `${day}h${date.format("HH")}m${date.format("mm")}s${date.format("ss")}`,
      date, // format: 2021-03-02T16:18:46.658056Z
      year,
      month,
      day
    }
  })
    .filter(itm => !notes.includes(`${itm.year}/${itm.month}/${itm.hash}`))
    .forEach(itm => convertAtomItemToMd(itm, notesdir))
}

module.exports = {
  parseMastoFeed
}
