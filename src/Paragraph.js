'use strict';

var marked  = require('marked');
var getHTML = require('./htmlSnippets'); 

function Paragraph($el) {
  if(!$el) console.error('Please supply a jquery element to attatch to.');

  this.$el = $el;
  
  this.bind();

  this.unparsed = '';
  this.parsed   = '';

  this.focused = false;
}

Paragraph.prototype.bind = function() {
  var self = this;

  this.$el
    .focus(function onParagraphFocus() {

      self.focused = true;

      var isntJustWhitespace = (self.unparsed.trim().length !== 0);

      if(isntJustWhitespace)self.$el.text(self.unparsed);

    })
    .blur(function onParagraphBlur() {

      self.focused = false;

      self.$el.html( $(self.parsed).html() );

    });
};

Paragraph.prototype.rebind = function($el) {
  this.$el = $el;
  this.bind();
};

// Updates internal strings and rerenders based on markdown input
Paragraph.prototype.update = function(str) {
  // Store caret position
  var caretPos = this.$el.caret();
  var $newEl;
  var elementExists;

  this.unparsed = str;
  this.parsed = marked(str);

  elementExists = this.parsed.match(/\S/);


  if(elementExists) {

    $newEl = $(this.parsed);

    $newEl.attr('contenteditable', true);

  } else {
    // It's empty, so reset
    $newEl = $( getHTML('new-paragraph') );
  }

  this.$el.replaceWith($newEl);
  this.rebind($newEl);

  this.$el.focus();

  if(this.$el.text().length >= caretPos) this.$el.caret(caretPos);

};

// String slice alias
Paragraph.prototype.slice = function(a, b) {
  var stringToSlice = this.focused ? this.unparsed : this.parsed;

  if(b) {
    this.update(
      stringToSlice.slice(a, b)
    );
  } else {
    this.update( 
      stringToSlice.slice(a)
    );
  }

};

// Convenience JQuery alias
Paragraph.prototype.focus = function() {
  this.$el.focus();
};

module.exports = Paragraph;
