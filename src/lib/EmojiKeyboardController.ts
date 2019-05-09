const EMOJI_BUTTON_ATTRIBUTE = 'data-emoji-button';

export default class EmojiKeyboardController {
	constructor(
			public appendPoint: HTMLElement,
			public keyboardEl: Element,
			public emojiCallback: (emoji:string) => void) {
		this.initializeKeyboardListeners();
	}

	public showKeyboardAbove(element: Element) {
		this.appendPoint.appendChild(this.keyboardEl);
	}

	public hideKeyboard() {
		this.keyboardEl.remove();
	}

	public isShowing(): boolean {
		return !!this.keyboardEl.parentElement;
	}

	private initializeKeyboardListeners() {
		this.keyboardEl.addEventListener('click', (event) => {
			const targetEl = event.target as HTMLElement; // Should always be element.
			if (typeof targetEl.getAttribute(EMOJI_BUTTON_ATTRIBUTE) === 'string') {
				this.emojiCallback(targetEl.innerText);
			}
		});
	}
}