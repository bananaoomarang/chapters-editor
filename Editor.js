'use strict';

var marked = require('marked');
var Paragraph = require('./Paragraph');

function Editor(el) {
  this.id = 'editor';
  this.html = '<div id=' + this.id + '></div>';
  
  this.appendSelfTo(el);

  this.currentParagraph = null;
  this.$self = $('#' + this.id);

  this.paragraphs = [];

  this.bindUI();
  this.bindKeys();
  this.appendParagraph();
}

// Load the data from our memeory into the DOM
Editor.prototype.render = function() {
  var self = this;

  this.paragraphs.forEach(function renderParagraph(p, index) {
    var child = $(self.$self.children()[index]);

    if(p.dirty && child) {
      var $parsed = $(p.parsed);
      $parsed.attr('contentEditable', true);
      self.bindParagraph($parsed, p);

      child.replaceWith($parsed);
    }
  });

};

Editor.prototype.markify = function(element) {
  var $element = $(element);
  var markedHTML = marked($element.html());

  // Store unparsed string
  $element
    .data('unmarked', $element.html());

  // Replace inner HTML
  $element
    .html(markedHTML);
};

Editor.prototype.demarkify = function(element) {
  var $this = $(element);

  $this.html($this.data('unmarked'));
};

Editor.prototype.appendParagraph = function() {
  var self = this;

  var p = new Paragraph();
  this.paragraphs.push(p);

  var pDOM = $('<p contentEditable="true"></p>');

  this.$self.append(pDOM);
  this.bindParagraph(pDOM, p);

  pDOM.focus();

  return pDOM;
};

Editor.prototype.setAlignment = function($paragraph, alignment) {
  console.log($paragraph);
  $paragraph.css('text-align', alignment);
};

Editor.prototype.loadFromFile = function() {
};

Editor.prototype.bindKeys = function() {
  var self = this;

  var ENTER = 13;
  var BACKSPACE = 8;
  var LEFT = 37;
  var RIGHT = 39;
  var UP = 38;
  var DOWN = 40;

  $(document).keydown(function onKeyDown(event) {

    var $currentParagraph = $(self.currentParagraph);
    var caretPos = $currentParagraph.caret();
    var $nextParagraph = $currentParagraph.next();
    var $previousParagraph = $currentParagraph.prev();

    switch(event.which) {
      case ENTER:
        // move to/create next paragraph
        if($nextParagraph.length) {
          $nextParagraph.focus();
        } else {
          self.appendParagraph();
        }

        return false;
      case UP:
        $previousParagraph.focus().caret(caretPos);

        return false;
      case DOWN:
        $nextParagraph.focus().caret(caretPos);

        return false;
      case BACKSPACE:
        // Edit previous paragraph when pressed on empty one
        if($currentParagraph.caret() === 0) {

          if($previousParagraph.length) {
            $previousParagraph
              .focus()
              .caret($previousParagraph.html().length);
          }
        }

        return false;
    }
  });
};

Editor.prototype.bindParagraph = function(pDOM, p) {
  var self = this;

  pDOM
  .blur(function onParagraphBlur() {
    var newStr = pDOM.html();

    if(newStr) {
      p.update(newStr);
      self.render();
    }
  })
  .focus(function onParagraphFocus() {
    self.currentParagraph = this;

    pDOM.text(p.unparsed);
  });
};

Editor.prototype.bindUI = function() {
  var self = this;

  $('.btn[name=left]').click(function alignLeft() {
    self.setAlignment(self.$self, 'left');
  });

  $('.btn[name=center]').click(function alignCenter() {
    self.setAlignment(self.$self, 'center');
  });

  $('.btn[name=right]').click(function alignRight() {
    self.setAlignment(self.$self, 'right');
  });
};

Editor.prototype.appendSelfTo = function(element) {
  $(element).append(this.html);
};

module.exports = Editor;
