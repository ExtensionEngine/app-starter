'use strict';

import cheerio from 'cheerio';
import fs from 'fs';
import { MailData } from './IMail';
import map from 'lodash/map';
import mapKeys from 'lodash/mapKeys';
import mjml2html from 'mjml';
import { paramCase } from 'change-case';
import pupa from 'pupa';

function renderHtml(
  templatePath: string,
  data: MailData,
  style?: string
): string {
  const template = fs.readFileSync(templatePath, 'utf8');
  const $ = cheerio.load(template, { xmlMode: true });
  const $style = $('mj-attributes');
  $style.append(getAttributes($, style));
  const opts = { filePath: templatePath };
  const output = mjml2html($.html(), opts).html;
  return pupa(output, data);
}

function renderText(templatePath: string, data: MailData): string {
  const template = fs.readFileSync(templatePath, 'utf8');
  return pupa(template, data);
}

export { renderHtml, renderText };

function getAttributes($, style = {}) {
  return map(style, (declarations, name) => $('<mj-class>').attr({
    name,
    ...mapKeys(declarations, (_, key) => paramCase(String(key)))
  }));
}
