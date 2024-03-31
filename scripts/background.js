chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'summarizeText') {
        chrome.tabs.query({}, function (tabs) {
            const openaiTab = tabs.find(tab => {
                const url = new URL(tab.url);
                return url.protocol === 'https:' && url.hostname === 'chat.openai.com';
            });
            if (openaiTab) {
                chrome.tabs.sendMessage(openaiTab.id, {
                    senderTabId: sender.tab.id,
                    chatgptTabId: openaiTab.id,
                    command: 'summarizeText',
                    text: request.text,
                    boxId: request.boxId
                }, function (response) {
                    sendResponse({ processedText: response.message });
                });
            } else {
                sendResponse({ error: 'No tab with URL https://chat.openai.com/ found.' });
            }
        });
        return true;
    } else if (request.command === 'processedText') {
        chrome.tabs.sendMessage(request.senderTabId, { command: 'processedText', boxId: request.boxId, processedText: request.processedText });
    }
});