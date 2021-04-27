# jam-my-stack 🥞

> A set of simple IndieWeb Jamstack publishing syndication tools

Published at https://www.npmjs.com/package/jam-my-stack

[![npm version](https://badge.fury.io/js/jam-my-stack.svg)](https://badge.fury.io/js/jam-my-stack)

Release notes: see `RELEASE.md`

---

These simple scripts **enrich your Jamstack-site** by adding/manipulating/whatever (meta)data, such as extra posts, indexing, and so forth. A primary example of these tools in action is my own site https://brainbaking.com - inspect how it's used at https://github.com/wgroeneveld/brainbaking 

**Are you looking for a way to receive webmentions?** See https://github.com/wgroeneveld/serve-my-jams !

## The tools

Usage: 

1. `yarn add jam-my-stack`
2. `const { mastodon, goodreads, lunr } = require('jam-my-stack')`

### 1. Mastodon

#### 1.1 `parseFeed`

An async function that parses your Fediverse-compatible feed (Mastodon/Pleroma/...) and converts entries to `.md` Markdown files for your Jamstack to enjoy. 

Usage example:

```js
    await mastodon.parseFeed({
        notesdir: `${__dirname}/content/notes`,
        url: "https://chat.brainbaking.com/users/wouter/feed",
        titleCount: 50,
        titlePrefix: "Note: "
    })
```

Options and their default values: 

- `titleCount`: `50`. Will add "..." and trim if title length bigger.
- `titlePrefix`: `""`. Will add before title (e.g. "Note: ")
- `ignoreReplies`: `false`. If true, will not process `in-reply-to` items.

Note that this **does not** delete the notes dir with every call. It simply checks if there isn't already a file with the same name (based on the publication date), and adds one if not. 

Example feed entry:

```xml
  <entry>
  <activity:object-type>http://activitystrea.ms/schema/1.0/note</activity:object-type>
  <activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb>
  <id>https://chat.brainbaking.com/objects/77a3ecfb-47e1-4d7a-a24a-8b779d80a8ac</id>
  <title>I pulled the Google plug and installed LineageOS: https://brainbaking.com/post/2021/03/getting-ri...</title>
  <content type="html">I pulled the Google plug and installed LineageOS: &lt;a href=&quot;https://brainbaking.com/post/2021/03/getting-rid-of-tracking-using-lineageos/&quot; rel=&quot;ugc&quot;&gt;https://brainbaking.com/post/2021/03/getting-rid-of-tracking-using-lineageos/&lt;/a&gt; Very impressed so far! Also rely on my own CalDAV server to replace GCalendar. Any others here running &lt;a class=&quot;hashtag&quot; data-tag=&quot;lineageos&quot; href=&quot;https://chat.brainbaking.com/tag/lineageos&quot; rel=&quot;tag ugc&quot;&gt;#lineageos&lt;/a&gt; for privacy reasons?</content>
  <published>2021-03-01T19:03:35.273023Z</published>
  <updated>2021-03-01T19:03:35.273023Z</updated>
  <ostatus:conversation ref="https://chat.brainbaking.com/contexts/ff9aa62e-3357-41ad-951d-15f6ad506424">
    https://chat.brainbaking.com/contexts/ff9aa62e-3357-41ad-951d-15f6ad506424
  </ostatus:conversation>
  <link href="https://chat.brainbaking.com/contexts/ff9aa62e-3357-41ad-951d-15f6ad506424" rel="ostatus:conversation"/>
    <summary></summary>
    <link type="application/atom+xml" href='https://chat.brainbaking.com/objects/77a3ecfb-47e1-4d7a-a24a-8b779d80a8ac' rel="self"/>
    <link type="text/html" href='https://chat.brainbaking.com/objects/77a3ecfb-47e1-4d7a-a24a-8b779d80a8ac' rel="alternate"/>
    <category term="lineageos"></category>
      <link rel="mentioned" ostatus:object-type="http://activitystrea.ms/schema/1.0/collection" href="http://activityschema.org/collection/public"/>
        <link rel="mentioned" ostatus:object-type="http://activitystrea.ms/schema/1.0/person" href="https://chat.brainbaking.com/users/wouter"/>
</entry>
```

This generates the file `01h19m03s35.md` with contents:

```md
---
source: "https://chat.brainbaking.com/objects/77a3ecfb-47e1-4d7a-a24a-8b779d80a8ac"
title: "I pulled the Google plug and installed LineageOS: https://brainbaking.com/post/2021/03/getting-ri..."
date: "2021-03-01T19:03:35+01:00"
---

I pulled the Google plug and installed LineageOS: <a href="https://brainbaking.com/post/2021/03/getting-rid-of-tracking-using-lineageos/" rel="ugc">https://brainbaking.com/post/2021/03/getting-rid-of-tracking-using-lineageos/</a> Very impressed so far! Also rely on my own CalDAV server to replace GCalendar. Any others here running <a class="hashtag" data-tag="lineageos" href="https://chat.brainbaking.com/tag/lineageos" rel="tag ugc">#lineageos</a> for privacy reasons?
```

See implementation for more details and features. 

**Also parsers**:

- `<link rel="enclosure"/>` image types (see `render-enclosures.ejs`) [ejs template](https://ejs.co/), that is appended to the Markdown file if any are found. Styling is up to you...
- `... @https://blah.com/blie hi there` - this is a **in-reply-to** toot which adds `context` frontmatter, so your html renderer can use the correct IndieWeb classes. This should also enable webmention sending since you mention the URL. If you "at" a valid Mastodon user, it will automatically do this. 
- On the `published` date: Mastodon feeds generate **ISO8601** timestamps with timezones. This is preserved in the resulting frontmatter using [dayjs](https://day.js.org/docs/en/display/format).

### 2. Goodreads

#### 2.1 `createWidget`

An async function that reads and modifies Goodreads JS widget embed code, converting low-res book covers to hi-res ones if possible. This omits possible Goodread cookies and cross-domain mishaps. 

Usage example:

```js
    const widget = await goodreads.createWidget("https://www.goodreads.com/review/grid_widget/5451893.Wouter's%20bookshelf:%20read?cover_size=medium&hide_link=&hide_title=&num_books=12&order=d&shelf=read&sort=date_added&widget_id=1496758344")
    await fsp.writeFile(`${__dirname}/static/js/goodreads.js`, widget, 'utf-8')
```

### 3. Lunr

#### 3.1 `buildIndex`

An async function that reads all `.md` files of certain locations (pass as an array `[]`), generating a [Lunr.js](https://lunrjs.com/) `.json` index object. Serialize it yourself wherever you'd like it to go.

Usage example:

```js
    const index = await lunr.buildIndex([
        `${__dirname}/content/post`,
        `${__dirname}/content/notes`])
    await fsp.writeFile(`${__dirname}/static/js/brainbaking-post.json`, JSON.stringify(index), 'utf-8')
```

### 4. Howlongtobeat

#### 4.1 `howlong`

Adds https://howlongtobeat.com/ game length (`MainGame`) and an ID to your front matter (keys `howlongtobeat_id` and `howlongtobeat_hrs`), provided you first added a property called `game_name`. (This gets substituted).

So, Frontmatter like this:

```
---
title: Diablo 3 my Review
game_name: Diablo 3
---
```

Gets subsituted by something like this:

```
---
title: Diablo 3 my Review
howlongtobeat_id: 62129
howlongtobeat_hrs: 20.5
---
```

In your Hugo template, add a link to `https://howlongtobeat.com/game?id={howlongtobeat_id}` and you're all set!

Usage example:

```js
  await howlong(`${__dirname}/content/articles`)
```

It will print out games and metadata it found. Uses the cool [howlongtobeat npm package](https://www.npmjs.com/package/howlongtobeat) to do its dirty work. 

Working example: https://jefklakscodex.com/articles/reviews/diablo-3/ (on the left side). Check out the Hugo template to use the properties at https://github.com/wgroeneveld/jefklakscodex .

### 5. Webmentions

In cooperation with https://github.com/wgroeneveld/serve-my-jams

#### 5.1 `getWebmentions`

Calls the get webmention endpoint, sorts by date, adds metadata such as relative date (`relativeTarget`, property), and returns data. Could be written in a `data` folder for Hugo to parse, for example. 

Parameters: just one, the `domain`.

#### 5.1 `send`

Calls the set webmention endpoint using a `PUT`. Based on the RSS feed located at `/index.xml`, see the [go-jamming](github.com/wgroeneveld/go-jamming) README. 

Parameters: just one, the `domain`.

