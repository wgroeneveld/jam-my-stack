const ejs = require('ejs');
const templates = require('./templates');

const got = require("got");
const parser = require("fast-xml-parser");
const ent = require('ent');

const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { getFiles } = require('./../file-utils');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

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

  let mddata = ejs.render(templates.markdown, { item })

  if(item.media?.length > 0) {
    mddata += '\n' + ejs.render(templates.enclosures, { images: item.media }, { rmWhitespace: true })
  }

  writeFileSync(`${path}/${item.hash}.md`, mddata, 'utf-8')
}

const escQuotes = str => str.replace(/\"/g, "\\\"")

function trimIfNeeded(title, count, prefix) {
  if(title.length > count) {
    return prefix + title.substring(0, count) + "..."
  }
  return prefix + title
}

function detectContext(item, content) {
    // format: <thr:in-reply-to ref='https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793' href='https://social.linux.pizza/users/StampedingLonghorn/statuses/105821099684887793'/>
    if(item['thr:in-reply-to']) {
      return item['thr:in-reply-to']['@_ref']
    }  
    
    // could also be: manually in text "@[<a href...]"
    if(content.indexOf("@<a") >= 0) {
      const res = content.match(/@<a\s(.*?)href="(.*?)".*?>/)
      if(res.length == 3) {
        return res[2]
      }
    }

    return ""
}

// opts:
//  notesdir = `${__dirname}/content/notes`
//  url = "https://chat.brainbaking.com/users/wouter/feed";
//  utcOffset = 60 (in minutes)
//  titleCount = 50
//  titlePrefix = "Note: "
//  ignoreReplies = false

async function parseMastoFeed(options) {
  const { notesdir, url, utcOffset = 60, titleCount = 50, titlePrefix = "", ignoreReplies = false } = options

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

  // in case a single item is in a feed instead of an array, wrap it ourselves
  const entries = root.feed.entry.map ? root.feed.entry : [root.feed.entry]
  
  const items = entries.map(item => {
    const content = ent.decode(ent.decode(item.content['#text'])) // format: &lt;span class=&quot;h-card.... 
    const date = dayjs.utc(item.published).utcOffset(utcOffset)
    const year = date.format("YYYY")
    const month = date.format("MM")
    const day = date.format("DD")
    const context = detectContext(item, content)
    const title = escQuotes(ent.decode(ent.decode(item.title)))

    const media = item.link?.filter(l => 
      l['@_rel'] === 'enclosure' &&
      l['@_type'] === 'image/jpeg').map(l => l['@_href'])
    

    // WHY double decode? &#34; = &amp;#34; - first decode '&', then the other char.'
    return { 
      title: trimIfNeeded(title, titleCount, titlePrefix), // summary (cut-off) of content
      content,
      url: escQuotes(item.id), // format: https://chat.brainbaking.com/objects/0707fd54-185d-4ee7-9204-be370d57663c
      context: escQuotes(context),
      contextFromMastodon: item['thr:in-reply-to'],
      id: stripBeforeLastSlash(item.id),
      media,
      hash: `${day}h${date.format("HH")}m${date.format("mm")}s${date.format("ss")}`,
      date, // format: 2021-03-02T16:18:46.658056Z
      year,
      month,
      day
    }
  })
    .filter(itm => ignoreReplies ? !itm.contextFromMastodon : true)
    .filter(itm => !notes.includes(`${itm.year}/${itm.month}/${itm.hash}`))
    .forEach(itm => convertAtomItemToMd(itm, notesdir))
}

module.exports = {
  parseMastoFeed
}
