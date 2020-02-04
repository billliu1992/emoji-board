export default class InputController {
	private inputEl: HTMLElement|null;

	constructor() {
		this.inputEl = null;
	}

	public addToInput(input: string) {
		if (this.inputEl == null) {
			return;
		}

		if (this.inputEl && 'value' in (this.inputEl as HTMLInputElement)) {
			this.addToInputElement(this.inputEl as HTMLInputElement, input);
			return;
		}

		this.addToContentEditable(this.inputEl, input);
	}

	public focus() {
		if (!this.inputEl) {
			return;
		}
		this.inputEl.focus();
	}

	public setInputElement(newEl: HTMLElement) {
		this.inputEl = newEl;
	}

	public clearInputElement() {
		this.inputEl = null;
	}

	public isInputElementSet(): boolean {
		return true;
	}

	private addToContentEditable(contentEditableToAdd: HTMLElement, input: string) {
		const inputDataTransfer = new DataTransfer();
		inputDataTransfer.setData(input, 'text/plain');

		contentEditableToAdd.dispatchEvent(
			new CompositionEvent('compositionstart', {
				bubbles: true,
				data: '',
			}));
		contentEditableToAdd.dispatchEvent(
			new CompositionEvent('compositionend', {
				bubbles: true,
				data: input,
			}));
		contentEditableToAdd.dispatchEvent(
			new InputEvent('compositionend', {
				bubbles: true,
				data: input,
				inputType: 'insertCompositionText',
				isComposing: false,
			}));
	}

	private addToInputElement(inputElement: HTMLInputElement, input: string) {
		inputElement.value += input;

		inputElement.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
			}));
		inputElement.dispatchEvent(
			new KeyboardEvent('keyup', {
				bubbles: true,
			}));
	}
}

// Temporarily declare an InputEvent. It's already in a subsequent version.
interface IInputEvent extends UIEvent {
	readonly data: string | null;
	readonly inputType: string;
	readonly isComposing: boolean;
}

declare var InputEvent: {
	prototype: IInputEvent;
	new(type: string, eventInitDict: any): IInputEvent;
};
