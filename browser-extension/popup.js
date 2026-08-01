const SENTRYNX_URL = "https://your-sentrynx-domain.example/ai";
document.querySelector("#check").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) chrome.tabs.create({ url: `${SENTRYNX_URL}?domain=${encodeURIComponent(tab.url)}` });
});
