class ColorSet extends Set {
  constructor(selector, createAsChild = false) {
    super(new Set());
    if (createAsChild) {
      const queriedNode = document.querySelector(selector);
      this.container = document.createElement('div');
      queriedNode.appendChild(this.container);
    } else {
      this.container = document.querySelector(selector);
    }
    if (this.container && !this.container?.classList.contains('color-set')) this.container.classList.add('color-set');
  }
  add(...colors) {
    const { container } = this;
    colors = colors.flat().filter((e,i,a) => a.indexOf(e) === i);
    for (let color of colors) {
      if (color.length !== 9 || color.slice(-2) !== '00') {
        if (this.has(color)) {
          container.prepend(container.querySelector(`.color-set--color-\\${color}`));
        } else {
          Set.prototype.add.call(this, color);
          container.insertAdjacentHTML('afterbegin', `<div class="color-set--color color-set--color-${color}" style="--color-val: ${color}"></div>`);
        }
      }
    }
    container.scrollTo({ left: 0, behavior: 'smooth' });
  }
  delete(...colors) {
    const { container } = this;
    colors = colors.flat().filter((e,i,a) => a.indexOf(e) === i);
    for (let color of colors) {
      if (this.has(color)) {
        Set.prototype.delete.call(this, color);
        container.querySelector(`.color-set--color-\\${color}`).remove();
      }
    }
  }
  reset() {
    const { container } = this;
    this.clear();
    container.innerHTML = '';
  }
}
class Multiversion extends Array {
  constructor(containerNode, currentBranchNode) {
    super();
    this.branchesContainer = typeof containerNode === 'string' ? document.querySelector(containerNode) : containerNode;
    this.currentBranchElement = typeof currentBranchNode === 'string' ? document.querySelector(currentBranchNode) : currentBranchNode;
    this.branches = [];
    this.statesBwd = [];
    this.statesFwd = [];
  }
  createBranch(timeline = getCompleteHistory(), container = this.branchesContainer) {
    if (timeline.length > 1) {
      const that = this;
      const branchElement = document.createElement('div');
      const branchLabelElement = document.createElement('div');
      const branchLabelChangesElement = document.createElement('span');
      const branchLabelTimestampElement = document.createElement('span');
      const statesElement = document.createElement('div');
      branchElement.classList.add('console-draw-history-branches--branch');
      branchLabelElement.classList.add('console-draw-history-branches--branch--label');
      branchLabelChangesElement.classList.add('console-draw-history-branches--branch--label--changes');
      branchLabelChangesElement.textContent = timeline.length + ' changes';
      branchLabelElement.appendChild(branchLabelChangesElement);
      branchLabelTimestampElement.classList.add('console-draw-history-branches--branch--label--timestamp');
      branchLabelTimestampElement.textContent = new Intl.DateTimeFormat('default', { hour12: true, hour: 'numeric', minute: 'numeric' }).format(new Date()).toLowerCase().replace(' ', '');
      if (container !== this.currentBranchElement) branchLabelElement.appendChild(branchLabelTimestampElement);
      branchElement.appendChild(branchLabelElement);
      statesElement.classList.add('console-draw-history-branches--branch--states');
      branchElement.appendChild(statesElement);
      let stateIndex = 0;
      for (let state of timeline) {
        const width = state[0].length;
        const height = state.length;
        const image = pixels2Base64(state);
        const stateElement = document.createElement('button');
        stateElement.classList.add('console-draw-history-branches--branch--states--state');
        stateElement.dataset.stateIndex = stateIndex;
        stateElement.style.setProperty('--preview-width', width);
        stateElement.style.setProperty('--preview-height', height);
        stateElement.style.setProperty('--preview-image', `url(${image})`);
        stateElement.style.backgroundImage = 'var(--preview-image)';
        branchElement.branchData = timeline;
        branchElement.branchDataIndex = stateIndex;
        stateElement.onclick = function() {
          const history = getCompleteHistory();
          if (history.length > 1) {
            if (arraysEqual(history[0], history[1])) history.splice(0, 1);
            if (history.length > 1) that.createBranch(history, container);
          }
          branchElement.remove();
          that.branches.splice(that.branches.indexOf(timeline), 1);
          // populateFromImport(timeline, false, false);
          populateFromImport(timeline[stateElement.dataset.stateIndex], false, false);
          that.statesBwd.length = 0;
          that.statesFwd.length = 0;
          that.statesBwd.push(...timeline.slice(0, Number(stateElement.dataset.stateIndex)));
          that.statesFwd.push(...timeline.slice(Number(stateElement.dataset.stateIndex) + 1).reverse());
          historyBranchesInput.checked = false;
          historyBranchesInput.focus();
          // console.log({
          //   past: timeline.slice(0, Number(stateElement.dataset.stateIndex)),
          //   present: timeline[stateElement.dataset.stateIndex],
          //   future: timeline.slice(Number(stateElement.dataset.stateIndex) + 1).reverse()
          // });
        };
        // statesElement.appendChild(stateElement);
        statesElement.insertBefore(stateElement, statesElement.children[0]);
        stateIndex++;
      }
      // element.addEventListener('click', () => {
      //   Array.from(element.children()).reverse()[0].select();
      // });
      // container.appendChild(branchElement);
      container.insertBefore(branchElement, container.children[0]);
      if (container !== this.currentBranchElement) {
        this.branches.push(timeline);
        refreshCurrent();
        this.branchesContainer.dataset.branchCount++;
      } else {
        const currentStatesWrapper = this.currentBranchElement.querySelector('.console-draw-history-branches--branch--states');
        const currentStates = currentStatesWrapper?.children;
        const currentState = currentStates?.[currentStates.length - 1 - this.statesBwd.length];
        if (currentState) {
          currentState.classList.add('active');
          currentStatesWrapper.scrollTo(currentState.offsetLeft - (currentStatesWrapper.offsetWidth / 2 - (currentState.offsetWidth / 2)), 0);
          historyBranchesInner.scrollTo(0, 0);
          setTimeout(() => {
            currentStatesWrapper.scrollTo(currentState.offsetLeft - (currentStatesWrapper.offsetWidth / 2 - (currentState.offsetWidth / 2)), 0);
            historyBranchesInner.scrollTo(0, 0);
          }, 1);
        }
      }
    }
  }
  refreshCurrent() {
    this.currentBranchElement.innerHTML = '';
    this.createBranch(getCompleteHistory(), this.currentBranchElement);
  }
  reset() {
    this.branches.forEach(branch => branch.element.remove());
    this.branches.length = 0;
    this.branchesContainer.dataset.branchCount = 0;
  }
}
const consoleDraw = (matrix, darkModeInvert = false) => console.log('\n' + matrix.map(row => '%c  '.repeat(row.length)).join('\n') + '\n', ...matrix.flat().map(darkModeInvert && window.matchMedia('(prefers-color-scheme: dark)').matches ? color => 'background-color:' + invertColor(color) : color => 'background-color:' + color));
const app = document.getElementById('console-draw-app');
const darkModeActive = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const chunkArray = (values, size) => {
  let result = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
};
const lastOf = arr => arr[arr.length - 1];
const someNotEvery = (fn, ...data) => data.some(fn) && !data.every(fn);
const noneOrEvery = (fn, ...data) => !data.some(fn) || data.every(fn);
const allObjects = (...objects) => objects.every(obj => obj && obj.toString() === '[object Object]');
const allArrays = (...arrays) => arrays.every(arr => arr && Array.isArray(arr));
const objectsEqual = (o1, o2) => Object.keys(o1).length === Object.keys(o2).length && Object.keys(o1).every(e => o2.hasOwnProperty(e) && o1[e]?.toString() === o2[e]?.toString() && noneOrEvery(Array.isArray, o1[e], o2[e]) && noneOrEvery(e => e?.toString() === '[object Object]', o1[e], o2[e]) && (Array.isArray(o1[e]) ? arraysEqual(o1[e], o2[e]) : (o1[e]?.toString() === '[object Object]' ? objectsEqual(o1[e], o2[e]) : o1[e] === o2[e])));
const arraysEqual = (a1, a2) => a1.length === a2.length && a1.every((_,i) => a1[i]?.toString() === a2[i]?.toString() && noneOrEvery(Array.isArray, a1[i], a2[i]) && noneOrEvery(e => e?.toString() === '[object Object]', a1[i], a2[i]) && (Array.isArray(a1[i]) ? arraysEqual(a1[i], a2[i]) : (a1[i]?.toString() === '[object Object]' ? objectsEqual(a1[i], a2[i]) : a1[i] === a2[i])));
const filterUnique = array => array.filter((e,i,a) => a.indexOf(e) === i);
const sortByHue = colors => colors.sort((a,b) => hex2hsl(a).h - hex2hsl(b).h);
const sortBySat = colors => colors.sort((a,b) => hex2hsl(a).s - hex2hsl(b).s);
const sortByLum = colors => colors.sort((a,b) => hex2hsl(a).l - hex2hsl(b).l);
const sortByHSL = colors => {
  const getHSLNumeric = hex => {
    const hsl = hex2hsl(hex);
    return hsl.h + (hsl.s / 100) + (10000 - hsl.l / 10000);
  }
  return colors.sort((a,b) => getHSLNumeric(a) - getHSLNumeric(b));
};
const pixelRows = Array.from(app.querySelectorAll('.console-draw-pixel-row'));
const pixels = Array.from(app.querySelectorAll('.console-draw-pixel'));
const getPixels = () => pixels.map(pixel => getPixelColor(pixel));
const getElementIndex = node => Array.from(node.parentNode.children).indexOf(node);
const getPixelRow = pixel => getElementIndex(pixel.parentNode);
const getPixelCol = pixel => getElementIndex(pixel);
const getPixelPos = pixel => [getPixelCol(pixel), getPixelRow(pixel)];
const clamp = (min, number, max) => Math.min(Math.max(number, min), max);
const getChunkedPixels = () => chunkArray(pixels, getWidth());
const getChunkedPixelColors = () => getChunkedPixels().map(row => row.map(pixel => getPixelColor(pixel)));
const escapeJSON = json => escape(JSON.stringify(json));
const unescapeJSON = json => JSON.parse(unescape(json));
const invertDarkModeInput = app.querySelector('#console-draw-setting-invert-dark');
const invertDarkModeButton = app.querySelector('label[for="console-draw-setting-invert-dark"]');
const downloadDrawingButton = app.querySelector('#console-draw-download');
const submitDrawingInput = app.querySelector('#console-draw-submit');
const submitDrawingButton = app.querySelector('label[for="console-draw-submit"]');
const submitDrawingWrapper = app.querySelector('#console-draw-submit-form-wrapper');
const submitDrawingInner = app.querySelector('#console-draw-submit-form-inner');
const submitDrawingForm = app.querySelector('#console-draw-submit-form');
const submitDrawingPreview = app.querySelector('#console-draw-submit-preview');
const submitDrawingImageInput = app.querySelector('#console-draw-submit-image');
const submitDrawingPixelsInput = app.querySelector('#console-draw-submit-colors');
const submitDrawingNameInput = app.querySelector('#console-draw-submit-drawing-name');
const submitDrawingAuthorInput = app.querySelector('#console-draw-submit-author-name');
const submitDrawingSocialsWebsiteInput = app.querySelector('#console-draw-submit-socials-website');
const submitDrawingSocialsCodepenInput = app.querySelector('#console-draw-submit-socials-codepen');
const submitDrawingSocialsGithubInput = app.querySelector('#console-draw-submit-socials-github');
const submitDrawingSocialsStackoverflowInput = app.querySelector('#console-draw-submit-socials-stackoverflow');
const submitDrawingSocialsLinkedinInput = app.querySelector('#console-draw-submit-socials-linkedin');
const submitDrawingSocialsTwitterInput = app.querySelector('#console-draw-submit-socials-twitter');
const getSubmitDrawingFormData = () => Array.from(submitDrawingForm.querySelectorAll('input, select, textarea')).reduce((obj, field) => (obj[field.name.replace('console-draw-submit-', '')] = field.value.startsWith('%7B%22') || field.value.startsWith('%5B%5B%22%23') ? unescapeJSON(field.value) : field.value, obj), {});
const sampleLibrary = app.querySelector('#console-draw-import-samples');
const pixels2Base64 = (colors = getChunkedPixelColors()) => {
  const canvas = document.createElement('canvas');
  canvas.width = getWidth();
  canvas.height = getHeight();
  const context = canvas.getContext('2d');
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors[i].length; j++) {
      context.fillStyle = colors[i][j];
      context.fillRect(j, i, 1, 1);
    }
  }
  const dataURL = canvas.toDataURL('image/png', 1);
  canvas.remove();
  return dataURL;
};
const refreshBase64 = () => {
  const base64 = pixels2Base64();
  app.style.setProperty('--console-draw-drawing-base64', `${base64}`);
  app.style.setProperty('--console-draw-drawing-base64-url', unescape(`url(${base64})`));
  submitDrawingPreview.src = `${base64}`;
  submitDrawingImageInput.value = `${base64}`;
  return base64;
};
const getTool = () => app.dataset.tool;
const getToolInput = (tool = getTool()) => app.querySelector('#console-draw-tool-' + tool);
const setTool = tool => {
  app.dataset.tool = tool;
  app.style.setProperty('--console-draw-cursor', 'var(--console-draw-cursor-' + tool + ')');
  app.querySelector('[name="console-draw-tool"]#console-draw-tool-' + tool).checked = true;
  // is something missing here…?
};
const refreshTool = () => { if (!['draw','fill'].includes(getTool())) setTool('draw') };
const executeButton = app.querySelector('#console-draw-execute');
const normalizeString = string => string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const removeSpecialCharacters = str => str.replace(/[^0-9a-z_-\s]/gi, '');
const splitStringParts = str => str.split(/[\s_-]+/).filter(Boolean);
const getCleanedStringParts = str => splitStringParts(removeSpecialCharacters(normalizeString(str)));
const makeCamelCase = str => (str = getCleanedStringParts(str), str.map((str, i) => i ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str.toLowerCase()).join(''));
const hyphenate = str => (str = getCleanedStringParts(str), str.join('-')).toLowerCase();
const artboard = app.querySelector('#console-draw-pixels');
const rgba2hexa = rgba => '#' + rgba.map(x => ('0' + x.toString(16)).slice(-2)).join('');
const hex2rgb = hex => {
  const parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return parts ? parts.slice(1,4).map(c => parseInt(c, 16)).join(',') : null;
};
const hex2hsl = hex => {
  hex = hex.split('#').reverse()[0].slice(0,6);
  const parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(parts[1], 16) / 255;
  const g = parseInt(parts[2], 16) / 255;
  const b = parseInt(parts[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  let l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return { h, s, l };
};
const percentToHex = percent => Math.round((percent / 100 * 255)).toString(16);
const invertColor = color => {
  const opacity = color.length === 9 ? color.slice(-2) : 'FF';
  color = color.slice(0,7);
  const colorA = '#' + (('000000' + (0xFFFFFF ^ parseInt(color.substring(1), 16)).toString(16)).slice(-6) + opacity).toLowerCase();
  return colorA;
};
const offsetToAngle = (x, y) => {
  const angle = (Math.atan2(x, y) / Math.PI * 180) % 360;
  return angle < 0 ? 360 + angle : angle;
};
const setCursorColor = (color = getSelectedColorFull()) => app.style.setProperty('--console-draw-cursor-draw', `url('https://dreamthinkbuild.com/console-draw/cursor.php?color=${encodeURIComponent(color)}') 0 24, pointer`);
const getColorFromVar = str => str.replace(/\"/g, '').trim();
const getSelectedColor = () => colorInput.value;
const getSelectedOpacity = () => opacityInput.value;
const getSelectedColorFull = () => getColorFromVar(app.style.getPropertyValue('--console-draw-setting-color'));
const setSelectedColor = (color = getSelectedColor(), opacity = getSelectedOpacity()) => {
  const rrggbbaa = color.length === 9 ? color : color + ('00' + percentToHex(opacity)).slice(-2);
  const rrggbb = rrggbbaa.slice(0,-2);
  opacity = Math.floor(parseInt(rrggbbaa.slice(-2), 16) / 255 * 100);
  if (!document.activeElement || document.activeElement !== colorTextInput) colorTextInput.value = rrggbbaa.slice(1,-2);
  if (!document.activeElement || document.activeElement !== colorInput) colorInput.value = rrggbbaa.slice(0,-2);
  opacityInput.value = opacity;
  opacityTextInput.value = opacity;
  opacityTextInput.closest('.console-draw-setting').style.setProperty('--value-char-length', opacity.toString().length);
  app.style.setProperty('--console-draw-setting-color', rrggbbaa);
  app.style.setProperty('--console-draw-setting-color--color', rrggbb);
  setCursorColor(rrggbbaa);
  saveColorButton.classList[savedColors.has(rrggbbaa) ? 'add' : 'remove']('color-saved');
  refreshTool();
};
const getPixelColor = pixel => getColorFromVar(pixel.style.getPropertyValue('--color-val')) || '#00000000';
const setPixelColor = (pixel, color = '#00000000') => {
  pixel.style.setProperty('--color-val', color);
  warnedAboutReset = false;
};
const clearPixelColor = pixel => setPixelColor(pixel);
const colorTextInput = app.querySelector('#console-draw-setting-color-text');
const colorInput = app.querySelector('#console-draw-setting-color');
const opacityTextInput = app.querySelector('#console-draw-setting-opacity-text');
const opacityInput = app.querySelector('#console-draw-setting-opacity');
const drawingNameInput = app.querySelector('#console-draw-drawing-name');
const getDrawingName = () => drawingNameInput.value.trim() || drawingNameInput.placeholder.trim();
const setDrawingName = name => {
  drawingNameInput.value = name.trim();
  submitDrawingNameInput.value = name.trim();
  refreshValues();
};
const getDrawingNameCamelCase = () => makeCamelCase(getDrawingName());
const getDrawingNameHyphenated = () => hyphenate(getDrawingName());
const widthInput = app.querySelector('#console-draw-setting-width');
const getWidth = () => Math.max(Math.min(+widthInput.value, getMaxWidth()), getMinWidth());
const getMinWidth = () => +widthInput.min;
const getMaxWidth = () => +widthInput.max;
const setWidth = width => {
  width = Math.max(Math.min(+width, getMaxWidth()), getMinWidth());
  widthInput.value = width;
  app.style.setProperty('--console-draw-setting-width', width);
  // refreshAspectRatioCSSVariable();
};
const heightInput = app.querySelector('#console-draw-setting-height');
const getHeight = () => Math.max(Math.min(+heightInput.value, getMaxHeight()), getMinHeight());
const getMinHeight = () => +heightInput.min;
const getMaxHeight = () => +heightInput.max;
const setHeight = height => {
  height = Math.max(Math.min(+height, getMaxHeight()), getMinHeight());
  heightInput.value = +height;
  app.style.setProperty('--console-draw-setting-height', height);
  // refreshAspectRatioCSSVariable();
};
const refreshAspectRatioCSSVariable = (width = getWidth(), height = getHeight()) => {
  app.style.setProperty('--console-draw-drawing-aspect-ratio', width / height);
};
const recentColors = new ColorSet('#console-draw-recent-colors', true);
const savedColors = new ColorSet('#console-draw-saved-colors', true);
const saveColorButton = app.querySelector('#console-draw-saved-colors-action');
const resetColor = () => {
  setSelectedColor('#000000');
  colorTextInput.value = '';
};
const resetColorOpacity = () => {
  setSelectedColor('#00000000');
  opacityTextInput.value = '100';
  opacityInput.value = 100;
  opacityInput.closest('.console-draw-setting').style.setProperty('--value-char-length', 3);
  colorTextInput.value = '';
};
const historyBranchesInput = app.querySelector('#console-draw-history-actions--branches');
const historyBranchesButton = app.querySelector('label[for="console-draw-history-actions--branches"]');
const historyBranchesWrapper = app.querySelector('#console-draw-history-branches-wrapper');
const historyBranchesInner = app.querySelector('#console-draw-history-branches-inner');
const historyBranchesContainer = app.querySelector('#console-draw-history-branches');
const historyCurrentBranchElement = app.querySelector('#console-draw-history-current-branch');
const historyUndoAllButton = app.querySelector('#console-draw-history-actions--undo-all');
const historyUndoButton = app.querySelector('#console-draw-history-actions--undo');
const historyRedoButton = app.querySelector('#console-draw-history-actions--redo');
const historyRedoAllButton = app.querySelector('#console-draw-history-actions--redo-all');
const samplesToggleInput = app.querySelector('#console-draw-import-actions--samples');
const samplesToggleButton = app.querySelector('label[for="console-draw-import-actions--samples"]');
const pasteButton = app.querySelector('#console-draw-import-actions--paste');
const uploadInput = app.querySelector('#console-draw-import-actions--upload');
const uploadButton = app.querySelector('label[for="console-draw-import-actions--upload"]');
const drawInstructionsElement = app.querySelector('#console-draw-snippet-draw');
const getDrawInstructions = () => {
  const drawingName = getDrawingNameCamelCase();
  const colors = JSON.stringify(getChunkedPixelColors()).replace(/\\"/, "'");
  return `const ${drawingName} = ${colors};\nconsoleDraw(${drawingName}${invertMode ? ', true' : ''});`;
};
const logInstructionsElement = app.querySelector('#console-draw-snippet-log');
const getLogInstructions = () => {
  const colors = getChunkedPixelColors();
  return `console.log(\`\\n\${\`\${\'%c  \'.repeat(${colors[0].length})}\\n\`.repeat(${colors.length})}\`, ${invertMode ? '...(!window.matchMedia(\'(prefers-color-scheme: dark)\').matches ? ' : ''}${invertMode ? '' : '...'}${JSON.stringify(colors.flat()).replaceAll('"', "'")}.map(color => \`background-color:\${color}\`)${invertMode ? ' : ' + `${JSON.stringify(colors.flat().map(invertColor)).replaceAll('"', "'")}.map(color =\> \`background-color:\${color}\`)` : ''})${invertMode ? ')' : ''}`;
};
const refreshInstructions = () => {
  drawInstructionsElement.innerHTML = getDrawInstructions();
  logInstructionsElement.innerHTML = getLogInstructions();
};
const getCompleteHistory = () => [...multiversionBwd, getChunkedPixelColors(), ...multiversionFwd.slice().reverse()];
const multiversion = new Multiversion(historyBranchesContainer, historyCurrentBranchElement);
const createBranch = (history = getCompleteHistory()) => multiversion.createBranch(history);
const refreshCurrent = () => multiversion.refreshCurrent();
const multiversionBwd = multiversion.statesBwd;
const multiversionFwd = multiversion.statesFwd;
const allBranches = multiversion.branches;
// logHistoryCounter = () => (console.log('History change #' + ++historyCounter), true),
const storeHistoryState = (historyLog = multiversionBwd, compare = true, overwrite = true) => {
  // logHistoryCounter();
  const colors = getChunkedPixelColors();
  if (!compare || !arraysEqual(lastOf(historyLog) ?? [], colors)) {
    if (overwrite && historyLog === multiversionBwd && multiversionFwd.length) {
      const completeHistory = getCompleteHistory();
      if (!allBranches.length || !allBranches.some(branch => arraysEqual(lastOf(branch), lastOf(completeHistory)))) {
        // console.log((allBranches.length ? 'no matching branches of ' + allBranches.length + ' branches' : 'no branches created before') + ' - BRANCH CREATED');
        createBranch(completeHistory);
        // console.log({allBranches});
      } else {
        // console.log('matching branch found - NO BRANCH CREATED');
      }
      multiversionFwd.length = 0;
      // console.warn('multiversionFwd.length = 0');
    }
    // console.log('!arraysEqual', [lastOf(historyLog) ?? [], colors]);
    historyLog.push(colors);
  }
};
const storeHistoryStateBwd = (compare = false, overwrite = false) => console.warn('storeHistoryStateBwd') || storeHistoryState(multiversionBwd, compare, overwrite);
const storeHistoryStateFwd = (compare = false, overwrite = false) => console.warn('storeHistoryStateFwd') || storeHistoryState(multiversionFwd, compare, overwrite);
// const multiversionStep = (steps = -1) => {
// if (isNaN(steps) || (!Number.isInteger(steps) && ![-Infinity, Infinity].includes(steps)) || steps === 0) return false;
// const [thisLog, peerLog] = steps < 0 ? [multiversionBwd, multiversionFwd] : [multiversionFwd, multiversionBwd];
// steps = Math.abs(steps);
// while (steps && thisLog.length) {
// const switchState = thisLog.pop();
// if (switchState) {
// storeHistoryState(peerLog, false, false);
// populateFromImport(switchState, false, false);
// // console.warn('multiversionStep');
// }
// steps--;
// }
// };
const multiversionStep = (steps = -1) => {
  if (isNaN(steps) || (!Number.isInteger(steps) && ![-Infinity, Infinity].includes(steps)) || steps === 0) return false;
  const [thisLog, peerLog] = steps < 0 ? [multiversionBwd, multiversionFwd] : [multiversionFwd, multiversionBwd];
  steps = Math.min(Math.abs(steps), thisLog.length);
  if (steps) {
    const currentState = getChunkedPixelColors();
    const stashedSteps = thisLog.splice(thisLog.length - steps, steps).reverse();
    const newState = stashedSteps.pop();
    peerLog.push(currentState, ...stashedSteps);
    populateFromImport(newState, false, false);
    if (multiversionBwd.length > 1 && arraysEqual(multiversionBwd[0], multiversionBwd[1])) multiversionBwd.splice(0, 1);
  }
};
/*const multiversionStepBwd = () => {
  const prevState = multiversionBwd.pop();
  if (prevState) {
    storeHistoryStateFwd();
    populateFromImport(prevState);
    multiversionBwd.length--;
  }
};
const multiversionStepFwd = () => {
  const nextState = multiversionFwd.pop();
  if (nextState) {
    storeHistoryStateBwd();
    populateFromImport(nextState);
    multiversionFwd.length--;
  }
};*/
const refreshValues = () => {
  const base64 = refreshBase64();
  refreshInstructions();
  downloadDrawingButton.href = `${base64}`;
  downloadDrawingButton.download = getDrawingNameHyphenated();
  pixelsChanged = 0;
  if (multiversionBwd.length > 1 && arraysEqual(lastOf(multiversionBwd) ?? [], getChunkedPixelColors())) multiversionBwd.length--;
};
const copyTextToClipboard = elem => {
  elem.select();
  elem.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(elem.textContent);
};
const copyCurrentInstructions = () => {
  const value = app.querySelector('[name="console-draw-snippet-type"]:checked').value;
  const instructionsElement = app.querySelector(`#console-draw-snippet-${value}`);
  copyTextToClipboard(instructionsElement);
};
const cleanArtboard = (width = getWidth(), height = getHeight(), saveToHistory = true) => {
  if (saveToHistory) console.warn('cleanArtboard()') || storeHistoryStateBwd();
  setWidth(width);
  setHeight(height);
  artboard.innerHTML = ('<div class="console-draw-pixel-row">'+('<button class="console-draw-pixel" draggable="false" tab-index="0"></button>'.repeat(width))+'</div>').repeat(height);
  pixelRows.length = 0;
  pixelRows.push(...Array.from(app.querySelectorAll('.console-draw-pixel-row')));
  pixels.length = 0;
  pixels.push(...Array.from(app.querySelectorAll('.console-draw-pixel')));
  refreshValues();
};
const populateFromImport = (colors, resetSavedColors = true, saveToHistory = true) => {
  const triggerError = () => alert('The data provided does not match the format required for consoleDraw(). Please verify the format of the data you are attempting to use and then try again.');
  try {
    if (typeof colors === 'string') colors = JSON.parse(colors);
    if (Array.isArray(colors) && colors.every(e => Array.isArray(e)) && new Set(colors.map(e => e.length)).size === 1) {
      const width = colors[0].length;
      const height = colors.length;
      cleanArtboard(width, height, saveToHistory);
      colors.flat().forEach((color, i) => setPixelColor(pixels[i], color));
      if (resetSavedColors) {
        savedColors.reset();
        savedColors.add(sortByHSL(filterUnique(colors.flat())).reverse());
      }
      refreshValues();
      return true;
    } else {
      triggerError();
    }
  } catch(error) {
    triggerError();
  }
  return false;
};
const isApple = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const modKey = isApple ? 'metaKey' : 'ctrlKey';
const triggerEvent = (element, event) => element.dispatchEvent(new Event(event, { 'bubbles': true }));
const warnAboutReset = () => warnedAboutReset || confirm('Warning: Changing the size of your drawing will reset the drawing board. As they say, "back to the drawing board!". Click "OK" to confirm this change and reset your artboard, or "Cancel" to return to your exiting artwork.\n\nThis warning will only trigger once every time to make a change to your artwork, for your convenience.') ? (warnedAboutReset = true, true) : false;
let warnedAboutReset = true;
let spaceHeld = 0;
let mouseHeld = 0;
let pixelsChanged = 0;
let invertMode = 0;
let historyCounter = 0;
refreshValues();
document.addEventListener('input', e => {
  if (e.target) {
    if ([widthInput, heightInput].includes(e.target)) {
      if (warnAboutReset()) {
        cleanArtboard();
      } else {
        e.preventDefault();
      }
    }
    if (e.target === colorTextInput) {
      const input = e.target;
      input.value = input.value.trim().toLowerCase();
      const isValid = input.checkValidity();
      const value = input.value;
      const color = isValid ? '#' + (value.length === 3 ? value.split('').map(e => e + e).join('') : value) : false;
      if (color) {
        colorInput.value = color;
        app.style.setProperty('--console-draw-setting-color', color);
        setSelectedColor(color, getSelectedOpacity());
      } else if (value === '') resetColor();
    }
    if (e.target === colorInput) {
      const input = e.target;
      const color = input.value;
      colorTextInput.value = color.slice(1);
      app.style.setProperty('--console-draw-setting-color', color);
      setSelectedColor(color, getSelectedOpacity());
    }
    if ([opacityTextInput, opacityInput].includes(e.target)) {
      const input = e.target;
      const value = Math.round(Math.min(Math.max(Number(input.value.trim()), 0), 100));
      input.value = value;
      const isValid = input.checkValidity();
      const valueCharLength = value.toString().length;
      input.closest('.console-draw-setting').style.setProperty('--value-char-length', valueCharLength);
      if (isValid) {
        setSelectedColor(getSelectedColor(), value);
        opacityInput.value = value;
        opacityTextInput.value = value;
      }
    }
    if (e.target === samplesToggleInput) {
      const input = e.target;
      if (input.checked) refreshSampleLibrary();
    }
  }
});
document.addEventListener('change', e => {
  if (e.target) {
    if ([drawingNameInput, submitDrawingNameInput].includes(e.target)) {
      setDrawingName(e.target.value);
    }
    if (e.target.matches('[name="console-draw-tool"]')) {
      const input = e.target;
      const tool = input.value;
      if (tool === 'reset') {
        const resetConfirmed = confirm('Are you sure you would like to reset your drawing? Click "OK" to confirm this change and reset your artboard, or "Cancel" to return to your exiting artwork.');
        if (resetConfirmed) {
          warnedAboutReset = true;
          cleanArtboard();
          // pixels.forEach(pixel => clearPixelColor(pixel));
          // recentColors.reset();
          // savedColors.reset();
          // resetColorOpacity();
          warnedAboutReset = true;
        }
        setTool('draw');
        getToolInput().focus();
      } else {
        setTool(tool);
      }
    }
    if (e.target === invertDarkModeInput) {
      const input = e.target;
      if (input.checked) {
        invertMode++;
      } else {
        invertMode = 0;
      }
      refreshValues();
    }
    if (e.target === historyBranchesInput) {
      const input = e.target;
      if (input.checked) {
        refreshCurrent();
        const focusTaret = historyBranchesInner.querySelector('.console-draw-history-branches--branch--states--state.active') ?? historyBranchesInner.querySelector('.console-draw-history-branches--branch--states--state') ?? historyBranchesInner.querySelector('.modal-close');
        focusTaret.focus();
      }
    }
    if (e.target === submitDrawingInput) {
      const input = e.target;
      if (input.checked) {
        const focusTaret = submitDrawingInner.querySelector('input, textarea, select');
        focusTaret.focus();
      }
    }
    if (e.target.matches('[name="console-draw-snippet-type"]')) {
      const input = e.target;
      const value = input.value;
      input.parentNode.dataset.type = value;
    }
    if (e.target === uploadInput) {
      const reader = new FileReader();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      reader.onload = function(_e) {
        const img = new Image();
        img.onload = () => {
          // console.log([_e, _e.target.result, img]);
          const { width, height } = img;
          const maxWidth = getMaxWidth();
          const maxHeight = getMaxHeight();
          if (width <= maxWidth && height <= maxHeight) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(img, 0, 0);
            const colors = chunkArray(chunkArray(context.getImageData(0, 0, width, height).data, 4).map(color => rgba2hexa(Array.from(color))), width);
            populateFromImport(colors);
          } else if (width > maxWidth || height > maxHeight) {
            alert(`Uploaded pixel artwork must not exceed ${maxWidth}px width or ${maxWidth !== maxHeight ? maxHeight + 'px ' : ''}height. Please try again.`);
          } else {
            alert('There was an issue with your upload. Please try again.');
          }
        }
        img.src = _e.target.result;
      }
      const base64 = reader.readAsDataURL(e.target.files[0]);
      // console.log({reader, base64});
    }
  }
});
const getPixelByOffset = (offset = false, pixel = document.activeElement?.matches?.('.console-draw-pixel') ? document.activeElement : false) => {
  if (!Array.isArray(offset) || offset.length !== 2 || !offset.every(e => (typeof e).toLowerCase() === "number" && Number.isInteger(e))) throw new Error('getPixelByOffset parameter offset requires an array of 2 integers');
  if (!pixel || !pixel.matches('.console-draw-pixel')) throw new Error('getPixelByOffset parameter pixel requires a pixel input');
  if (offset.every(e => e === 0)) return pixel;
  const [offsetX, offsetY] = offset;
  const drawingLimitX = getWidth()-1;
  const drawingLimitY = getHeight()-1;
  const pixelRowIndex = getPixelRow(pixel);
  const pixelColIndex = getPixelCol(pixel);
  const targetRowIndex = clamp(0, pixelRowIndex + offsetY, drawingLimitY);
  const targetRow = pixelRows[targetRowIndex];
  const targetColIndex = clamp(0, pixelColIndex + offsetX, drawingLimitX);
  const targetPixel = targetRow.children[targetColIndex];
  return targetPixel;
}
const getSurroundingPixels = (pixel = document.activeElement?.matches?.('.console-draw-pixel') ? document.activeElement : false, matchColor = false, color = false) => {
  const surroundingPixels = [[0,-1], [1,0], [0,1], [-1,0]].map(offset => getPixelByOffset(offset, pixel)).filter(p => p !== pixel);
  // console.log({surroundingPixels});
  // console.log({getSurroundingPixels: matchColor ? surroundingPixels.filter(p => getPixelColor(p) === color || getPixelColor(pixel)) : surroundingPixels});
  return matchColor ? surroundingPixels.filter(p => getPixelColor(p) === color || getPixelColor(pixel)) : surroundingPixels;
};
const floodFill = (pixel, fillColor) => {
  const filledPixels = new Set([pixel]);
  const totalPixelsAround = new Set([pixel]);
  const surroundingPixels = new Set(getSurroundingPixels(pixel, true));
  const matchColor = getPixelColor(pixel);
  setPixelColor(pixel, fillColor);
  let surroundingPixelsSize = surroundingPixels.size;
  let i = 0;
  while (surroundingPixelsSize && i <= 150) {
    // let breakOut = false;
    const pixelsAround = new Set();
    for (let surroundingPixel of surroundingPixels) {
      // console.log({surroundingPixel, surroundingPixels});
      if (getPixelColor(surroundingPixel) === matchColor) {
        const matchedPixels = getSurroundingPixels(surroundingPixel, true, fillColor).filter(p => !totalPixelsAround.has(p));
        matchedPixels.forEach(p => (pixelsAround.add(p), totalPixelsAround.add(p)));
        // const angle = offsetToAngle(...offset);
        setTimeout(setPixelColor, i * 20, surroundingPixel, fillColor);
        // setPixelColor(surroundingPixel, fillColor);
        filledPixels.add(surroundingPixel);
      }
      // if (confirm('Break FOR loop?')) break;
    }
    surroundingPixels.clear();
    pixelsAround.forEach(p => surroundingPixels.add(p));
    pixelsAround.clear();
    // surroundingPixels.splice(0, surroundingPixelsSize);
    surroundingPixelsSize = surroundingPixels.size;
    i++;
    // console.log({i, surroundingPixelsSize});
    // if (confirm('Break WHILE loop?')) break;
  }
};
const handlePixelOperations = pixel => {
  const pixelColor = getPixelColor(pixel);
  const color = getSelectedColorFull();
  const tool = getTool();
  if (tool === 'eyedrop') {
    setSelectedColor(pixelColor);
    recentColors.add(pixelColor);
    setTool('draw');
  } else {
    if (tool === 'draw') {
      setPixelColor(pixel, color);
      recentColors.add(color);
    } else if (tool === 'fill') {
      floodFill(pixel, color);
      recentColors.add(color);
    } else if (tool === 'erase') {
      clearPixelColor(pixel);
    }
    pixelsChanged++;
    if (!mouseHeld && !spaceHeld) refreshValues();
  }
};
document.addEventListener('mousedown', e => {
  if (e.target) {
    if (e.target.matches('.console-draw-spinner-minus, .console-draw-spinner-plus')) {
      const button = e.target;
      const numberField = button.closest('.console-draw-setting').querySelector('input[type="number"]');
      const increment = button.classList.contains('console-draw-spinner-minus') ? -1 : 1;
      if (warnAboutReset()) {
        numberField.value = Math.max(Math.min(+numberField.value + increment, +numberField.max), +numberField.min);
        triggerEvent(numberField, 'input');
      }
    }
    if (e.target.matches('.console-draw-pixel') && e.which === 1) {
      mouseHeld = 1;
      // console.warn('mousedown');
      storeHistoryState();
      handlePixelOperations(e.target);
    }
  }
});
document.addEventListener('mouseup', e => {
  mouseHeld = 0;
  if (pixelsChanged) refreshValues();
});
document.addEventListener('click', e => {
  if (e.target) {
    if (submitDrawingInput.checked && submitDrawingWrapper.contains(e.target) && !submitDrawingInner.contains(e.target)) {
      submitDrawingInput.checked = false;
    }
    if (historyBranchesInput.checked && historyBranchesWrapper.contains(e.target) && !historyBranchesInner.contains(e.target)) {
      historyBranchesInput.checked = false;
    }
    if (samplesToggleInput.checked && ![samplesToggleInput, samplesToggleButton].includes(e.target)) {
      const [clickedOutsideSampleLibrary, clickedSampleRow] = [!sampleLibrary.contains(e.target), e.target.matches('.console-draw-import-sample, .console-draw-import-sample :not(.console-draw-import-sample--author-socials > a, .console-draw-import-sample--author-socials > a > img)')];
      if (clickedOutsideSampleLibrary || clickedSampleRow) {
        samplesToggleInput.checked = false;
      }
      if (clickedSampleRow) {
        const sample = e.target.matches('.console-draw-import-sample') ? e.target : e.target.closest('.console-draw-import-sample');
        const sampleName = sample.dataset.sampleName;
        const colors = JSON.parse(unescape(sample.dataset.sampleColors));
        setDrawingName(sampleName);
        populateFromImport(colors);
      }
    }
    if (e.target === historyUndoAllButton) multiversionStep(-Infinity);
    if (e.target === historyUndoButton) multiversionStep(-1);
    if (e.target === historyRedoButton) multiversionStep(1);
    if (e.target === historyRedoAllButton) multiversionStep(Infinity);
    if (e.target.matches('.modal-close[data-for]')) document.getElementById(e.target.dataset.for).checked = false;
    if (e.target.matches('.console-draw-pixel')) handlePixelOperations(e.target);
    if (e.target.matches('.color-set--color')) {
      const element = e.target;
      const color = getPixelColor(element);
      const set = element.parentNode.parentNode.matches('#console-draw-saved-colors') ? savedColors : recentColors;
      setSelectedColor(color);
      set.add(color);
      refreshTool();
    }
    if (e.target === saveColorButton) {
      const color = getSelectedColorFull();
      if (savedColors.has(color)) {
        savedColors.delete(color);
        saveColorButton.classList.remove('color-saved');
      } else {
        savedColors.add(color);
        setSelectedColor(color);
      }
    }
    if (e.target.matches('.console-draw-snippet-action[id^="console-draw-snippet-actions--"]')) {
      const button = e.target;
      const action = button.id.replace('console-draw-snippet-actions--', '');
      const type = app.querySelector('[name="console-draw-snippet-type"]:checked').value;
      const instructionsElement = app.querySelector(`#console-draw-snippet-${type}`);
      if (action === 'copy') {
        copyTextToClipboard(instructionsElement);
      } else if (action === 'raw') {
        const drawingName = getDrawingName();
        const method = `console.${type}()`;
        window.open(URL.createObjectURL(new Blob([`<!DOCTYPE html><html><head><title>${getDrawingName()} - console.${type}() Source</title><style>body{font-family:consolas,monospace;white-space:pre;}</style></head><body>${instructionsElement.innerHTML.replace(/ /g, ' ')}</body></html>`], { type: 'text/html' })), 'win', `width=800,height=400,screenX=200,screenY=200`);
      } else if (action === 'run') {
        consoleDraw(getChunkedPixelColors(), invertMode);
      }
    }
    if (e.target === pasteButton) {
      const colors = prompt('Please paste your consoleDraw() JSON data here and click "OK", or click "Cancel" to cancel.');
      if (typeof colors === 'string') populateFromImport(colors);
    }
    if (e.target === submitDrawingButton) {
      refreshValues();
      submitDrawingPixelsInput.value = escapeJSON(getChunkedPixelColors());
    }
    if (e.target === downloadDrawingButton) {
      refreshValues();
    }
  }
});
document.addEventListener('keydown', e => {
  if (e.code === 'Space') spaceHeld = 1;
  if (e.keyCode === 27) {
    const modalTriggerIDs = [
      'console-draw-history-actions--branches',
      'console-draw-import-actions--samples',
      'console-draw-submit'
    ];
    let openModalFound = false;
    let openModalTrigger = null;
    for (const id of modalTriggerIDs) {
      const modalTrigger = document.getElementById(id);
      if (!openModalFound && modalTrigger.checked) {
        openModalFound = true;
        openModalTrigger = modalTrigger;
      }
      modalTrigger.checked = false;
    }
    if (openModalTrigger) openModalTrigger.focus();
  }
  if (e[modKey]) {
    if (e.code === 'KeyZ' && !e.shiftKey) multiversionStep(-1);
    if (isApple ? e.code === 'KeyZ' && e.shiftKey : (e.code === 'KeyZ' && e.shiftKey) || e.code === 'KeyY') multiversionStep(1);
  }
  if (e.target) {
    if (e.target.matches('.console-draw-pixel')) {
      e.preventDefault();
      const dirs = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      if (dirs.includes(e.code)) {
        const dir = e.code;
        const pixel = e.target;
        const targetPixel =
          dir === 'ArrowUp' ? getPixelByOffset([0,-1], pixel) :
          dir === 'ArrowRight' ? getPixelByOffset([1,0], pixel) :
          dir === 'ArrowDown' ? getPixelByOffset([0,1], pixel) :
          dir === 'ArrowLeft' ? getPixelByOffset([-1,0], pixel) : pixel;
        targetPixel.focus();
        if (spaceHeld) handlePixelOperations(targetPixel);
      } else if (e.code === 'Space') {
        console.warn('keydown');
        storeHistoryState();
        handlePixelOperations(e.target);
      } else if (e.code === 'Tab') {
        if (e.shiftKey) { getToolInput().focus(); }
        else { historyBranchesInput.focus(); }
      }
    } else if ([historyBranchesInput, historyBranchesButton].includes(e.target) && e.code === 'Tab' && e.shiftKey) {
      e.preventDefault();
      pixels[0].focus();
    } else if (e.code === 'Tab' && historyBranchesInner.contains(e.target)) {
      e.preventDefault();
      if (e.target.matches('.modal-close') && !e.shiftKey) {
        historyCurrentBranchElement.querySelector('.console-draw-history-branches--branch--states--state.active').focus();
      } else if (e.target.matches('.console-draw-history-branches--branch--states--state')) {
        const state = e.target;
        if (historyCurrentBranchElement.contains(state)) {
          const focusTarget = e.shiftKey ? historyBranchesInner.querySelector('.modal-close') : (historyBranchesContainer.children.length ? historyBranchesContainer.querySelector('.console-draw-history-branches--branch--states--state') : state);
          if (focusTarget) focusTarget.focus();
        } else {
          const branch = state.closest('.console-draw-history-branches--branch');
          const targetBranch = e.shiftKey ? (branch.previousElementSibling ?? historyCurrentBranchElement.querySelector('.console-draw-history-branches--branch')) : (branch.nextElementSibling ?? branch);
          const focusTarget = branch === targetBranch ? state : (targetBranch.querySelector('.console-draw-history-branches--branch--states--state.active') ?? targetBranch.querySelector('.console-draw-history-branches--branch--states--state'));
          if (focusTarget) focusTarget.focus();
        }
      }
    } else if (['ArrowLeft', 'ArrowRight'].includes(e.code) && e.target.matches('.console-draw-history-branches--branch--states--state')) {
      e.preventDefault();
      const state = e.target;
      const focusTarget = state[['nextElementSibling', 'previousElementSibling'][['ArrowLeft', 'ArrowRight'].indexOf(e.code)]] ?? state;
      focusTarget.focus();
      focusTarget.parentNode.scrollTo(focusTarget.offsetLeft - (focusTarget.parentNode.offsetWidth / 2 - (focusTarget.offsetWidth / 2)), 0);
    } else if (e.code === 'Tab' && submitDrawingInner.contains(e.target)) {
      if ((e.target.matches('.modal-close') && e.shiftKey) || (e.target.matches('#console-draw-submit-submit') && !e.shiftKey)) e.preventDefault();
    }
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    spaceHeld = 0;
    if (pixelsChanged) refreshValues();
  }
});
document.addEventListener('mouseover', e => {
  if (e.target) {
    if (e.target.matches('.console-draw-pixel') && e.which === 1 && mouseHeld) handlePixelOperations(e.target);
  }
});
document.addEventListener('dragstart', e => {
  if (e.target) {
    if (e.target.matches && e.target.matches('.console-draw-pixel')) {
      e.preventDefault();
      handlePixelOperations(e.target);
    }
  }
}, false);
document.addEventListener('submit', e => {
  if (e.target) {
    if (e.target === submitDrawingForm) {
      e.preventDefault();
      fetch('//dreamthinkbuild.com/console-draw/submit_sample.php', {
        method: 'POST',
        cache: 'no-cache',
        body: JSON.stringify(getSubmitDrawingFormData())
      }).then(res => res.json()).then(data => {
        // console.log(data);
        submitDrawingInput.checked = false;
        setTimeout(() => alert('Drawing submitted successfully! I will review it shortly.\n\nIf you have any questions, or if you would like to share feedback regarding your overall experience using consoleDraw() so far, please email me directly at brandon[at]dreamthinkbuild.com.\n\nThank you! 🎉'), 10);
      }).catch(e => {
        console.error(e)
        alert('Something went wrong.\n\nIf this issue persists, copy the JSON code at the bottom of this page and email it to me directly at brandon[at]dreamthinkbuild.com along with any details you would like to include regarding this error and your overall experience using consoleDraw() so far.\n\nSorry for the inconvenience! 🙏🏼');
      });
      const drawingName = submitDrawingNameInput.value;
      submitDrawingForm.reset();
      setDrawingName(drawingName);
    }
  }
});
const socialNetworks = [
  ['codepen', {
    formatTitle: name => name + ' on CodePen',
    formatURL: id => 'https://codepen.io/' + id,
    img: 'https://assets.codepen.io/1580009/icon-codepen.svg'
  }],
  ['website', {
    formatTitle: name => name + '\'s website',
    formatURL: null,
    img: 'https://assets.codepen.io/1580009/icon-website.svg'
  }],
  ['github', {
    formatTitle: name => name + ' on GitHub',
    formatURL: id => 'https://github.com/' + id,
    img: 'https://assets.codepen.io/1580009/icon-github.svg'
  }],
  ['stackoverflow', {
    formatTitle: name => name + ' on StackOverflow',
    formatURL: null,
    img: 'https://assets.codepen.io/1580009/icon-stackoverflow.svg'
  }],
  ['linkedin', {
    formatTitle: name => name + ' on LinkedIn',
    formatURL: id => 'https://linkedin.com/in/' + id,
    img: 'https://assets.codepen.io/1580009/icon-linkedin.svg'
  }],
  ['twitter', {
    formatTitle: name => name + ' on Twitter',
    formatURL: id => 'https://twitter.com/' + id,
    img: 'https://assets.codepen.io/1580009/icon-twitter.svg'
  }]
];
const refreshSampleLibrary = () => {
  fetch('https://dreamthinkbuild.com/console-draw/get_samples.php').then(res => res.json()).then(samples => {
    if (samples.length && samples.length !== Number(sampleLibrary.dataset.sampleCount)) {
      sampleLibrary.dataset.sampleCount = samples.length;
      sampleLibrary.innerHTML = '';
      for ({ author: { name: author } = { name: null }, author: { socials }, artwork: { name } = null, artwork: { colors } = [[]], artwork: { image } = '' } of samples) {
        const camelCaseName = makeCamelCase(name);
        const width = colors[0].length;
        const height = colors.length;
        // const colorsHTMLString = colors.flat().map(c => `<div style="background-color: ${c}" class="console-draw-import-sample--preview--pixel"></div>`).join('');
        // const socialsHTMLString = codepen || twitter ? `<div class="console-draw-import-sample--author-socials">${codepen ? `<a href="https://codepen.io/${codepen}" target="_blank" title="${author} on CodePen"><img src="${socialIcons.codepen}" alt="CodePen logo"></a>` : ''}${twitter ? `<a href="https://twitter.com/${twitter}" target="_blank" title="${author} on Twitter"><img src="${socialIcons.twitter}" alt="Twitter logo"></a>` : ''}</div>` : '';
        let socialsHTMLString = '';
        for (let [network, {formatTitle, formatURL, img}] of socialNetworks) {
          if (socials[network]) {
            // console.log({author, network, formatTitle, formatURL, socials})
            socialsHTMLString += `<a href="${formatURL ? formatURL(socials[network]?.trim()) : (socials[network]?.trim()?.startsWith('http') ? '' : 'http://') + socials[network]?.trim()}" target="_blank" title="${formatTitle(author)?.trim()}" class="console-draw-import-sample--author-socials--${network}"><img src="${img}" alt="${network} logo"></a>`;
          }
        }
        if (socialsHTMLString) socialsHTMLString = '<div class="console-draw-import-sample--author-socials">' + socialsHTMLString + '</div>';
        sampleLibrary.insertAdjacentHTML('beforeend', `<div class="console-draw-import-sample" id="console-draw-import-sample__${camelCaseName}" data-sample-name="${name}" data-sample-colors="${escapeJSON(colors)}"><div class="console-draw-import-sample--name" id="console-draw-import-sample__${camelCaseName}--name">${name}<small class="console-draw-import-sample--author">by ${author}</small>${socialsHTMLString}</div><div class="console-draw-import-sample--preview" id="console-draw-import-sample__${camelCaseName}--preview" style="--preview-width: ${width}; --preview-height: ${height}; --preview-image: url(${image})"></div></div>`);
      }
    }
  });
};
refreshSampleLibrary();

// console.log(Array(pixels.length).fill('%c  ').map((pixel, i) => i && i % cols === 0 ? '\n' + pixel : pixel).join(''), ...pixels.map(color => 'display:block;line-height:.9;color:'+color));
  
//   pixels.map(pixel => getPixelColor(pixel)).map(color => 'color:' + color)


// const getRandomColor = () => '#' + ('00000000' + Math.floor(Math.random() * (256 ** 4)).toString(16)).slice(-8);
// for (let i = 0; i < 100; i++) {
//   const color = getRandomColor();
//   recentColors.add(color);
//   // savedColors.add(color);
// }

let usingMouse;
const preFocus = e => usingMouse = e.type === 'mousedown';
const addFocus = e => usingMouse && e.target.classList.add('mouse-focus');
const removeFocus = e => (e.target.classList.remove('mouse-focus'), e.target.classList.toString() === '' && e.target.removeAttribute('class'));
const bindFocusEvents = () => {
  document.addEventListener('keydown', preFocus);
  document.addEventListener('mousedown', preFocus);
  document.addEventListener('focusin', addFocus);
  document.addEventListener('focusout', removeFocus);
};
bindFocusEvents();