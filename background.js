const resourceTypes = [
  "csp_report",
  "font",
  "image",
  "main_frame",
  "media",
  "object",
  "other",
  "ping",
  "script",
  "stylesheet",
  "sub_frame",
  "webbundle",
  "websocket",
  "webtransport",
  "xmlhttprequest",
];
function setupBlocker() {
  let blockedWebsites = [];
  let startTime = null;
  let endTime = null;
  // Get blocked websites from storage
  chrome.storage.sync.get("blockedWebsites", (data) => {
    const body = JSON.parse(data.blockedWebsites);
    if (body) {
      blockedWebsites = body.blockedWebsites.split(",").filter((x) => !!x);
      startTime = body.startTime;
      endTime = body.endTime;
    }
    let action = "allow";
    if (startTime && endTime) {
      // add dynamic rules only between 8am and 5pm
      const now = new Date();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startTime.split(":")[0],
        startTime.split(":")[1]
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endTime.split(":")[0],
        endTime.split(":")[1]
      );
      if (now > start && now < end) {
        action = "block";
      }
    }
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: blockedWebsites.map((website, index) => ({
        id: 1000 + index,
        priority: 1,
        action: {
          type: action,
        },
        condition: {
          urlFilter: website,
          resourceTypes,
        },
      })),
      removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1).map(
        (_, index) => 1000 + index
      ),
    });
  });
}

setupBlocker();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "rerender") {
    console.log("rerendering");
    setupBlocker();
  }
});

// function tick() {
//     // Re-calculate the timestamp for the next day
//     let next = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     // Adjust the timestamp if you want to run the code
//     // around the same time of each day (e.g. 10:00 am)
//     next.setHours(10);
//     next.setMinutes(0);
//     next.setSeconds(0);
//     next.setMilliseconds(0);

//     // Save the new timestamp
//     localStorage.savedTimestamp = next.getTime();

//     // Run the function
//     doSomething();
// }

// function checkTimestamp() {
//     if (localStorage.savedTimestamp) {
//         let timestamp = parseInt(localStorage.savedTimestamp);

//         if (Date.now() >= timestamp) {
//             tick();
//         }
//     } else {
//         // First time running
//         tick();
//     }
// }

// // Check every minute
// setInterval(checkTimestamp, 60000);
