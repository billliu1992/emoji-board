const MAX_HISTORY_LENGTH = 50;

export default class HistoryController {
	private historyStack: string[];

	constructor(private historyPageEl: Element) {
		this.historyStack = [];
	}

	/**
	 * Updates the history page with the current state of the history.
	 */
	public refreshHistoryPage() {
		this.historyPageEl.innerHTML = '';
		this.historyStack
			.map((emoji) => this.buildEmojiButtonElement(emoji))
			.forEach((el) => this.historyPageEl.appendChild(el));
	}

	/**
	 * Pushes the history item to the front of the list while handling duplicates.
	 */
	public push(toPush: string) {
		for (let i = this.historyStack.length - 1; i >= 0; i--) {
			if (toPush.indexOf(this.historyStack[i]) !== -1) {
				this.historyStack.splice(i, 1);
			}
		}

		this.historyStack.unshift(toPush);

		if (this.historyStack.length > MAX_HISTORY_LENGTH) {
			this.historyStack.splice(MAX_HISTORY_LENGTH);
		}
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
