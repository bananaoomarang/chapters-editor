'use strict';

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

Editor.prototype.appendParagraph = function() {
  var p = new Paragraph( $(NEW_PARA_HTML) );
  this.paragraphs.push(p);

  this.$paragraphs.append(p.$el);

  p.$el.focus();

  return p.$el;
};

Editor.prototype.newLine = function($el) {
  var index = $el.index() + 1;
  var p = new Paragraph( $(NEW_PARA_HTML) );

  // Insert new paragraph into internal array
  this.paragraphs.splice(index, 0, p);

  // Insert DOM representation
  p.$el.insertAfter($el);

  return p.$el;
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


    var $currentParagraph = $(document.activeElement);
    var $nextParagraph = $($currentParagraph.next());
    var $previousParagraph = $($currentParagraph.prev());
    var currentIndex = $currentParagraph.index();
    var caretPosition = $currentParagraph.caret();

    if($currentParagraph.prop('tagName') === 'INPUT') return true;

    switch(event.which) {
      case ENTER:
        $nextParagraph = self.newLine($currentParagraph);

        // If there's text to the right of the cursor, move it.
        // Otherwise just focus the new paragraph

        if (caretPosition < $currentParagraph.text().length) {

          $nextParagraph
            .text( $currentParagraph.text().slice(caretPosition) );

          $currentParagraph
            .text( $currentParagraph.text().slice(0, caretPosition) );

          $nextParagraph.focus();

        } else {

          $nextParagraph.focus();

        }

        return false;
      case UP:
        return false;
      case DOWN:
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

          // Remove this paragraph and copy the text to the above
          $currentParagraph.remove();
          self.paragraphs.splice(currentIndex, 1);

          $previousParagraph.focus();

          // Make sure there's never actually nothing in the tag. Browsers don't like that shit...
          if($currentParagraph.html() === '&nbsp;' &&
             $previousParagraph.text().length > 0) {

            $currentParagraph.html('');

          } else if($previousParagraph.text().length === 0) {

            $currentParagraph.html('&nbsp;');

          }

          var newPosition = $previousParagraph.text().length;

          $previousParagraph.text( $previousParagraph.text() + $currentParagraph.text() );

          if($previousParagraph.html() !== '&nbsp;') {

            // Move the caret on the next tick, otherwise it doesn't work

            setTimeout(function moveCaret() {
              $previousParagraph.caret(newPosition);
            });

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
        // Remove hacky whitespace on first input, will be replaced on keyup if nothing's here
        if ($currentParagraph.html() === '&nbsp;') $currentParagraph.html('');

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

    // Update if need be
    var p = self.paragraphs[currentIndex];
    if(p && $currentParagraph.text().trim()) p.update($currentParagraph.text());
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

module.exports = Editor;
