'use strict';

var marked = require('marked');

function moveCarat(el, pos) {
  var range = document.createRange();
  var selection = window.getSelection();

  console.log(el);

  range.setStart(el.childNodes[0], pos);

  selection.removeAllRanges();
  selection.addRange(range);
}


function Editor() {
  this.id = 'editor';
  this.html = '<div id=' + this.id + '></div>';
  this.currentParagraph = null;

  this.bindKeys();
}

Editor.prototype.markify = function(element) {
  var $element = $(element);

  $element.data('unmarked', $element.html());
  $element.html(marked($element.html()));
};

Editor.prototype.demarkify = function(element) {
  var $this = $(element);

  $this.html($this.data('unmarked'));
};

Editor.prototype.appendParagraph = function() {
  var el = $('<p contenteditable=true></p>');

  this.bindParagraph(el);

  $('#' + this.id).append(el);
  
  return el;
};

Editor.prototype.getCaratPos = function() {
  //TODO
};

Editor.prototype.bindKeys = function() {
  var self = this;

  $(document).keydown(function (event) {
    var $currentParagraph = $(self.currentParagraph);
    var nextParagraph;
    var previousParagraph;

    switch(event.which) {
      case 13:
        // move to/create next paragraph on enter
        nextParagraph = $currentParagraph.next();

        if(nextParagraph.length) nextParagraph.focus();
        else self.appendParagraph().focus();
        

        // Stop event bubbling
        return false;
      case 8:
        // Edit previous paragraph when backspace pressed on empty one
        if($currentParagraph.html().length === 0) {
          previousParagraph = $(self.currentParagraph).prev();

          if(previousParagraph.length) {
            previousParagraph.focus();

            moveCarat(previousParagraph.get(0), previousParagraph.html().length);
          }

          return false;
        }
    }
  });

};

Editor.prototype.bindParagraph = function(element) {
  var self = this;

  element
  .blur(function () {
    self.markify(this);
  })
  .focus(function () {
    self.currentParagraph = this;
    self.demarkify(this);
  });
};

Editor.prototype.appendSelf = function(element) {
  $(element).append(this.html);
};

module.exports = Editor;
