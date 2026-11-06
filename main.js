const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  screen,
  Menu
} = require("electron");

const path = require("path");
const fs = require("fs");

let mascotWindow;
let alwaysOnTop = true;

const WINDOW_WIDTH = 190;
const WINDOW_HEIGHT = 280;

const CHATGPT_URL = "https://chatgpt.com";

// ==========================================
// SETTINGS
// ==========================================

function getSettingsPath() {
  return path.join(
    app.getPath("userData"),
    "settings.json"
  );
}

function loadSettings() {
  try {
    const file = getSettingsPath();

    if (fs.existsSync(file)) {
      return JSON.parse(
        fs.readFileSync(file, "utf8")
      );
    }
  } catch (error) {
    console.error("Settings load error:", error);
  }

  return {};
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(
      getSettingsPath(),
      JSON.stringify(settings, null, 2)
    );
  } catch (error) {
    console.error("Settings save error:", error);
  }
}

// ==========================================
// OPEN CHATGPT
// ==========================================

function openChatGPT() {
  shell.openExternal(CHATGPT_URL);
}

// ==========================================
// WINDOW POSITION
// ==========================================

function getInitialPosition() {
  const display = screen.getPrimaryDisplay();

  const { x, y, width, height } = display.workArea;

  const settings = loadSettings();

  const defaultX =
    x + width - WINDOW_WIDTH - 20;

  const defaultY =
    y + height - WINDOW_HEIGHT - 20;

  return {
    x: Number.isInteger(settings.x)
      ? settings.x
      : defaultX,

    y: Number.isInteger(settings.y)
      ? settings.y
      : defaultY
  };
}

// ==========================================
// CREATE FLOATING MASCOT
// ==========================================

function createMascotWindow() {
  const position = getInitialPosition();

  mascotWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,

    x: position.x,
    y: position.y,

    frame: false,
    transparent: true,

    backgroundColor: "#00000000",

    alwaysOnTop: true,

    resizable: false,
    maximizable: false,
    fullscreenable: false,

    skipTaskbar: true,

    show: false,

    hasShadow: false,

    webPreferences: {
      preload: path.join(
        __dirname,
        "preload.js"
      ),

      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mascotWindow.loadFile("index.html");

  mascotWindow.once("ready-to-show", () => {
    mascotWindow.show();
  });

  mascotWindow.setAlwaysOnTop(
    true,
    "floating"
  );

  // Show across macOS desktops
  if (process.platform === "darwin") {
    mascotWindow.setVisibleOnAllWorkspaces(
      true,
      {
        visibleOnFullScreen: true
      }
    );
  }

  // Prevent navigation inside mascot
  mascotWindow.webContents.on(
    "will-navigate",
    (event) => {
      event.preventDefault();
    }
  );

  mascotWindow.webContents.setWindowOpenHandler(
    () => ({
      action: "deny"
    })
  );

  // Save position
  mascotWindow.on("moved", () => {
    if (
      !mascotWindow ||
      mascotWindow.isDestroyed()
    ) {
      return;
    }

    const [x, y] =
      mascotWindow.getPosition();

    saveSettings({ x, y });
  });
}

// ==========================================
// CONTEXT MENU
// ==========================================

function showContextMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "Open ChatGPT",
      click: openChatGPT
    },

    {
      type: "separator"
    },

    {
      label: "Always on Top",
      type: "checkbox",
      checked: alwaysOnTop,

      click: (menuItem) => {
        alwaysOnTop = menuItem.checked;

        mascotWindow.setAlwaysOnTop(
          alwaysOnTop,
          "floating"
        );
      }
    },

    {
      type: "separator"
    },

    {
      label: "Exit Mascot",
      click: () => {
        app.quit();
      }
    }
  ]);

  menu.popup({
    window: mascotWindow
  });
}

// ==========================================
// IPC EVENTS
// ==========================================

ipcMain.on(
  "mascot:open-chatgpt",
  openChatGPT
);

ipcMain.on(
  "mascot:show-menu",
  showContextMenu
);

// ==========================================
// APP STARTUP
// ==========================================

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  createMascotWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});