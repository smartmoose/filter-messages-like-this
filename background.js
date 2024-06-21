console.log("Background script running...");

chrome.commands.onCommand.addListener(function (command) {
  console.log("onCommand");
  if (command === "filter-messages") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: filterMessages,
      });
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  console.log("onClicked");
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: filterMessages,
  });
});

function filterMessages() {
  console.log("Filtering messages from sender...");
  let main = document.querySelector("div[role=main]");
  if (main) {
    let el = main.querySelector("span[email]");
    if (el) {
      let senderEmail = el.getAttribute("email");
      let querySearch = "from:(" + senderEmail + ")";

      let match = window.location.href.match(
        /(https:\/\/mail\.google\.com\/mail\/u\/\d+\/)/
      );
      if (match) {
        var queryUrl = match[0] + "#search/" + querySearch;
        window.location.href = queryUrl;
      } else {
        console.warn("Failed to parse current mail.google.com URL");
      }
    }
  }
}
