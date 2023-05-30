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
  // Get blocked websites from storage
  chrome.storage.sync.get("blockedWebsitesList", ({ blockedWebsitesList }) => {
    chrome.storage.sync.get("active", ({ active }) => {
      const action = active ? "block" : "allow";

      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: blockedWebsitesList.map((website, index) => ({
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
  });
}

setupBlocker();

chrome.runtime.onMessage.addListener((request) => {
  if (request.method === "toggle") {
    setupBlocker();
  }
});
