export const SHOP_RICH_TEXT_BODY_CLASS =
  'leading-relaxed [&_p]:my-0 [&_div]:my-0 [&_h1]:my-0 [&_h2]:my-0 [&_h3]:my-0 [&_h4]:my-0 [&_p+p]:mt-4 [&_div+div]:mt-4 [&_h1+*]:mt-4 [&_h2+*]:mt-4 [&_h3+*]:mt-4 [&_h4+*]:mt-4 [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-6';

const EMPTY_BLOCK_RE = /<(div|p|h[1-6])(\s[^>]*)?>(?:\s|&nbsp;|\u00a0|<br\s*\/?>)*<\/\1>/gi;
const HEADING_RE = /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;

function stripHeadingTags(html: string): string {
  return html.replace(HEADING_RE, (_match, _level, attrs, inner) => {
    const clean = String(inner).trim();
    return clean ? `<div${attrs ?? ''}>${clean}</div>` : '';
  });
}

function collapseInterTagWhitespace(html: string): string {
  return html.replace(/\r\n/g, '\n').replace(/>\s+</g, '><').trim();
}

export function normalizeShopRichTextHtmlLight(html: string): string {
  if (!html) return '';
  return collapseInterTagWhitespace(stripHeadingTags(html));
}

export function normalizeShopRichTextHtml(html: string): string {
  if (!html) return '';

  let out = collapseInterTagWhitespace(stripHeadingTags(html));

  for (let i = 0; i < 6; i += 1) {
    const next = out.replace(EMPTY_BLOCK_RE, '');
    if (next === out) break;
    out = next;
  }

  return out.trim();
}

export function prepareShopAboutHtml(html: string): string {
  return normalizeShopRichTextHtml(html);
}
