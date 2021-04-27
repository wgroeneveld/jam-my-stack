
const markdown = `---
source: "<%- item.url %>"
<% if (item.context) { -%>
context: "<%- item.context %>"
<% } -%>
title: "<%- item.title %>"
date: "<%- item.year %>-<%- item.month %>-<%- item.day %>T<%- item.date.format('HH:mm:ss') %>"
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
