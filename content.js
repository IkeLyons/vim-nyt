const KEY_MAP = {
  H: "ArrowLeft",
  J: "ArrowDown",
  K: "ArrowUp",
  L: "ArrowRight",
};

let gotoBuffer = null; // null = inactive, otherwise the digits typed so far

function currentDirection() {
  const selected = document.querySelector("rect.xwd__cell--selected");
  const label = selected ? selected.getAttribute("aria-label") : "";
  return label.startsWith("Down") ? "Down" : "Across";
}

function goToClue(number) {
  const direction = currentDirection();

  const wrapper = Array.from(
    document.querySelectorAll(".xwd__clue-list--wrapper")
  ).find((w) => w.querySelector("h3")?.textContent === direction);
  if (!wrapper) {
    return;
  }

  const li = Array.from(wrapper.querySelectorAll("li.xwd__clue--li")).find(
    (li) => li.querySelector(".xwd__clue--label")?.textContent === number
  );
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
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        if (gotoBuffer.length > 0) {
          goToClue(gotoBuffer);
        }
        gotoBuffer = null;
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        gotoBuffer = null;
        return;
      }

      // Any other key cancels the buffer and falls through normally.
      gotoBuffer = null;
    }

    if (event.key === "G") {
      event.preventDefault();
      event.stopPropagation();
      gotoBuffer = "";
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
