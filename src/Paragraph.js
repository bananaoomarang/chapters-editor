'use strict';

var marked = require('marked');

function Paragraph($el) {
  if(!$el) console.error('Please supply a jquery element to attatch to.');

  this.$el = $el;
  
  this.bind();

  this.unparsed = '';
  this.parsed   = '';
}

Paragraph.prototype.bind = function() {
  var self = this;

  this.$el
    .focus(function onParagraphFocus() {

      self.$el.text(self.unparsed);

    })
    .blur(function onParagraphBlur() {

      self.$el.html( $(self.parsed).html() );

    });
};

Paragraph.prototype.rebind = function($el) {
  this.$el = $el;
  this.bind();
};

Paragraph.prototype.update = function(str) {
  // Store caret position
  var caretPos = this.$el.caret();
  var $newEl;

  this.unparsed = str;
  this.parsed = marked(str);

  $newEl = $(this.parsed);

  $newEl.attr('contenteditable', true);

  this.$el.replaceWith($newEl);
  this.rebind($newEl);

  this.$el.focus().caret(caretPos);
};

module.exports = Paragraph;
