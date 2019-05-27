import EmojiKeyboardController from './EmojiKeyboardController';

export default class PageController {
	private currentFocus: HTMLInputElement|null = null;

	constructor(public attachPoint: HTMLElement, public keyboardTemplateUrl: string) {
		this.fetchHtml(this.keyboardTemplateUrl)
			.then((el) => {
				const keyboardController = new EmojiKeyboardController(attachPoint, el);

				this.attachPoint.addEventListener('keyup', (keyEvent) => {
					if (!keyEvent.target) {
						return;
					}
					if (keyEvent.getModifierState('Control') && keyEvent.key === ' ') {
						if (!keyEvent.target || !('value' in keyEvent.target)) {
							return;
						}
						this.currentFocus = keyEvent.target as HTMLInputElement;
						keyboardController.showKeyboardAbove(this.currentFocus);
					}
				});
			});
	}

	private async fetchHtml(url: string): Promise<HTMLElement> {
		return fetch(this.keyboardTemplateUrl)
			.then((response) => response.text())
			.then((responseText) => {
				const htmlDocument =
					(new DOMParser()).parseFromString(responseText, 'text/html');
				return htmlDocument.body.children[0] as HTMLElement; // should always be element
			});
	}
}
