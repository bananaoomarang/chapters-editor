'use strict';

var marked = require('marked');

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

Editor.prototype.bindKeys = function() {
  var self = this;

  $(document).keypress(function (event) {
    var nextParagraph;

    switch(event.which) {
      case 13:
        nextParagraph = $(self.currentParagraph).next();

        if(nextParagraph.length) {
          console.log(nextParagraph);
          nextParagraph.focus();
        } else { 
          self.appendParagraph()
            .focus();
        }

        // Stop event bubbling
        return false;
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
