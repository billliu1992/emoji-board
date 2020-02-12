import AbstractBrowserStorageUtil from '../lib/AbstractBrowserStorageUtil';

export default class FirefoxStorageService extends AbstractBrowserStorageUtil {
	public set(toSet: {}) {
		browser.storage.sync.set(toSet);
	}

	public get(key: string): Promise<any> {
		return Promise.resolve(browser.storage.sync.get(key));
	}
}
