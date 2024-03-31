let isActive = false;
let prevElement = null;
let prevColors = null;

function changeBackgroundColor(element, color) {
    const originalColors = { element: element, color: element.style.backgroundColor };
    element.style.backgroundColor = color;
    let childColors = [];
    for (let i = 0; i < element.children.length; i++) {
        childColors.push(changeBackgroundColor(element.children[i], color));
    }
    return { originalColors, childColors };
}

function restoreBackgroundColor(colors) {
    colors.originalColors.element.style.backgroundColor = colors.originalColors.color;
    for (let i = 0; i < colors.childColors.length; i++) {
        restoreBackgroundColor(colors.childColors[i]);
    }
}

window.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        isActive = !isActive;
        if (!isActive && prevElement) {
            restoreBackgroundColor(prevColors);
            prevElement = null;
            prevColors = null;
        }
    }
});

window.addEventListener('mousemove', function (event) {
    if (isActive) {
        const element = document.elementFromPoint(event.clientX, event.clientY);
        if (prevElement !== element) {
            if (prevElement) {
                prevElement.style.boxShadow = '';
                restoreBackgroundColor(prevColors);
            }
            if (element) {
                element.style.boxShadow = '0 0 5px 2px rgba(0, 0, 0, 0.5)';
                prevColors = changeBackgroundColor(element, 'rgba(0, 0, 0, 0.5)');
            }
            prevElement = element;
        }
    }
});

window.addEventListener('mouseout', function (event) {
    if (isActive && event.toElement === null && event.relatedTarget === null) {
        if (prevElement) {
            restoreBackgroundColor(prevColors);
            prevElement = null;
            prevColors = null;
        }
    }
});

window.addEventListener('mouseleave', function (event) {
    if (isActive) {
        if (prevElement) {
            prevElement.style.boxShadow = '';
            restoreBackgroundColor(prevColors);
            prevElement = null;
            prevColors = null;
        }
    }
});

let boxId = 0;

document.addEventListener('contextmenu', function (event) {
    if (isActive) {
        event.preventDefault();
        isActive = false;
        if (prevElement) {
            prevElement.style.boxShadow = '';
            restoreBackgroundColor(prevColors);
            prevElement = null;
            prevColors = null;
        }

        const boxWidth = 300;
        const boxHeight = 150;
        let left = event.clientX;
        let top = event.clientY;

        if (left + boxWidth > window.innerWidth) {
            left = window.innerWidth - boxWidth;
        }
        if (top + boxHeight > window.innerHeight) {
            top = window.innerHeight - boxHeight;
        }

        const box = document.createElement('div');
        box.style.position = 'fixed';
        box.style.left = `${left}px`;
        box.style.top = `${top}px`;
        box.style.width = `${boxWidth}px`;
        box.style.height = `${boxHeight}px`;
        box.style.backgroundColor = 'yellow';
        box.style.border = '1px solid black';
        box.style.resize = 'both';
        box.style.overflow = 'auto';

        const titleBar = document.createElement('div');
        titleBar.style.height = '15px';
        titleBar.style.backgroundColor = 'lightgray';
        titleBar.style.cursor = 'move';
        box.appendChild(titleBar);

        let dragOffsetX = 0;
        let dragOffsetY = 0;

        titleBar.addEventListener('mousedown', function (event) {
            dragOffsetX = event.clientX - box.offsetLeft;
            dragOffsetY = event.clientY - box.offsetTop;
            event.preventDefault();
        });

        window.addEventListener('mousemove', function (event) {
            if (event.buttons === 1 && event.target === titleBar) {
                box.style.left = `${event.clientX - dragOffsetX}px`;
                box.style.top = `${event.clientY - dragOffsetY}px`;
            }
        });

        const closeButton = document.createElement('button');
        closeButton.style.position = 'absolute';
        closeButton.style.left = '5px';
        closeButton.style.top = '2px';
        closeButton.style.width = '10px';
        closeButton.style.height = '10px';
        closeButton.style.borderRadius = '50%';
        closeButton.style.padding = '0';
        closeButton.style.backgroundColor = 'red';
        closeButton.style.border = '1px solid black';
        closeButton.addEventListener('click', function () {
            document.body.removeChild(box);
        });

        titleBar.appendChild(closeButton);

        const contentArea = document.createElement('div');
        contentArea.id = `contentArea${boxId}`; // 고유한 id 부여
        contentArea.style.padding = '10px';
        box.appendChild(contentArea);

        const text = event.target.innerText;
        chrome.runtime.sendMessage({ command: 'summarizeText', text: text, boxId: boxId }, function (response) {
            if (response) {
                if (response.error) {
                    contentArea.innerText = response.error;
                    return;
                }
                contentArea.innerText = response.processedText;
            }
        });

        document.body.appendChild(box);
        boxId++;
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'processedText') {
        const contentArea = document.getElementById(`contentArea${request.boxId}`);
        if (contentArea) {
            contentArea.innerText = request.processedText;
        }
    }
});
