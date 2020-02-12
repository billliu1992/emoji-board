import AbstractBrowserStorageUtil from './AbstractBrowserStorageUtil';

const MAX_HISTORY_LENGTH = 50;
const HISTORY_STORAGE_KEY_NAME = 'history';

export default class HistoryController {
	private historyStack: string[] | null;
	private storageUtil: AbstractBrowserStorageUtil;

	constructor(private historyPageEl: Element) {
		this.storageUtil = AbstractBrowserStorageUtil.getInstance();
		this.historyStack = null;

		this.storageUtil.get(HISTORY_STORAGE_KEY_NAME).then(
			(history) => this.historyStack = history || []);
	}

	/**
	 * Updates the history page with the current state of the history.
	 */
	public refreshHistoryPage() {
		if (!this.historyStack) {
			return;
		}

		this.historyPageEl.innerHTML = '';
		this.historyStack
			.map((emoji) => this.buildEmojiButtonElement(emoji))
			.forEach((el) => this.historyPageEl.appendChild(el));
	}

	/**
	 * Pushes the history item to the front of the list while handling duplicates.
	 */
	public push(toPush: string) {
		if (!this.historyStack) {
			return;
		}

		for (let i = this.historyStack.length - 1; i >= 0; i--) {
			if (toPush.indexOf(this.historyStack[i]) !== -1) {
				this.historyStack.splice(i, 1);
			}
		}

		this.historyStack.unshift(toPush);

		if (this.historyStack.length > MAX_HISTORY_LENGTH) {
			this.historyStack.splice(MAX_HISTORY_LENGTH);
		}

		this.storageUtil.set({
			[HISTORY_STORAGE_KEY_NAME]: this.historyStack,
		});
	}

	private buildEmojiButtonElement(emoji: string): HTMLElement {
		const element = document.createElement('button');
		element.setAttribute('type', 'button');
		element.classList.add('kb-key-history');
		element.setAttribute('data-emoji-button', emoji);
		element.innerHTML = emoji + '&#xfe0f';

		return element;
	}
}
