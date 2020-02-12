import AbstractBrowserStorageUtil from '../lib/AbstractBrowserStorageUtil';
import PageController from '../lib/PageController';
import FirefoxStorageUtil from './FirefoxStorageUtil';

// tslint:disable-next-line
new PageController(document.body, browser.runtime.getURL('keyboard.html'));
AbstractBrowserStorageUtil.getInstance = () => new FirefoxStorageUtil();
