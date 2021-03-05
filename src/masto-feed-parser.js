const got = require("got");
const parser = require("fast-xml-parser");
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const ent = require('ent')
const { getFiles } = require('./file-utils');


function stripBeforeThirdSlash(str) {
  const splitted = str.split('/')
  return splitted.slice(splitted.length - 3).join('/')
}

function stripBeforeLastSlash(str) {
  return str.substring(str.lastIndexOf('/') + 1, str.length)
}

function strpad(n) {
    return String("0" + n).slice(-2);
}

function convertAtomItemToMd(item, opts) {
  const path = `${opts.notesdir}/${item.year}/${item.month}`
  if(!existsSync(`${opts.notesdir}/${item.year}`)) mkdirSync(`${opts.notesdir}/${item.year}`)
  if(!existsSync(path)) mkdirSync(path)

  const mddata = `---
source: "${item.url}"
context: "${item.context}"
title: "${item.title}"
date: "${item.year}-${item.month}-${item.day}T${strpad(item.date.getHours())}:${strpad(item.date.getMinutes())}:${strpad(item.date.getSeconds())}"
---

${item.content}
  `

  writeFileSync(`${path}/${item.hash}.md`, mddata, 'utf-8')
}

// opts:
//  notesdir = `${__dirname}/content/notes`
//  url = "https://chat.brainbaking.com/users/wouter/feed";

async function parseMastoFeed(opts) {
  const notesroot = await getFiles(opts.notesdir)
  const notes = notesroot
    .filter(name => name.endsWith('.md'))
    .map(n => stripBeforeThirdSlash(n.replace('.md', '')))

  const buffer = await got(opts.url, {
    responseType: "buffer",
    resolveBodyOnly: true,
    timeout: 5000,
    retry: 5
  });
  const root = parser.parse(buffer.toString(), {
    ignoreAttributes: false
  })
  const items = root.feed.entry.map(item => {
    const date = new Date(item.published)
    const year = date.getFullYear()
    const month = strpad(date.getMonth() + 1)
    const day = strpad(date.getDate())
    // format: <thr:in-reply-to ref='https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793' href='https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793'/>
    const context = item['thr:in-reply-to'] ? item['thr:in-reply-to']['@_ref'] : ""

    return { 
      title: ent.decode(item.title), // summary (cut-off) of content
      content: ent.decode(item.content['#text']), // format: &lt;span class=&quot;h-card.... 
      url: item.id, // format: https://chat.brainbaking.com/objects/0707fd54-185d-4ee7-9204-be370d57663c
      context,
      id: stripBeforeLastSlash(item.id),
      hash: `${day}h${date.getHours()}m${date.getMinutes()}s${date.getSeconds()}`,
      date, // format: 2021-03-02T16:18:46.658056Z
      year,
      month,
      day
    }
  })
    .filter(itm => !notes.includes(`${itm.year}/${itm.month}/${itm.hash}`))
    .forEach(itm => convertAtomItemToMd(itm, opts))
}

module.exports = {
  parseMastoFeed
}
