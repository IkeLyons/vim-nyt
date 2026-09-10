console.log("[vim-nyt] content script loaded");

document.addEventListener("keydown", (event) => {
  console.log("[vim-nyt] keydown:", event.key);
});
