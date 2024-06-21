console.log("FilterMLT is running...");

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
  // mail.google.com
  function filterGmail(baseUrl) {
    let main = document.querySelector("div[role=main]");
    if (main) {
      let el = main.querySelector("span[email]");
      if (el) {
        let senderEmail = el.getAttribute("email");
        let querySearch = "from:(" + senderEmail + ")";
        let queryUrl = baseUrl + "#search/" + querySearch;

        console.log("Redirecting to: " + queryUrl);
        window.location.href = queryUrl;
      }
    }
  }

  // app.fastmail.com
  function filterFastmail(baseUrl) {
    let h2 = document.querySelector("h2.v-MessageCard-from");
    if (h2 && h2.title) {
      let composeButton = document.querySelector("a.s-new-message");
      if (composeButton && composeButton.href) {
        let userId = composeButton.href.match(/\?u=(\d+)/)[1];
        let queryUrl =
          baseUrl + "search:" + encodeURIComponent(h2.title) + "/?u=" + userId;

        console.log("Redirecting to: " + queryUrl);
        window.location.href = queryUrl;
      } else {
        console.warn("Compose button not found");
      }
    } else {
      console.warn("Sender email not found");
    }
  }

  // betaapp.fastmail.com
  function filterFastmailBeta(baseUrl) {
    filterFastmail(baseUrl);
  }

  console.log("Filtering messages from sender...");

  let href = window.location.href;
  var m = href.match(/(https:\/\/mail\.google\.com\/mail\/u\/\d+\/)/);
  if (m) {
    console.log("Filtering Gmail");
    filterGmail(m[1]);
    return;
  }

  m = href.match(/(https:\/\/app\.fastmail\.com\/mail\/).*/);
  if (m) {
    console.log("Filtering Fastmail");
    filterFastmail(m[1]);
    return;
  }

  m = href.match(/(https:\/\/betaapp\.fastmail\.com\/mail\/).*/);
  if (m) {
    console.log("Filtering Fastmail Beta");
    filterFastmailBeta(m[1]);
    return;
  }

  console.warn(`Unrecognized email service: ${href}`);
}
