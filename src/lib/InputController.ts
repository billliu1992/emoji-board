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
			(this.inputEl as HTMLInputElement).value += input;
		}
		// Simulate as if this was entered through a keyboard.

		const inputDataTransfer = new DataTransfer();
		inputDataTransfer.setData(input, 'text/plain');

		this.inputEl.dispatchEvent(
			new CompositionEvent('compositionstart', {
				bubbles: true,
				data: input,
			}));
		this.inputEl.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				data: input,
				dataTransfer: inputDataTransfer,
			}));
		this.inputEl.dispatchEvent(
			new CompositionEvent('compositionend', {
				bubbles: true,
				data: input,
			}));
		this.inputEl.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
			}));
		this.inputEl.dispatchEvent(
			new Event('change', {
				bubbles: true,
			}));
		this.inputEl.dispatchEvent(
			new KeyboardEvent('keyup', {
				bubbles: true,
			}));
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
