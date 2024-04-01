chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'summarizeText') {
        fetch('http://localhost:3000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: request.text })
        })
        .then(response => response.json())
        .then(data => {
            sendResponse({ command: 'processedText', boxId: request.boxId, processedText: data.text });
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ error: 'Error occurred while summarizing the text.' });
        });

        // keeps the message channel open until sendResponse is called
        return true;
    }
});
