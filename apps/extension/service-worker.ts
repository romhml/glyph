;(async () => {
  if (chrome) {
    chrome.commands.onCommand.addListener(async (command) => {
      console.log(`Service Worker: Dispatched command: ${command}`)
      await chrome.runtime.sendMessage({ command })
    })
  }
})()
