# jam-my-stack 🥞

> A set of simple IndieWeb Jamstack publishing syndication tools

Published at https://www.npmjs.com/package/jam-my-stack

These simple scripts **enrich your Jamstack-site** by adding/manipulating/whatever (meta)data, such as extra posts, indexing, and so forth. A primary example of these tools in action is my own site https://brainbaking.com - inspect how it's used at https://github.com/wgroeneveld/brainbaking 

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
        url: "https://chat.brainbaking.com/users/wouter/feed"
    })
```

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
