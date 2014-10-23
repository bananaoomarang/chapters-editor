'use strict';

var Editor = require('./Editor');

$(document).ready(function() {
  var editor = new Editor();

  editor.appendSelf('body');
  editor.appendParagraph();
});
