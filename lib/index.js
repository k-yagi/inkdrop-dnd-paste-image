'use babel';

import { nativeImage } from 'electron';

module.exports = {
  activate() {
    if (inkdrop.isEditorActive()) {
      this.handleEvent.bind(this)(inkdrop.getActiveEditor());
    } else {
      global.inkdrop.onEditorLoad(this.handleEvent.bind(this));
    }
  },

  deactivate() {
    inkdrop.getActiveEditor().cm.off('drop', this.functionOnDrop);
  },

  handleEvent(editor) {
    const cm = editor.cm;
    this.functionOnDrop = this.insertImage.bind(this);
    cm.on('drop', this.functionOnDrop);
  },

  insertImage(cm, e) {
    const imageURL = e.dataTransfer.getData('url');

    this.fetchImage(imageURL, function (imageArrayBuffer) {
      const imageBuffer = Buffer.from(imageArrayBuffer);
      const imageNativeImage = nativeImage.createFromBuffer(imageBuffer);

      const cursorPosition = cm.getCursor();
      inkdrop.commands.dispatch(document.body, 'editor:insert-images', {
        pos: {
          line: cursorPosition.line,
          ch: cursorPosition.ch,
        },
        files: [imageNativeImage]
      });
    });
  },

  fetchImage(url, callback) {
    const xhr = new XMLHttpRequest;
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        callback(this.response);
      }
    };
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', url);
    xhr.send();
  }
};