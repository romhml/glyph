;(async () => {
  if (chrome) {
    chrome.commands.onCommand.addListener(async (command) => {
      console.log(`Here: Dispatched command: ${command}`)
      await chrome.runtime.sendMessage({ command })
    })
  }
})()
