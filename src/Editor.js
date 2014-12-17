'use strict';

var Dropzone = require('dropzone');
var Paragraph = require('./Paragraph');
var Toolbar = require('./Toolbar');

var EDITOR_HTML = [
  '<div id="editor">',
    '<div class="paragraphs">',
    '</div>',
  '</div>'
].join('\n');

var NEW_PARA_HTML = [
  '<p contenteditable="true">&nbsp;</p>' // Blank Space necessary hack for firefox caret alignment
].join('\n');

function Editor(el, id) {
  this.id = id || 'editor';

  this.$editor = $(EDITOR_HTML);
  this.$editor.attr('id', this.id);
  this.appendSelfTo(el);

  this.toolbar = new Toolbar();
  this.$editor.prepend(this.toolbar.getHTML());

  this.$paragraphs = $('#' + this.id + ' .paragraphs');

  this.paragraphs = [];

  this.bindUI();
  this.bindKeys();
  this.appendParagraph();

  this.dropzone = new Dropzone('div#editor', { 
    url: '/file/post' 
  });
}

// Load the data from our memeory into the DOM
Editor.prototype.render = function() {
  var self = this;

  this.paragraphs.forEach(function renderParagraph(p, index) {
    var child = $(self.$paragraphs.children()[index]);

    if(p.dirty && child) {
      var $parsed = $(p.parsed);
      $parsed.attr('contenteditable', true);
      self.bindParagraph($parsed, p);

      child.replaceWith($parsed);
    }
  });
};

Editor.prototype.appendParagraph = function() {
  var p = new Paragraph();
  this.paragraphs.push(p);

  var pDOM = $(NEW_PARA_HTML);

  this.$paragraphs.append(pDOM);
  this.bindParagraph(pDOM, p);

  pDOM.focus();

  return pDOM;
};

Editor.prototype.newLine = function($el) {
  var index = $el.index() + 1;
  var p = new Paragraph();
  var pDOM = $(NEW_PARA_HTML);

  // Insert new paragraph into internal array
  this.paragraphs.splice(index, 0, p);

  // Insert DOM representation
  pDOM.insertAfter($el);
  this.bindParagraph(pDOM, p);

  pDOM.focus();
};

Editor.prototype.setAlignment = function($paragraph, alignment) {
  $paragraph.css('text-align', alignment);
};

Editor.prototype.loadFromFile = function() {
  //TODO
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
    var $currentParagraph = $(document.activeElement);
    var $nextParagraph = $currentParagraph.next();
    var $previousParagraph = $currentParagraph.prev();
    var currentIndex = $currentParagraph.index();

    switch(event.which) {
      case ENTER:
        // move to/create next paragraph
        if($nextParagraph.length) {
          self.newLine($currentParagraph);
        } else {
          self.appendParagraph();
        }

        return false;
      case UP:
        return false;
      case DOWN:
        return false;
      case BACKSPACE:

        // Block backspace from causing an actual <- in the browser
        if((event.target.getAttribute('contenteditable') &&
           $(event.target).caret() === 0) || event.target.disabled || event.target.readOnly) {
          event.preventDefault();
          event.stopPropagation();
        }

        if($currentParagraph.text().length === 0) {
          
          // Remove the current, empty paragraph
          $currentParagraph.remove();
          self.paragraphs.splice(currentIndex, 1);

          $previousParagraph
            .focus()
            .caret( $previousParagraph.text().length );

        }

        if($previousParagraph.text().length &&
           $currentParagraph.caret() === 0) {

          // Remove this paragraph and copy the text to the above
          $previousParagraph
            .focus()
            .caret($previousParagraph.text().length);

          $previousParagraph.text( $previousParagraph.text() + $currentParagraph.text() );

          $currentParagraph.remove();
          self.paragraphs.splice(currentIndex, 1);

          event.preventDefault();
          event.stopPropagation();

        }
    }
  });
};

Editor.prototype.bindParagraph = function(pDOM, p) {
  var self = this;

  pDOM
  .blur(function onParagraphBlur() {
    var newStr = pDOM.text();

    if(newStr) {
      p.update(newStr);
      self.render();
    }
  })
  .focus(function onParagraphFocus() {
    // Go one child deeper if we need to, avoid loosing tag-based styling
    var children = pDOM.children();
    if(children.length === 1) pDOM = $(children[0]);

    // Replace inner text with unparsed for editing
    if(p.unparsed !== '') pDOM.text(p.unparsed);
  });
};

Editor.prototype.bindUI = function() {
  var self = this;

  $('.btn[name=left]').click(function alignLeft() {
    self.setAlignment(self.$paragraphs, 'left');
  });

  $('.btn[name=center]').click(function alignCenter() {
    self.setAlignment(self.$paragraphs, 'center');
  });

  $('.btn[name=right]').click(function alignRight() {
    self.setAlignment(self.$paragraphs, 'right');
  });
};

Editor.prototype.appendSelfTo = function(element) {
  $(element).append(this.$editor);
};

module.exports = Editor;
