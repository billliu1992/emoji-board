import HistoryController from './HistoryController';
import InputController from './InputController';

const EMOJI_CATEGORY_VALUE_HISTORY = 'history';

const EMOJI_BUTTON_ATTRIBUTE = 'data-emoji-button';
const EMOJI_CATEGORY_ATTRIBUTE = 'data-emoji-category';

const EMOJI_IS_SEARCHING_CLASS = 'kb-emoji-is-searching';
const EMOJI_SEARCH_ENTRY_CLASS = 'kb-emoji-search-entry';

const STYLE_KEYBOARD_PADDING_PX = 10;

export default class EmojiKeyboardController {
	private inputController: InputController;
	private historyController: HistoryController;
	private searchInputEl: HTMLInputElement;
	private emojiButtons: NodeList;
	constructor(
			public appendPoint: HTMLElement,
			public keyboardEl: HTMLElement) {
		const inputEl = keyboardEl.querySelector('input');
		if (inputEl === null) {
			throw new Error('Somehow the keyboard did not have a search bar');
		}
		this.searchInputEl = inputEl;

		this.emojiButtons = this.keyboardEl.querySelectorAll(`[${EMOJI_BUTTON_ATTRIBUTE}]`);

		this.inputController = new InputController();

		const historyPageEl = keyboardEl.querySelector('.kb-cat-history');
		if (!historyPageEl) {
			throw new Error('Somehow the keyboard did not have a history page');
		}
		this.historyController = new HistoryController(historyPageEl);

		this.initializeKeyboardListeners();
	}

	public attachKeyboardTo(element: HTMLElement) {
		// We do not want to attach the keyboard to itself, the interaction is extremely awkward.
		if (this.keyboardEl.contains(element)) {
			return;
		}

		this.appendPoint.appendChild(this.keyboardEl);
		this.positionKeyboardAround(element);
		this.searchInputEl.focus();
		this.inputController.setInputElement(element);
	}

	public hideKeyboard() {
		this.stopSearching();
		this.keyboardEl.remove();
		this.historyController.refreshHistoryPage();
	}

	public isShowing(): boolean {
		return !!this.keyboardEl.parentElement;
	}

	public isSearching(): boolean {
		return !!this.keyboardEl.classList.contains(EMOJI_IS_SEARCHING_CLASS);
	}

	private initializeKeyboardListeners() {
		this.keyboardEl.addEventListener('click', (event) => {
			const targetEl = event.target as HTMLElement; // Should always be element.
			if (typeof targetEl.getAttribute(EMOJI_BUTTON_ATTRIBUTE) === 'string') {
				this.inputController.addToInput(targetEl.innerText);
				this.historyController.push(targetEl.innerText);
			} else if (typeof targetEl.getAttribute(EMOJI_CATEGORY_ATTRIBUTE) === 'string') {
				const newCategory = targetEl.getAttribute(EMOJI_CATEGORY_ATTRIBUTE);
				if (newCategory === EMOJI_CATEGORY_VALUE_HISTORY) {
					this.historyController.refreshHistoryPage();
				}
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
		this.keyboardEl.addEventListener('keyup', (keyEvent) => {
			switch (keyEvent.key) {
				case 'Escape':
					keyEvent.stopPropagation();
					keyEvent.preventDefault();
					this.inputController.focus();
					this.inputController.clearInputElement();
					this.hideKeyboard();
					break;
			}
		});
		this.searchInputEl.addEventListener('keyup', (event) => {
			const searchBarValue = this.searchInputEl.value;
			if (searchBarValue.length === 0) {
				this.stopSearching();
			} else if (searchBarValue.length > 2) {
				this.startSearchingFor(searchBarValue);
			}
		});
	}

	private stopSearching() {
		this.searchInputEl.value = '';
		this.keyboardEl.classList.remove(EMOJI_IS_SEARCHING_CLASS);
	}

	private startSearchingFor(searchQuery: string) {
		this.keyboardEl.classList.add(EMOJI_IS_SEARCHING_CLASS);
		this.emojiButtons.forEach((node) => {
			const element = node as Element;
			const searchWords = element.getAttribute(EMOJI_BUTTON_ATTRIBUTE);
			if (searchWords && searchWords.indexOf(searchQuery) > -1) {
				element.classList.add(EMOJI_SEARCH_ENTRY_CLASS);
			} else {
				element.classList.remove(EMOJI_SEARCH_ENTRY_CLASS);
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
