
// warning, without explicitly providing the ISO8601 format, dayjs.utc() formats differently!!
const markdown = `---
source: "<%- item.url %>"
<% if (item.context) { -%>
context: "<%- item.context %>"
<% } -%>
title: "<%- item.title %>"
date: "<%- item.date.format('YYYY-MM-DDTHH:mm:ssZ') %>"
---

<%- item.content %>
`

const enclosures = `
<div class="flex">
  <% images.forEach(function(image){ %>
    <div>
        <a class="lbox" href="<%- image %>">
            <img loading="lazy" src="<%- image %>" alt="Enclosed Toot image">
        </a>
    </div>
  <% }); %>
</div>
`

module.exports = {
	markdown,
	enclosures
}
