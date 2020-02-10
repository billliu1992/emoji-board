import PageController from '../lib/PageController';

// tslint:disable-next-line
new PageController(document.body, chrome.runtime.getURL('keyboard.html'));