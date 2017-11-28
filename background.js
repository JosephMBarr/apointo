var sco = "no";
chrome.runtime.onInstalled.addListener(function() {
	  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
	    chrome.declarativeContent.onPageChanged.addRules([
	      {

	        conditions: [
	          new chrome.declarativeContent.PageStateMatcher({
	            pageUrl: {
	            	urlMatches: 'powerschool',
	            	urlContains: 'scores.html'
	        	},
	          })
	        ],
	        actions: [ new chrome.declarativeContent.ShowPageAction() ]
	      }
	    ]);
	  });
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.arr)
      sco = request.arr
  });
