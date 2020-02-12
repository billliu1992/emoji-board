import AbstractBrowserStorageUtil from '../lib/AbstractBrowserStorageUtil';
import PageController from '../lib/PageController';
import ChromeStorageUtils from './ChromeStorageUtil';

// tslint:disable-next-line
new PageController(document.body, chrome.runtime.getURL('keyboard.html'));

AbstractBrowserStorageUtil.getInstance = () => new ChromeStorageUtils();
