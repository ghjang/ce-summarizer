chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'summarizeText') {
        const textarea = document.getElementById('prompt-textarea');
        if (textarea) {
            textarea.value = `다음 텍스트의 내용이 무엇에 대한 내용인지 한글로 짧게 요약 부탁해.
부가적인 불필요한 문구등은 최대한 자제해서 표현해 주는 것이 좋겠어.
'해당 텍스트는'과 같은 시작 표현은 필요 없고, 해당 텍스트에 대한 내용을 곧바로 요약해주었으면해:

${request.text}\n`;

            const observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'childList') {
                        for (let node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BUTTON') {
                                const span = node.querySelector('span[data-state]');
                                if (span) {
                                    const divs = document.querySelectorAll('div[data-testid^="conversation-turn-"]');
                                    const lastDiv = divs[divs.length - 1];
                                    const text = lastDiv.innerText.replace(/^ChatGPT\n/gm, '').trim();
                                    chrome.runtime.sendMessage({ command: 'processedText', senderTabId: request.senderTabId, boxId: request.boxId, processedText: text });
                                    observer.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                });
            });

            observer.observe(textarea.parentNode, { childList: true });
        }
        sendResponse({ message: 'Please check the ChatGPT tab.' });
    }
});