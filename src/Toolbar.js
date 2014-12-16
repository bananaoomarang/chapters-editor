'use strict';

var HTML = [
  '<div id="toolbar">',
    '<button class="btn" name="left">Left</button>',
    '<button class="btn" name="center">Center</button>',
    '<button class="btn" name="right">Right</button>',
  '</div>'
].join('\n');

function Toolbar(element) {
  //Append self to element
  if(element) element.append($(HTML));
}

Toolbar.prototype.getHTML = function() {
  return HTML;
};

module.exports = Toolbar;
