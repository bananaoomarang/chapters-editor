'use strict';

var Paragraph = require('./Paragraph');
var Toolbar = require('./Toolbar');
var getHTML = require('./htmlSnippets.js');

function Editor(el, id) {
  this.id = id || 'editor';

  this.$editor = $( getHTML('editor-base') );
  this.$editor.attr('id', this.id);
  this.appendSelfTo(el);

  this.toolbar = new Toolbar();
  this.$editor.prepend(this.toolbar.getHTML());

  this.$paragraphs = $('#' + this.id + ' .paragraphs');

  this.paragraphs = [];

  this.bindUI();
  this.bindKeys();
  this.newLine().focus();
}

Editor.prototype.render = function() {
  var self = this;

  this.paragraphs.forEach(function renderParagraph(p, index) {
    var child = $( self.$paragraphs.children()[index] );

    if (child && p.parsed) {
      var $parsed = $(p.parsed);

      $parsed.attr('contenteditable', true);
      p.rebind($parsed);

      child.replaceWith($parsed);

      $parsed.focus();
    }
  });
};

Editor.prototype.newLine = function(paragraphAbove) {
  var p = new Paragraph( $( getHTML('new-paragraph') ) );
  var index;

  if(!paragraphAbove) {

    // Then just append a paragraph

    this.paragraphs.push(p);
    this.$paragraphs.append(p.$el);

  } else {

    index = paragraphAbove.$el.index() + 1;

    // Insert new paragraph into internal array
    this.paragraphs.splice(index, 0, p);

    // Insert DOM representation
    p.$el.insertAfter(paragraphAbove.$el);

  }

  return p;
};

Editor.prototype.setAlignment = function($paragraph, alignment) {
  $paragraph.css('text-align', alignment);
};

Editor.prototype.bindKeys = function() {
  var self = this;

  var ENTER = 13;
  var BACKSPACE = 8;
  var LEFT = 37;
  var RIGHT = 39;
  var UP = 38;
  var DOWN = 40;
  var SHIFT = 16;
  var CONTROL = 17;

  $(document).keydown(function onKeyDown(event) {

    var currentIndex      = $(document.activeElement).index();
    var currentParagraph  = self.paragraphs[currentIndex];
    var nextParagraph     = self.paragraphs[currentIndex + 1];
    var previousParagraph = self.paragraphs[currentIndex - 1];

    if(!currentParagraph) return true;

    var caretPosition = currentParagraph.$el.caret();

    // Ignore the toolbar
    if(currentParagraph.$el.prop('tagName') === 'INPUT') return true;

    switch(event.which) {
      case ENTER:
        nextParagraph = self.newLine(currentParagraph);

        // If there's text to the right of the cursor, move it.

        if (caretPosition < currentParagraph.unparsed.length) {

          nextParagraph.unparsed = currentParagraph.unparsed.slice(caretPosition);

          currentParagraph.slice(0, caretPosition);

        }

        nextParagraph.focus();

        return false;
      case UP:
        if(previousParagraph) previousParagraph.focus();
        return false;
      case DOWN:
        if(nextParagraph) nextParagraph.focus();
        return false;
      case BACKSPACE:

        // Block backspace from causing an actual <- in the browser
        if ( (event.target.getAttribute('contenteditable') &&
             caretPosition === 0) || event.target.disabled || event.target.readOnly) {

          event.preventDefault();
          event.stopPropagation();

        }

        if (caretPosition === 0) {

          // If there isn't a paragraph above (ie, we're the first, gtfo/do bugger all)
          if(currentIndex === 0) return true;

          // Otherwise Remove this paragraph and copy the text to the above
          currentParagraph.$el.remove();
          self.paragraphs.splice(currentIndex, 1);

          previousParagraph.focus();

          // Make sure there's never actually nothing in the tag. Browsers *cough* Firefox *cough* don't like that shit...
          if(currentParagraph.$el.html() === '&nbsp;' &&
             previousParagraph.$el.text().length > 0) {

            event.preventDefault();
            event.stopPropagation();

            currentParagraph.$el.html('');

          } else if (previousParagraph.$el.text().length === 0) {

            currentParagraph.$el.html('&nbsp;');

          }

          var newPosition = previousParagraph.$el.text().length;

          previousParagraph.$el.text( previousParagraph.$el.text() + currentParagraph.$el.text() );

          if(previousParagraph.$el.html() !== '&nbsp;') {

            previousParagraph.$el.caret(newPosition);

          }

          event.preventDefault();
          event.stopPropagation();

        }

        return true;
      case LEFT:
        return true;
      case RIGHT:
        return true;
      default:
        return true;
    }

  });

  $(document).keyup(function onKeyUp(event) {
    var $currentParagraph = $(document.activeElement);
    var currentIndex = $currentParagraph.index();

    // Blacklist of keys to ignore
    switch(event.which) {
      case ENTER:
        return true;
      case LEFT:
        return true;
      case RIGHT:
        return true;
      case SHIFT:
        return true;
      case CONTROL:
        return true;
    }

    // Replace hacky whitespace if another non-symbol-placing key was pressed
    if ($currentParagraph.text().length === 0) $currentParagraph.html('&nbsp;');

    // Inject back from DOM
    var p = self.paragraphs[currentIndex];
    if(p && $currentParagraph.text()) p.update($currentParagraph.text());
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

  $('input[name=font-size]').change(function setFontSize() {
    self.$paragraphs.css('font-size', this.value + 'px');
  });
};

Editor.prototype.appendSelfTo = function(element) {
  $(element).append(this.$editor);
};

Editor.prototype.focus = function() {
  this.paragraphs[0].focus();
};

module.exports = Editor;
