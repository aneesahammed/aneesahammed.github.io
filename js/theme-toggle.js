(function () {
	"use strict";

	var THEME_KEY = "anees-blog-theme";
	var root = document.documentElement;
	var themeBtn = document.getElementById("themeToggleBtn");
	var themeColorMeta = document.querySelector('meta[name="theme-color"]');

	function readStoredTheme() {
		try {
			var saved = window.localStorage.getItem(THEME_KEY);
			if (saved === "dark" || saved === "light") {
				return saved;
			}
		} catch (error) {}
		return "";
	}

	function writeStoredTheme(theme) {
		try {
			window.localStorage.setItem(THEME_KEY, theme);
		} catch (error) {}
	}

	function applyTheme(theme) {
		var nextTheme = theme === "dark" ? "dark" : "light";
		root.setAttribute("data-theme", nextTheme);
		root.style.colorScheme = nextTheme;
		if (themeColorMeta) {
			themeColorMeta.setAttribute(
				"content",
				nextTheme === "dark" ? "#111111" : "#ffffff",
			);
		}
		if (themeBtn) {
			var isDark = nextTheme === "dark";
			themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
			themeBtn.setAttribute(
				"aria-label",
				isDark ? "Switch to light theme" : "Switch to dark theme",
			);
			themeBtn.setAttribute(
				"title",
				isDark ? "Switch to light theme" : "Switch to dark theme",
			);
		}
	}

	function prefersReducedMotion() {
		return !!(
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		);
	}

	function animateThemeReveal(transition, originX, originY, endRadius) {
		if (
			!transition ||
			!transition.ready ||
			typeof transition.ready.then !== "function"
		) {
			return;
		}

		transition.ready
			.then(function () {
				root.animate(
					{
						clipPath: [
							"circle(0px at " + originX + "px " + originY + "px)",
							"circle(" +
								endRadius +
								"px at " +
								originX +
								"px " +
								originY +
								"px)",
						],
					},
					{
						duration: 520,
						easing: "cubic-bezier(0.22, 1, 0.36, 1)",
						pseudoElement: "::view-transition-new(root)",
					},
				);
			})
			.catch(function () {});
	}

	applyTheme(readStoredTheme() || root.getAttribute("data-theme") || "light");

	if (!themeBtn) {
		return;
	}

	themeBtn.addEventListener("click", function () {
		var current = root.getAttribute("data-theme") || "light";
		var next = current === "dark" ? "light" : "dark";
		var rect = themeBtn.getBoundingClientRect();
		var originX = rect.left + rect.width / 2;
		var originY = rect.top + rect.height / 2;
		var maxDx = Math.max(originX, window.innerWidth - originX);
		var maxDy = Math.max(originY, window.innerHeight - originY);
		var endRadius = Math.hypot(maxDx, maxDy);

		root.style.setProperty("--vt-origin-x", originX + "px");
		root.style.setProperty("--vt-origin-y", originY + "px");
		root.style.setProperty("--vt-end-radius", endRadius + "px");

		var commitTheme = function () {
			applyTheme(next);
			writeStoredTheme(next);
		};

		if (
			!prefersReducedMotion() &&
			typeof document.startViewTransition === "function"
		) {
			var transition = document.startViewTransition(commitTheme);
			animateThemeReveal(transition, originX, originY, endRadius);
			return;
		}

		commitTheme();
	});

	window.addEventListener("storage", function (event) {
		if (event.key !== THEME_KEY) {
			return;
		}
		applyTheme(event.newValue === "dark" ? "dark" : "light");
	});
})();
