export default class PageController {
	constructor(public attachPoint: HTMLElement) {
	}

	attachEmojiKeyboard() {
		this.attachPoint.addEventListener("keypress", (keyEvent) => {
			if (keyEvent.getModifierState("Control") && keyEvent.code == "Space") {
				this.attachPoint.innerText = "Hello";
			}
		});
	}
}