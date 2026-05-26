const { exec } = require("child_process");
const clipboard = require("clipboardy").default;
const { keyboard, Key } = require("@nut-tree-fork/nut-js");

async function focusOrOpenChatGPT(prompt = "") {
  try {
    console.log("Launching ChatGPT...");

    exec(
      '"C:\\Users\\user\\AppData\\Local\\Programs\\ChatGPT\\ChatGPT.exe"'
    );

    if (!prompt) return;

    await clipboard.write(prompt);

    console.log("Clipboard updated");

    // WAIT FOR CHATGPT TO FULLY OPEN
    setTimeout(async () => {

      console.log("Trying focus sequence");

      // MULTIPLE TABS TO FORCE INPUT FOCUS
      for (let i = 0; i < 3; i++) {
        await keyboard.pressKey(Key.Tab);
        await keyboard.releaseKey(Key.Tab);
      }

      // SMALL DELAY
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log("Trying CTRL+V");

      // HOLD CTRL
      await keyboard.pressKey(Key.LeftControl);

      // PRESS V
      await keyboard.pressKey(Key.V);
      await keyboard.releaseKey(Key.V);

      // RELEASE CTRL
      await keyboard.releaseKey(Key.LeftControl);

      console.log("Paste complete");

      // WAIT BEFORE ENTER
      await new Promise(resolve => setTimeout(resolve, 1200));

      console.log("Pressing Enter");

      await keyboard.pressKey(Key.Enter);
      await keyboard.releaseKey(Key.Enter);

      console.log("Prompt submitted");

    }, 5000);

  } catch (error) {
    console.error("AUTOMATION ERROR:", error);
  }
}

module.exports = {
  focusOrOpenChatGPT,
};