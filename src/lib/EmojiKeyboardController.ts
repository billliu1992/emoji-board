const EMOJI_BUTTON_ATTRIBUTE = 'data-emoji-button';
const STYLE_KEYBOARD_PADDING_PX = 10;

export default class EmojiKeyboardController {
	constructor(
			public appendPoint: HTMLElement,
			public keyboardEl: HTMLElement,
			public emojiCallback: (emoji: string) => void) {
		this.initializeKeyboardListeners();
	}

	public showKeyboardAbove(element: Element) {
		this.appendPoint.appendChild(this.keyboardEl);
		this.positionKeyboardAround(element);
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

	private positionKeyboardAround(element: Element) {
		const {top, right, bottom, left} = element.getBoundingClientRect();

		const positionIfTop = top - this.keyboardEl.clientHeight - STYLE_KEYBOARD_PADDING_PX;
		const positionIfBottom = bottom + STYLE_KEYBOARD_PADDING_PX;
		if (positionIfTop > 0) {
			this.keyboardEl.style.top = positionIfTop + 'px';
		} else {
			this.keyboardEl.style.top = positionIfBottom + 'px';
		}

		const positionLeft = Math.max(
			STYLE_KEYBOARD_PADDING_PX,
			(right - left) / 2 - (this.keyboardEl.clientWidth / 2));

		this.keyboardEl.style.left = positionLeft + 'px';
	}
}
