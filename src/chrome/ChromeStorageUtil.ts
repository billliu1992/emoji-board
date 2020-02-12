import AbstractBrowserStorageUtil from '../lib/AbstractBrowserStorageUtil';

export default class ChromeStorageUtil extends AbstractBrowserStorageUtil {
	public set(toSet: {}) {
		chrome.storage.sync.set(toSet);
	}

	public get(key: string): Promise<any> {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(key, (items) => {
				resolve(items[key]);
			});
		});
	}
}
