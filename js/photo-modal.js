(function () {
	"use strict";

	var dialog = document.querySelector("[data-photo-modal]");
	var triggers = document.querySelectorAll("[data-photo-open]");

	if (!dialog || !triggers.length || typeof dialog.showModal !== "function") {
		return;
	}

	var closeButton = dialog.querySelector("[data-photo-modal-close]");
	var image = dialog.querySelector("[data-photo-modal-image]");
	var title = dialog.querySelector("[data-photo-modal-title]");
	var note = dialog.querySelector("[data-photo-modal-note]");
	var location = dialog.querySelector("[data-photo-modal-location]");
	var date = dialog.querySelector("[data-photo-modal-date]");
	var lastFocus = null;

	function setText(element, value) {
		if (!element) {
			return;
		}
		element.textContent = value || "";
		element.hidden = !value;
	}

	function openPhoto(trigger) {
		lastFocus = trigger;
		var src = trigger.dataset.photoSrc || trigger.href;
		image.alt = trigger.dataset.photoAlt || trigger.dataset.photoTitle || "";
		setText(title, trigger.dataset.photoTitle);
		setText(note, trigger.dataset.photoNote);
		setText(location, trigger.dataset.photoLocation);
		setText(date, trigger.dataset.photoDate);
		image.src = src;

		function show() {
			if (!dialog.open) {
				dialog.showModal();
			}
		}

		if (typeof image.decode === "function") {
			image.decode().then(show, show);
		} else if (image.complete && image.naturalWidth > 0) {
			show();
		} else {
			image.addEventListener("load", show, { once: true });
			image.addEventListener("error", show, { once: true });
		}
	}

	function closePhoto() {
		dialog.close();
	}

	triggers.forEach(function (trigger) {
		trigger.addEventListener("click", function (event) {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			event.preventDefault();
			openPhoto(trigger);
		});
	});

	if (closeButton) {
		closeButton.addEventListener("click", closePhoto);
	}

	dialog.addEventListener("click", function (event) {
		if (event.target === dialog) {
			closePhoto();
		}
	});

	dialog.addEventListener("close", function () {
		image.removeAttribute("src");
		if (lastFocus && typeof lastFocus.focus === "function") {
			lastFocus.focus();
		}
	});
})();
