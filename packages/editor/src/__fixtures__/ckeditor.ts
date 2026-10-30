/**
 * HTML as CKEditor writes it, with the features that v4 projects configure: block styles
 * (`<p class="big">`), headings, links, lists, bold and italic, and embedded media.
 */

/**
 * CKEditor 5: no whitespace between blocks, `<i>` for italics, bare list items, media embeds
 * with and without their preview (`previewsInData`), links to other sites with `target` and `rel`
 * before `href`, as its link decorators write them.
 */
export const ckeditor5 = [
    '<h2>A heading</h2>',
    '<p class="big">A big paragraph, with <strong>bold</strong> and <i>italic</i> text.</p>',
    '<p>A <a target="_blank" rel="noopener noreferrer" href="https://example.com/page">link to another site</a>, a <a href="/en/about">link to a page</a>, a <a href="mailto:hello@example.com"><strong>bold e-mail link</strong></a> and a non-breaking&nbsp;space.</p>',
    '<h4>A smaller heading</h4>',
    '<ul><li>First item</li><li>Second item, <strong><i>bold and italic</i></strong><ul><li>Nested item</li></ul></li></ul>',
    '<ol><li>One</li><li>Two</li></ol>',
    '<figure class="media"><oembed url="https://www.youtube.com/watch?v=abc123"></oembed></figure>',
    '<figure class="media"><div data-oembed-url="https://vimeo.com/123456"><div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;"><iframe src="https://player.vimeo.com/video/123456" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen=""></iframe></div></div></figure>',
    '<blockquote><p>A quote.</p></blockquote>',
    '<p>A line<br>broken in two.</p>',
    '<figure class="image"><img src="https://example.com/image.jpg" alt="An image"><figcaption>A caption</figcaption></figure>',
    '<p class="big">Another <a target="_blank" rel="noopener noreferrer" href="https://example.com/other">big</a> paragraph.</p>',
    '<p>&nbsp;</p>',
].join('');

/**
 * CKEditor 4: blocks on their own lines, list items indented with tabs, entities for accented
 * letters, `<br />`, inline images and iframes in paragraphs, styles on spans, a table, and a
 * social post with its script.
 */
export const ckeditor4 = `<h2>A heading</h2>

<p class="big">A big paragraph, with <strong>bold</strong> and <em>italic</em> text.</p>

<p>A <a href="https://example.com/page" target="_blank">link</a>, accented letters (&eacute;t&eacute;, &agrave; c&ocirc;t&eacute;), quotes (&laquo;&nbsp;oui&nbsp;&raquo;) and an ampersand: &amp;.</p>

<h3 id="section">A heading with an id</h3>

<ul>
	<li>First item</li>
	<li>Second item
	<ul>
		<li>Nested item</li>
	</ul>
	</li>
</ul>

<ol start="3">
	<li>Three</li>
	<li>Four</li>
</ol>

<p><img alt="" src="https://example.com/image.jpg" style="height:200px; width:300px" /></p>

<p style="text-align:center"><iframe allowfullscreen="" frameborder="0" height="315" src="https://www.youtube.com/embed/abc123" width="560"></iframe></p>

<blockquote>
<p>A quote.</p>
</blockquote>

<p>Text in <span style="color:#e74c3c">color</span>, <u>underlined</u>, <s>struck</s>, x<sup>2</sup>, H<sub>2</sub>O, <a name="anchor"></a>an anchor and <abbr title="HyperText Markup Language">HTML</abbr>.</p>

<table border="1" cellpadding="1" cellspacing="1" style="width:500px">
	<tbody>
		<tr>
			<td>Cell</td>
			<td>Other cell</td>
		</tr>
	</tbody>
</table>

<p>A line<br />
broken in two.</p>

<hr />
<blockquote class="twitter-tweet">
<p dir="ltr" lang="en">A post. <a href="https://t.co/abc">pic.twitter.com/abc</a></p>
&mdash; Someone (@someone) <a href="https://twitter.com/someone/status/1">January 1, 2020</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<pre>
Preformatted   text,
  kept as is.</pre>
`;
