document.addEventListener(
  "DOMContentLoaded",
  () => {

    const mascotButton =
      document.getElementById(
        "mascotButton"
      );

    // Single-click opens ChatGPT
    mascotButton.addEventListener(
      "click",
      () => {
        window.mascotAPI.openChatGPT();
      }
    );

    // Right-click menu
    document.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();

        window.mascotAPI.showMenu();
      }
    );

  }
);