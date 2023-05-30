document.addEventListener("DOMContentLoaded", async function () {
  async function init() {
    // INIT
    let blockedWebsites = [];
    let startTime = null;
    let endTime = null;
    await chrome.storage.sync.get("blockedWebsites", (data) => {
      const body = JSON.parse(data.blockedWebsites);
      if (body) {
        blockedWebsites = body.blockedWebsites;
        startTime = body.startTime;
        endTime = body.endTime;
      }
      let blockedWebsitesObject = document.querySelector("#block-list");

      let startTimeObject = document.querySelector("#start-time");
      let endTimeObject = document.querySelector("#end-time");

      if (blockedWebsites && blockedWebsites.length > 0) {
        blockedWebsitesObject.value = blockedWebsites.replace(/,/g, "\n");
      }
      if (startTime) {
        startTimeObject.value = startTime;
      }
      if (endTime) {
        endTimeObject.value = endTime;
      }
    });
  }
  await init();

  document
    .querySelector("#myForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var blockedWebsites = document.querySelector("#block-list").value || "";
      var startTime = document.querySelector("#start-time").value || null;
      var endTime = document.querySelector("#end-time").value || null;
      const body = {
        startTime,
        endTime,
        blockedWebsites: blockedWebsites.replace(/\n/g, ","),
      };
      chrome.storage.sync.set(
        { blockedWebsites: JSON.stringify(body) },
        function () {
          console.log("Value is set to " + JSON.stringify(body, null, 2));
          chrome.runtime.sendMessage({ method: "rerender" });
        }
      );
    });
});
