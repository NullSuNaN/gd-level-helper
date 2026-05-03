var elements = {
  checkPanelLock: box => {
    if(box.checked){
      elements.notify(`Operation cannot be done because the ${box.getAttribute('panel-name')} panel is locked.`, 'info');
      throw Error('Panel Locked.');
    }
  },
  onLockPanelToggle: box => {
    if(box.checked){
      elements.notify('The panel is locked, external operations won\'t be able to modify its content any more.', 'info');
    } else {
      elements.notify('The panel is unlocked, external operations can modify its content now.', 'info');
    }
  },
  levelPanelLock: document.getElementById('lock-lvl-op'),
  /**@type {HTMLButtonElement}*/
  encodeButton: document.getElementById('lvl-trans-encode'),
  /**@type {HTMLButtonElement}*/
  decodeButton: document.getElementById('lvl-trans-decode'),
  /**@type {HTMLTextAreaElement}*/
  encodedDataBox: document.getElementById('lvl-encoded'),
  /**@type {HTMLTextAreaElement}*/
  decodedDataBox: document.getElementById('lvl-decoded'),
  /**@type {HTMLTitleElement}*/
  levelOpTitle: document.getElementById('lvl-op-title'),
  levelOpTitles: {
    decoder: 'Level Data Decoder',
    encoder: 'Level Data Encoder',
    decoding: 'Decoding Level Data...',
    encoding: 'Encoding Level Data...'
  },
  /**@type {HTMLDivElement}*/
  notification: document.getElementById('notification'),
  /**@type {HTMLDivElement}*/
  notificationBox: document.getElementById('notification-box'),
  /**@type {HTMLDivElement}*/
  notificationLogo: document.getElementById('notification-logo'),
  /**@type {HTMLAnchorElement}*/
  notificationText: document.getElementById('notification-text'),
  notify: (text, type = 'error') => {
    const keyframes = [
      {
        opacity: 0,
        transform: 'scale(1.1) translateY(-20px)',
        offset: 0
      },
      {
        opacity: 1,
        transform: 'scale(1) translateY(0)',
        offset: 0.05
      },
      {
        opacity: 1,
        transform: 'scale(1) translateY(0)',
        offset: 0.95
      },
      {
        opacity: 0,
        transform: 'scale(1.1) translateY(-20px)',
        offset: 1
      }
    ];
    const options = {
      duration: 3000, // 3 seconds
      easing: 'ease-in-out',
      fill: 'forwards' // Keeps the state of the last keyframe if not looping
    };
    elements.notificationLogo.setAttribute('notification-type', type);
    elements.notificationBox.getAnimations().forEach(anim => anim.cancel());
    elements.notificationText.text = text;
    elements.notification.style.display = 'block';
    elements.notificationBox.animate(keyframes, options).addEventListener('finish', e => {
      elements.notification.style.display = 'none';
    });
  },
  parse: {
    variableName: document.getElementById('lvl-var'),
    saveAsObjectButton: document.getElementById('lvl-save-obj'),
    saveDecodedButton: document.getElementById('lvl-save-decoded'),
    writeButton: document.getElementById('lvl-write'),
    saveEncodedButton: document.getElementById('lvl-save-encoded')
  },
  runFunction: {
    functionContent: document.getElementById('lvl-fn'),
    executeWithEncodedButton: document.getElementById('lvl-execute-encoded'),
    executeWithObjectButton: document.getElementById('lvl-execute-object'),
    executeWithDecodedButton: document.getElementById('lvl-execute-decoded')
  },
  descriptionDemoPanelLock: document.getElementById('lock-desc'),
  descriptionDemo: document.getElementById('desc-demo'),
  descriptionDemoLength: document.getElementById('desc-demo-length'),
  descriptionDemoConvertButton: document.getElementById('desc-demo-convert-to-k3'),
  descriptionDemoConvertBackButton: document.getElementById('desc-demo-convert-to-raw'),
  descriptionDemoResult: document.getElementById('desc-demo-result'),
  descriptionDemoTest: document.getElementById('desc-demo-warning-test'),
  gmd: {
    panelLock: document.getElementById('lock-gmd'),
    data: document.getElementById('gmd'),
    title: document.getElementById('gmd-title'),
    titles: {
      extractor: 'GMD File Extractor',
      editor: 'GMD File Editor',
      dropping: 'Dropping GMD File...'
    },
    extractDataButton: document.getElementById('gmd-extract-level'),
    saveDataFromEncodedButton: document.getElementById('gmd-save-level-encoded'),
    saveDataFromDecodedButton: document.getElementById('gmd-save-level-decoded'),
    extractDescriptionButton: document.getElementById('gmd-extract-desc'),
    saveDescriptionButton: document.getElementById('gmd-save-level-desc'),
    functionContent: document.getElementById('gmd-fn'),
    executeWithRawButton: document.getElementById('gmd-execute-raw'),
    handleFile: async file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Success handler
        reader.onload = (e) => {
          resolve(e.target.result);
        };

        // Error handler
        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsText(file);
      });
    },
    fileName: document.getElementById('gmd-file-name'),
    downloadButton: document.getElementById('gmd-download'),
    selectFileButton: document.getElementById('gmd-select'),
    selectFileHelper: document.getElementById('gmd-select-helper'),
    filterSelectFileBox: document.getElementById('gmd-select-filter')
  },
  /**@type {HTMLSpanElement}*/
  titleLevelText: document.getElementById('title-level')
}

document.addEventListener('selectionchange', e => {
  const selection = window.getSelection();

  // If the selection text is empty, the user has deselected the text
  if (elements.titleLevelText.contains(selection.focusNode)) {
    elements.titleLevelText.textContent = 'Blast';
  } else {
    elements.titleLevelText.textContent = 'Level';
  }
});

elements.decodeButton.addEventListener('click', e => {
  elements.levelOpTitle.textContent = elements.levelOpTitles.decoding;
  GDParser.decodeGDLevel(elements.encodedDataBox.value).then(data => {
    elements.decodedDataBox.value = data;
  }).catch(e => {
    elements.notify(e.stack);
    elements.levelOpTitle.textContent = elements.levelOpTitles.decoder;
  }).finally(() => {
    elements.levelOpTitle.textContent = elements.levelOpTitles.decoder;
  });
});
elements.encodeButton.addEventListener('click', e => {
  elements.levelOpTitle.textContent = elements.levelOpTitles.encoding;
  GDParser.encodeGDLevel(elements.decodedDataBox.value).then(data => {
    elements.encodedDataBox.value = data;
    elements.levelOpTitle.textContent = elements.levelOpTitles.encoder;
  }).catch(e => {
    elements.notify(e.stack);
    elements.levelOpTitle.textContent = elements.levelOpTitles.encoder;
  }).finally(() => {
    elements.levelOpTitle.textContent = elements.levelOpTitles.encoder;
  });
});
const setVariable = (a, data,
    onSuccess=a=>elements.notify(`Variable ${a} is Set Successfully.`, 'success'),
    onError=e=>elements.notify(e.stack)
  ) => {
  try {
    eval(`window.${a}=data;`)
    onSuccess(a);
  } catch (e) {
    onError(e);
    throw e;
  };
}
const runFunction = (a, data) => {
  try {
    eval(`let fn=${a};fn(data);`)
    elements.notify('Execution Succeed.', 'success');
  } catch (e) {
    elements.notify(e.stack);
    throw e;
  };
}
elements.parse.saveDecodedButton.addEventListener('click', e => {
  setVariable(elements.parse.variableName.value, elements.decodedDataBox.value);
});
elements.parse.saveEncodedButton.addEventListener('click', e => {
  setVariable(elements.parse.variableName.value, elements.encodedDataBox.value);
});
elements.parse.saveAsObjectButton.addEventListener('click', e => {
  try {
    setVariable(elements.parse.variableName.value, GDParser.parseLevel(elements.decodedDataBox.value),
      a=>elements.notify(`Variable ${a} is Set Successfully.Note that the gdparse library still cannot process Stereo Madness properly, so good luck.`, 'info'));
  } catch (e) {
    elements.notify(e.stack);
    throw e;
  };
});
elements.parse.writeButton.addEventListener('click', () => {
  let data = null;
  eval(`data = window.${elements.parse.variableName.value};`)
  if (typeof (data) == "object") {
    data = GDParser.serializeLevel(data);
  }
  elements.decodedDataBox.value = data;
});
elements.runFunction.executeWithDecodedButton.addEventListener('click', e => {
  runFunction(elements.runFunction.functionContent.value, elements.decodedDataBox.value);
});
elements.runFunction.executeWithEncodedButton.addEventListener('click', e => {
  runFunction(elements.runFunction.functionContent.value, elements.encodedDataBox.value);
});
elements.runFunction.executeWithObjectButton.addEventListener('click', e => {
  try {
    runFunction(elements.runFunction.functionContent.value, GDParser.parseLevel(elements.decodedDataBox.value));
  } catch (e) {
    elements.notify(e.stack);
    throw e;
  };
});
elements.descriptionDemo.addEventListener('input', e => {
  if (e.target.value.length != 0){
    elements.descriptionDemoLength.text = `${e.target.value.length}`;
  } else
    elements.descriptionDemoLength.text = '';
});
elements.descriptionDemoConvertButton.addEventListener('click', e => {
  try {
    elements.descriptionDemoResult.value = GDParser.encodeSafeBase64(elements.descriptionDemo.value);
  } catch (e) {
    elements.notify(e.stack);
  };
  elements.descriptionDemoResult.dispatchEvent(new Event('input', { bubbles: true }));
});
elements.descriptionDemoConvertBackButton.addEventListener('click', e => {
  try {
    if (elements.descriptionDemoResult.value == '') {
      elements.descriptionDemoResult.value = 'Input Data...';
      elements.descriptionDemoResult.dispatchEvent(new Event('input', { bubbles: true }));
      elements.descriptionDemoResult.select();
      elements.notify('Encoded data box opened, paste your data and convert again.', 'info');
      return;
    }
    elements.descriptionDemo.value = GDParser.decodeSafeBase64(elements.descriptionDemoResult.value);
  } catch (e) {
    elements.notify(e.stack);
  };
});
elements.descriptionDemoResult.addEventListener('input', e => {
  if (e.target.value.length > 0) {
    e.target.style.display = 'block'
  } else {
    e.target.style.display = 'none';
  }
});
/**
 * Extracts Description (k3) and Data (k4) from a GMD Plist string.
 */
function extractGmdData(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const dict = xmlDoc.getElementsByTagName("dict")[0];
  const children = dict.children;

  let result = { description: "", data: "" };

  for (let i = 0; i < children.length; i++) {
    if (children[i].tagName === "k") {
      const key = children[i].textContent;
      const valueNode = children[i].nextElementSibling;

      if (key === "k3") result.description = valueNode.textContent;
      if (key === "k4") result.data = valueNode.textContent;
    }
  }
  return result;
}

/**
 * Saves new Description/Data back into the GMD Plist string.
 */
function updateGmdData(xmlString, newDesc, newData) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const keys = xmlDoc.getElementsByTagName("k");

  for (let k of keys) {
    if (newDesc != null && k.textContent === "k3") k.nextElementSibling.textContent = newDesc;
    if (newData != null && k.textContent === "k4") k.nextElementSibling.textContent = newData;
  }

  return new XMLSerializer().serializeToString(xmlDoc);
}
elements.gmd.extractDataButton.addEventListener('click', async e => {
  elements.checkPanelLock(elements.levelPanelLock);
  let stage = 0;
  try {
    elements.gmd.title.textContent = elements.gmd.titles.extractor;
    let { description, data } = extractGmdData(elements.gmd.data.value);
    elements.encodedDataBox.value = data;
    stage = 1;
    elements.decodedDataBox.value = await GDParser.decodeGDLevel(data);
    stage = 2;
  } catch (e) {
    switch (stage) {
      case 0:
        elements.notify(e.stack);
      case 1:
        elements.notify(`Extracted to Encoded Box, Error Decoding:\n${e.stack}`, 'info');
    }
    throw e;
  }
  elements.notify('Extracted to Encoded and Decoded Box.', 'success');
})
elements.gmd.saveDataFromDecodedButton.addEventListener('click', async e => {
  try {
    elements.gmd.title.textContent = elements.gmd.titles.editor;
    elements.gmd.data.value = updateGmdData(elements.gmd.data.value, null,
      await GDParser.encodeGDLevel(elements.decodedDataBox.value));
  } catch (e) {
    elements.notify(e.stack);
    throw e;
  } finally {
    elements.notify('Saved to GMD.', 'success');
  }
});
elements.gmd.saveDataFromEncodedButton.addEventListener('click', e => {
  try {
    elements.gmd.title.textContent = elements.gmd.titles.editor;
    elements.gmd.data.value = updateGmdData(elements.gmd.data.value, null,
      elements.encodedDataBox.value);
  } catch (e) {
    elements.notify(e.stack);
    throw e;
  } finally {
    elements.notify('Saved to GMD.', 'success');
  }
});

elements.gmd.extractDescriptionButton.addEventListener('click', async e => {
  elements.checkPanelLock(elements.descriptionDemoPanelLock);
  try {
    elements.gmd.title.textContent = elements.gmd.titles.extractor;
    let { description, data } = extractGmdData(elements.gmd.data.value);
    elements.descriptionDemo.value = GDParser.decodeSafeBase64(description);
  } catch (e) {
    elements.notify(e.stack);
    throw e;
  }
  elements.notify('Extracted to Demo Box.', 'success');
})
elements.gmd.saveDescriptionButton.addEventListener('click', async e => {
  try {
    elements.gmd.title.textContent = elements.gmd.titles.editor;
    elements.gmd.data.value = updateGmdData(elements.gmd.data.value,
      GDParser.encodeSafeBase64(elements.descriptionDemo.value)
      , null);
  } catch (e) {
    elements.notify(e.stack);
    throw e;
  } finally {
    elements.notify('Saved to GMD.', 'success');
  }
});

elements.gmd.executeWithRawButton.addEventListener('click', e => {
  runFunction(elements.gmd.functionContent.value, elements.gmd.data.value);
});

// 1. Prevent default behavior to allow a drop
elements.gmd.data.addEventListener('dragover', e => {
  e.preventDefault();
  e.target.classList.add('drag-active'); // Optional: Add a highlight effect
});

elements.gmd.data.addEventListener('dragleave', () => {
  e.target.classList.remove('drag-active');
});

// 2. Handle the drop event
elements.gmd.data.addEventListener('drop', async e => {
  e.preventDefault();
  e.target.classList.remove('drag-active');

  const files = e.dataTransfer.files;

  if (files.length > 0) {
    let originalTitle = elements.gmd.title.textContent;
    elements.gmd.title.textContent = elements.gmd.titles.dropping;
    try {
      elements.gmd.data.value = await elements.gmd.handleFile(files[0]);
      elements.gmd.fileName.value = files[0].name;
    } catch (e) {
      elements.notify(e.stack);
      throw e;
    } finally {
      elements.notify('Dropped the file.', 'success');
    }
    elements.gmd.title.textContent = originalTitle;
  } else {
    elements.notify('Please drop a file.', 'info');
  }
});
document.addEventListener('DOMContentLoaded', e => {
  const names = ['My Fancy Level', 'Masterpiece', 'Unnamed', 'GTA6', 'Wave Challenge', 'Mulpan Challenge', 'Demon', 'My First Level', 'Lobotomy', 'I Hate This Level', 'Deadlocked StartPos', 'Shitty Aperture'];
  elements.gmd.fileName.value = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor((Math.random() * 89999) + 10000)}.gmd`
})
elements.gmd.downloadButton.addEventListener('click', e => {
  // Create a blob from the text
  const blob = new Blob([elements.gmd.data.value], { type: 'text/plain' });

  // Create a link element
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = elements.gmd.fileName.value; // Set the filename

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
elements.gmd.panelLock.addEventListener('change', e=>{
  elements.onLockPanelToggle(e.target);
})
elements.levelPanelLock.addEventListener('change', e=>{
  elements.onLockPanelToggle(e.target);
})
elements.descriptionDemoPanelLock.addEventListener('change', e=>{
  elements.onLockPanelToggle(e.target);
})
elements.gmd.selectFileButton.addEventListener('click', e => {
  if(elements.gmd.filterSelectFileBox.checked){
    elements.gmd.selectFileHelper.setAttribute('accept', '.gmd');
  } else {
    elements.gmd.selectFileHelper.removeAttribute('accept');
  }
  elements.gmd.selectFileHelper.click();
});
elements.gmd.selectFileHelper.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if (file) {
    try{
      elements.gmd.data.value=await file.text();
      elements.gmd.fileName.value=file.name;
    } catch(e) {
      elements.notify('Failed to read the file.');
    }
  } else {
    elements.notify('Failed to read the file.');
  }
})
elements.descriptionDemoTest.addEventListener('click', e=>{
  if(elements.descriptionDemo.value !== ''){
    elements.notify('This will override the demo box, please delete the existing text in it.', 'info');
  } else {
    elements.descriptionDemo.value=
      ' ________             _____  \n|              |  / \\/ \\  /   .  .  \\\n |     [  ]     |  \\    /  |    \\_/   |\n|________|    \\/     \\_____/';
  }
})