'use strict';

var marked = require('marked');

function Paragraph() {
  this.unparsed = '';
  this.parsed   = '';
  this.dirty = false;
}

Paragraph.prototype.update = function(str) {
  if(!str) console.error('Please supply a string.');

  this.unparsed = str;
  this.parsed = marked(str);

  this.dirty = true;
};

module.exports = Paragraph;
