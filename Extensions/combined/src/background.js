const api = getBrowser();

function getBrowser() {
	if (typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined") {
		return chrome
	} else if (
		typeof browser !== "undefined" &&
		typeof browser.runtime !== "undefined"
	) {
		return browser
	} 
	else {
		console.log("browser is not supported");
		return false
	}
}

api.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "redirect") {
            console.log('url: '+ request.url);
            api.tabs.query({currentWindow: true, active: true}, function (tab) {
                const url=request.url.replace('twitter.com','nitter.nixnet.services');
                api.tabs.update(tab.id, {url: url});
            });
        }
    }
);

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.startsWith('https://www.wildberries.ru/')) {
    api.tabs.sendMessage(tabId, {url: changeInfo.url});
  }
});