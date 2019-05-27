const EMOJI_BUTTON_ATTRIBUTE = 'data-emoji-button';
const EMOJI_CATEGORY_ATTRIBUTE = 'data-emoji-category';
const STYLE_KEYBOARD_PADDING_PX = 10;

export default class EmojiKeyboardController {
	private currentFocus: HTMLInputElement|null;
	private searchInputEl: HTMLInputElement;
	constructor(
			public appendPoint: HTMLElement,
			public keyboardEl: HTMLElement) {
		this.initializeKeyboardListeners();

		const inputEl = keyboardEl.querySelector('input');
		if (inputEl === null) {
			throw new Error('Somehow the keyboard did not have a search bar');
		}
		this.searchInputEl = inputEl;

		this.currentFocus = null;
	}

	public showKeyboardAbove(element: HTMLInputElement) {
		this.appendPoint.appendChild(this.keyboardEl);
		this.positionKeyboardAround(element);
		this.searchInputEl.focus();
		this.currentFocus = element;
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
				if (this.currentFocus) {
					this.currentFocus.value += targetEl.innerText;
				}
			} else if (typeof targetEl.getAttribute(EMOJI_CATEGORY_ATTRIBUTE) === 'string') {
				const newCategory = targetEl.getAttribute(EMOJI_CATEGORY_ATTRIBUTE);
				if (newCategory) {
					this.setNewKeyboardCategory(newCategory);
				}
			}
		});
		this.keyboardEl.addEventListener('focusout', (event) => {
			// Only focus gets FocusEvent, unideal.
			const focusOutEvent = event as FocusEvent;

			if (!this.keyboardEl.contains(focusOutEvent.relatedTarget as Element)) {
				this.hideKeyboard();
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
			left + (right - left) / 2 - (this.keyboardEl.clientWidth / 2));

		this.keyboardEl.style.left = positionLeft + 'px';
	}

	private setNewKeyboardCategory(newCategory: string) {
		this.keyboardEl.classList.forEach((className) => {
			if (className.indexOf('kb-cat') > -1) {
				this.keyboardEl.classList.replace(className, `kb-cat-${newCategory}-active`);
			}
		});
	}
}
