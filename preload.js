const {
  contextBridge,
  ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
  "mascotAPI",
  {
    openChatGPT: () => {
      ipcRenderer.send(
        "mascot:open-chatgpt"
      );
    },

    showMenu: () => {
      ipcRenderer.send(
        "mascot:show-menu"
      );
    }
  }
);