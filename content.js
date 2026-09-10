const KEY_MAP = {
  H: "ArrowLeft",
  J: "ArrowDown",
  K: "ArrowUp",
  L: "ArrowRight",
};

const COLOR_INSERT = "#6b7280"; // grey
const COLOR_NAVIGATE = "#2563eb"; // blue
const COLOR_GOTO = "#7c3aed"; // purple

const statusBar = document.createElement("div");
statusBar.textContent = "Insert";
Object.assign(statusBar.style, {
  position: "fixed",
  bottom: "16px",
  right: "16px",
  zIndex: "2147483647",
  padding: "3px 8px",
  fontFamily: "monospace",
  fontWeight: "600",
  fontSize: "12px",
  color: "#fff",
  background: COLOR_INSERT,
  userSelect: "none",
  pointerEvents: "none",
});
document.documentElement.appendChild(statusBar);

let capsLockOn = false;
let shiftHeld = false;
let gotoBuffer = null; // null = inactive, otherwise the digits typed so far

function refreshStatusBar() {
  if (gotoBuffer !== null) {
    statusBar.textContent = `G${gotoBuffer}`;
    statusBar.style.background = COLOR_GOTO;
    return;
  }
  const navigating = capsLockOn || shiftHeld;
  statusBar.textContent = navigating ? "Navigate" : "Insert";
  statusBar.style.background = navigating ? COLOR_NAVIGATE : COLOR_INSERT;
}

function updateModifierState(event) {
  // Ignore synthetic events we dispatch ourselves (e.g. the translated
  // ArrowLeft/etc. below) — they don't carry real modifier state and would
  // otherwise flash the status bar back to "Insert".
  if (!event.isTrusted) {
    return;
  }
  if (typeof event.getModifierState === "function") {
    capsLockOn = event.getModifierState("CapsLock");
    shiftHeld = event.getModifierState("Shift");
  }
  refreshStatusBar();
}

document.addEventListener("keydown", updateModifierState, true);
document.addEventListener("keyup", updateModifierState, true);
// Defensive reset: if focus leaves the window while Shift is held (e.g.
// alt-tab), there's no keyup to tell us it was released.
window.addEventListener("blur", () => {
  shiftHeld = false;
  refreshStatusBar();
});

function currentDirection() {
  const selected = document.querySelector("rect.xwd__cell--selected");
  const label = selected ? selected.getAttribute("aria-label") : "";
  return label.startsWith("Down") ? "Down" : "Across";
}

function findClueLi(direction, number) {
  const wrapper = Array.from(
    document.querySelectorAll(".xwd__clue-list--wrapper")
  ).find((w) => w.querySelector("h3")?.textContent === direction);
  if (!wrapper) {
    return null;
  }

  return Array.from(wrapper.querySelectorAll("li.xwd__clue--li")).find(
    (li) => li.querySelector(".xwd__clue--label")?.textContent === number
  );
}

function goToClue(number) {
  const direction = currentDirection();
  const otherDirection = direction === "Across" ? "Down" : "Across";

  const li = findClueLi(direction, number) || findClueLi(otherDirection, number);
  if (!li) {
    return;
  }

  const rect = li.getBoundingClientRect();
  const opts = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: rect.x + rect.width / 2,
    clientY: rect.y + rect.height / 2,
  };
  ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(
    (type) => li.dispatchEvent(new MouseEvent(type, opts))
  );
}

document.addEventListener(
  "keydown",
  (event) => {
    // Mid-buffer: collecting digits after "G", waiting for Enter/Escape.
    if (gotoBuffer !== null) {
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        gotoBuffer += event.key;
        refreshStatusBar();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        if (gotoBuffer.length > 0) {
          goToClue(gotoBuffer);
        }
        gotoBuffer = null;
        refreshStatusBar();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        gotoBuffer = null;
        refreshStatusBar();
        return;
      }

      // Any other key cancels the buffer and falls through normally.
      gotoBuffer = null;
      refreshStatusBar();
    }

    if (event.key === "G") {
      event.preventDefault();
      event.stopPropagation();
      gotoBuffer = "";
      refreshStatusBar();
      return;
    }

    const mapped = KEY_MAP[event.key];
    if (!mapped) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

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
