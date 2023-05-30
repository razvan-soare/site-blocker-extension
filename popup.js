const DEFAULT_WEBSITES = [
  "https://www.facebook.com/",
  "https://www.youtube.com/",
  "https://www.reddit.com/",
  "https://www.instagram.com/",
  "https://www.twitter.com/",
  "https://www.tiktok.com/",
  "https://www.netflix.com/",
  "https://www.hulu.com/",
  "https://www.amazon.com/",
  "https://www.ebay.com/",
];
function setIconState({ active }) {
  if (active === true) {
    document.querySelector("#stop-enabled").classList.remove("hidden");
    document.querySelector("#stop-disabled").classList.add("hidden");
    chrome.action.setIcon({
      path: "./images/icons/favicon.ico",
    });
  } else {
    chrome.action.setIcon({
      path: "./images/icons/favicon-disabled.ico",
    });
    document.querySelector("#stop-enabled").classList.add("hidden");
    document.querySelector("#stop-disabled").classList.remove("hidden");
  }
}

function formatLabel(text) {
  return text
    .replace("https://www.", "")
    .replace("http://www.", "")
    .replace("https://", "")
    .replace("http://", "");
}

function recalculateActiveTags() {
  const blockedSites = document.querySelectorAll(".blocked-site-tag span");
  const blockedWebsitesList = Array.from(blockedSites).map(
    (site) => site.innerHTML
  );

  chrome.storage.sync.set(
    {
      blockedWebsitesList,
    },
    function () {
      chrome.runtime.sendMessage({ method: "toggle" });
    }
  );
}

function addTag(text) {
  const parent = document.querySelector("#blocked-sites-wrapper");
  const div = document.createElement("div");
  const tagId = Math.random().toString(36).substring(7);
  div.id = tagId;
  div.classList.add("blocked-site-tag");
  div.innerHTML = `<span>${formatLabel(text)}</span>`;

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.innerHTML = "X";
  deleteButton.addEventListener("click", function () {
    removeTag(tagId);
    recalculateActiveTags();
  });
  div.appendChild(deleteButton);
  parent.appendChild(div);
}
function removeTag(tagId) {
  const parent = document.querySelector("#blocked-sites-wrapper");
  const div = document.getElementById(tagId);
  parent.removeChild(div);
}

document.addEventListener("DOMContentLoaded", async function () {
  async function init() {
    await chrome.storage.sync.get(
      "blockedWebsitesList",
      ({ blockedWebsitesList }) => {
        const siteElements = document.querySelectorAll(".blocked-site-tag");
        if (siteElements?.length > 0) {
          // we already populated the items
          return null;
        }

        if (blockedWebsitesList?.length > 0) {
          blockedWebsitesList.forEach((site) => addTag(site));
        }
      }
    );

    chrome.storage.sync.get("active", ({ active }) => {
      setIconState({ active });
    });
  }
  await init();

  document
    .querySelector("#add-new-site")
    .addEventListener("click", function () {
      const input = document.querySelector("input#new-site");
      if (input.value === "") {
        return;
      }
      addTag(input.value);

      input.value = "";
      recalculateActiveTags();
    });

  document.querySelector("#start").addEventListener("click", function () {
    chrome.storage.sync.set({ active: true }, function () {
      chrome.runtime.sendMessage({ method: "toggle" });
    });

    setIconState({ active: true });
  });

  document.querySelector("#stop").addEventListener("click", function () {
    chrome.storage.sync.set({ active: false }, function () {
      chrome.runtime.sendMessage({ method: "toggle" });
    });

    setIconState({ active: false });
  });
});
