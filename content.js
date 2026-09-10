console.log("[vim-nyt] content script loaded");

const KEY_MAP = {
  H: "ArrowLeft",
  J: "ArrowDown",
  K: "ArrowUp",
  L: "ArrowRight",
};

document.addEventListener(
  "keydown",
  (event) => {
    const mapped = KEY_MAP[event.key];
    if (!mapped) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    console.log(`[vim-nyt] translating "${event.key}" -> "${mapped}"`);

    event.target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: mapped,
        code: mapped,
        bubbles: true,
        cancelable: true,
      })
    );
  },
  { capture: true }
);
