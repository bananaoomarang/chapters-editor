var EDITOR_HTML = [
  '<div id="editor">',
    '<div class="paragraphs">',
    '</div>',
  '</div>'
].join('\n');

var NEW_PARA_HTML = [
  '<p contenteditable="true">&nbsp;</p>' // Blank Space necessary hack for firefox caret alignment
].join('\n');

module.exports = function(type) {
  switch(type) {
    case 'new-paragraph':
      return NEW_PARA_HTML;
    case 'editor-base':
      return EDITOR_HTML;
    default:
      console.log('Possible requests: \'new-paragraph\', \'editor-base\'');
  }
};
