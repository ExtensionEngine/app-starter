'use strict';

import cheerio from 'cheerio';
import { MailData } from './IMail';
import fs from 'fs';
import map from 'lodash/map';
import mapKeys from 'lodash/mapKeys';
import mjml2html from 'mjml';
import mustache from 'mustache';
import { paramCase } from 'change-case';
import htmlToText from 'html-to-text';

function renderHtml(
  templatePath: string,
  data: MailData,
  style?: string
): string {
  const template = fs.readFileSync(templatePath, 'utf8');
  const $ = cheerio.load(template, { xmlMode: true });
  const $style = $('mj-attributes');
  $style.append(getAttributes($, style));
  const opts = { filePath: templatePath, minify: true };
  const mustacheOutput = mustache.render($.html(), data);
  const output = mjml2html(mustacheOutput, opts).html;
  // NOTE: Additional `mustache.render` call handles mustache syntax within mjml
  // subcomponents. Subcomponents' mustache syntax is removed by `mjml2html` if
  // placed outside of tag attribute or mj-text tag.
  return mustache.render(output, data);
}

function renderText(templatePath: string, data: MailData): string {
  const template = fs.readFileSync(templatePath, 'utf8');
  return mustache.render(template, { ...data, html });
}

export {
  renderHtml,
  renderText
};

function getAttributes($, style = {}) {
  return map(style, (declarations, name) => $('<mj-class>').attr({
    name,
    ...mapKeys(declarations, (_, key) => paramCase(String(key)))
  }));
}

function html() {
  return (text, render) => htmlToText.fromString(render(text));
}
