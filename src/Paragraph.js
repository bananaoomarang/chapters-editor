'use strict';

var marked = require('marked');

function Paragraph(el) {
  this.dom = el;
  this.unparsed = '';
  this.parsed   = '';
  this.dirty = false;
}

Paragraph.prototype.update = function(str) {
  if(typeof str !== 'string') return console.error('Please supply a string.');

  str = str.trim();

  this.unparsed = str;
  this.parsed = marked(str);

  this.dirty = true;
};

module.exports = Paragraph;
