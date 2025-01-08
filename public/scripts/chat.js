// Configure marked to use Prism.js
marked.setOptions({
    highlight: function (code, lang) {
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        } else {
            return Prism.highlight(code, Prism.languages.autoit, 'autoit');
        }
    }
});

// Configure Prism Autoloader
Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';

const messagesContainer = document.getElementById('messagesContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const stopButton = document.getElementById('stopButton');

let currentController = null;

// Conversation history
let conversationHistory = [];
let typingInstance = null;

// Add a message to the chat
function addMessage(content, isUser = false, imageData = null) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'mb-4'; // Add margin bottom for spacing

    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start';

    const iconDiv = document.createElement('div');
    iconDiv.className = isUser ? 'flex-shrink-0 bg-green-500 rounded-lg p-2' : 'flex-shrink-0 bg-blue-500 rounded-lg p-2';

    const icon = isUser ?
        '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.754 14a2.249 2.249 0 0 1 2.25 2.249v.918a2.75 2.75 0 0 1-.513 1.599C17.945 20.929 15.42 22 12 22c-3.422 0-5.945-1.072-7.487-3.237a2.75 2.75 0 0 1-.51-1.595v-.92a2.249 2.249 0 0 1 2.249-2.25h11.501ZM12 2.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#00330d"/></svg>' :
        '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.753 14a2.25 2.25 0 0 1 2.25 2.25v.905a3.75 3.75 0 0 1-1.307 2.846C17.13 21.345 14.89 22 12 22c-2.89 0-5.128-.656-6.691-2a3.75 3.75 0 0 1-1.306-2.843v-.908A2.25 2.25 0 0 1 6.253 14h11.5ZM11.898 2.008 12 2a.75.75 0 0 1 .743.648l.007.102V3.5h3.5a2.25 2.25 0 0 1 2.25 2.25v4.505a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25V5.75A2.25 2.25 0 0 1 7.75 3.5h3.5v-.749a.75.75 0 0 1 .648-.743L12 2l-.102.007ZM9.75 6.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Zm4.493 0a1.25 1.25 0 1 0 0 2.499 1.25 1.25 0 0 0 0-2.499Z" fill="#d6e6ff"/></svg>';

    iconDiv.innerHTML = icon;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ml-2 lg:ml-4 bg-gray-100 rounded-lg p-4 max-w-[85%]';

    // Generate unique ID for typing animation
    const messageId = `message-${Date.now()}`;

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    if (isUser) {
        const escapedContent = escapeHtml(content);
        // For user messages, we wrap in a pre tag to preserve whitespace and newlines
        contentDiv.innerHTML = `<pre class="text-gray-800 break-anywhere whitespace-pre-wrap font-sans">${escapedContent}</pre>`;
    } else {
        let contentHtml = `<div class="text-gray-800 dark:text-gray-200 markdown-content"><span id="${messageId}"></span></div>`;

        // Add image section if imageData is provided
        if (imageData) {
            contentHtml += `
                        <div class="mt-4 image-generation">
                            <div class="image-generation-info">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.75 3A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3h11.5Zm.58 16.401-5.805-5.686a.75.75 0 0 0-.966-.071l-.084.07-5.807 5.687c.182.064.378.099.582.099h11.5c.203 0 .399-.035.58-.099l-5.805-5.686L18.33 19.4ZM17.75 4.5H6.25A1.75 1.75 0 0 0 4.5 6.25v11.5c0 .208.036.408.103.594l5.823-5.701a2.25 2.25 0 0 1 3.02-.116l.128.116 5.822 5.702c.067-.186.104-.386.104-.595V6.25a1.75 1.75 0 0 0-1.75-1.75Zm-2.498 2a2.252 2.252 0 1 1 0 4.504 2.252 2.252 0 0 1 0-4.504Zm0 1.5a.752.752 0 1 0 0 1.504.752.752 0 0 0 0-1.504Z" fill="currentcolor"/>
                                </svg>
                                <div class="image-info-text">
                                    <div class="prompt">${imageData.prompt}</div>
                                    <div class="dimensions">${imageData.width} × ${imageData.height}</div>
                                </div>
                            </div>
                            <div class="loading-spinner">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <div id="${messageId}-image" class="max-w-full overflow-hidden rounded-lg"></div>
                        </div>
                    `;
        }

        contentDiv.innerHTML = contentHtml;
    }

    messageDiv.appendChild(iconDiv);
    messageDiv.appendChild(contentDiv);
    messageWrapper.appendChild(messageDiv);

    if (!isUser) {
        // Add response utils after the message div
        const utilsDiv = document.createElement('div');
        utilsDiv.className = 'response-utils';
        utilsDiv.innerHTML = `
                    <button onclick="copyOriginalResponse(this)" title="Copy original response" data-message-id="${messageId}">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Z" fill="currentcolor"/>
                        </svg>
                        Copy
                    </button>
                    <button onclick="speakResponse(this)" title="Read aloud" data-message-id="${messageId}">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.704 3.442c.191.226.296.512.296.808v15.502a1.25 1.25 0 0 1-2.058.954L7.975 16.5H4.25A2.25 2.25 0 0 1 2 14.25v-4.5A2.25 2.25 0 0 1 4.25 7.5h3.725l4.968-4.204a1.25 1.25 0 0 1 1.761.147Zm2.4 5.198a.75.75 0 0 1 1.03.25c.574.94.862 1.992.862 3.14 0 1.149-.288 2.201-.862 3.141a.75.75 0 1 1-1.28-.781c.428-.702.642-1.483.642-2.36 0-.876-.214-1.657-.642-2.359a.75.75 0 0 1 .25-1.03Z" fill="currentcolor"/>
                        </svg>
                        Speak
                    </button>
                    <span class="model-badge">${modelSelect.value}</span>
                `;
        messageWrapper.appendChild(utilsDiv);

        // Store original response in a data attribute
        messageWrapper.dataset.originalResponse = content;
    }

    messagesContainer.appendChild(messageWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Initialize typing animation for AI responses
    if (!isUser) {
        typingInstance = new Typed(`#${messageId}`, {
            strings: [marked.parse(content)],
            typeSpeed: -150,
            showCursor: false,
            html: true,
            onStringTyped: scrollToBottom,
            onComplete: () => {
                Prism.highlightAll();
                addCopyButtons();
                enableInput();
                scrollToBottom();
            }
        });
    } else {
        setTimeout(scrollToBottom, 100);
    }

    // Handle image loading if present
    if (imageData) {
        generateImage(imageData.prompt, imageData.width, imageData.height)
            .then(async imageUrl => {
                const base64Image = await urlToBase64(imageUrl);
                if (base64Image) {
                    const imageContainer = document.getElementById(`${messageId}-image`);
                    const errorContainer = document.getElementById(`${messageId}-error`);
                    const spinner = imageContainer.parentElement.querySelector('.loading-spinner');

                    if (imageContainer) {
                        attachImageWithTools(imageContainer, base64Image, imageUrl, imageData.prompt);
                        if (spinner) spinner.remove();
                        if (errorContainer) errorContainer.classList.add('hidden');
                    }
                } else {
                    throw new Error('Failed to convert image to base64');
                }
            })
            .catch(error => {
                const imageContainer = document.getElementById(`${messageId}-image`);
                const errorContainer = document.getElementById(`${messageId}-error`);
                const spinner = document.querySelector('.loading-spinner');
                if (errorContainer) {
                    errorContainer.classList.remove('hidden');
                }
                if (spinner) spinner.remove();
                imageContainer.innerHTML = `<p class="text-red-500">Failed to load image: ${error.message}</p>`;
            });
    }
}

// Add copy buttons to code blocks
function addCopyButtons() {
    document.querySelectorAll('pre').forEach((pre) => {
        if (!pre.querySelector('.copy-button') && pre.querySelector('code')) {
            const button = document.createElement('button');
            button.className = 'copy-button bg-gray-800 text-white px-2 py-1 rounded absolute top-2 right-2';
            button.innerText = 'Copy';
            button.addEventListener('click', () => {
                const code = pre.querySelector('code').innerText;
                navigator.clipboard.writeText(code).then(() => {
                    button.innerText = 'Copied!';
                    setTimeout(() => {
                        button.innerText = 'Copy';
                    }, 2000);
                });
            });
            pre.style.position = 'relative';
            pre.appendChild(button);
        }
    });
}

// Disable input and show stop button
function disableInput() {
    messageInput.disabled = true;
    sendButton.style.display = 'none';
    stopButton.style.display = 'block';
}

// Update the enableInput function
function enableInput() {
    messageInput.disabled = false;
    sendButton.style.display = 'block';
    stopButton.style.display = 'none';
}

// Add new scroll function
function scrollToBottom(smooth = true) {
    if (messagesContainer) {
        const scrollBehavior = smooth ? 'smooth' : 'auto';
        messagesContainer.scroll({
            top: messagesContainer.scrollHeight,
            behavior: scrollBehavior,
        });
    }
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    messageInput.value = '';
    disableInput();

    try {
        conversationHistory.push({ role: 'user', content: message });
        const requestBody = {
            messages: [
                { role: 'system', content: UNIFIED_SYSTEM_MESSAGE },
                ...conversationHistory
            ],
            model: modelSelect.value,
            seed: generateSeed(),
            response_format: {
                type: "json_object"
            }
        };

        // Remove the seed parameter if the current model is 'deepseek'
        if (modelSelect.value === 'deepseek') {
            delete requestBody.response_format;
        }

        const response = await fetch('https://openai.jabirproject.org/v1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.text();
        const parsedResponse = JSON.parse(data);

        // Add AI's text response
        if (parsedResponse.response) {
            // Pass image data to addMessage if present
            const imageData = parsedResponse.image?.generate ? {
                prompt: parsedResponse.image.prompt,
                width: parsedResponse.image.width || 1024,
                height: parsedResponse.image.height || 1024
            } : null;

            addMessage(parsedResponse.response, false, imageData);
        }

        conversationHistory.push({
            role: 'assistant',
            content: JSON.stringify(parsedResponse)
        });

    } catch (error) {
        console.log(error);
        addMessage('Sorry, there was an error processing your request.');
    }
});

// Handle stop button click
stopButton.addEventListener('click', () => {
    if (typingInstance) {
        // Get the current text before destroying the instance
        const currentSpan = document.querySelector('.typed-cursor')?.parentElement;
        const currentText = currentSpan?.querySelector('.typed')?.innerHTML || currentSpan?.innerHTML || '';

        // Stop the typing animation
        typingInstance.destroy();
        typingInstance = null;

        // Preserve the current text state
        if (currentSpan) {
            // Remove the typing cursor
            const cursor = currentSpan.querySelector('.typed-cursor');
            if (cursor) cursor.remove();

            // Set the current text
            currentSpan.innerHTML = currentText;

            // Apply syntax highlighting and add copy buttons
            Prism.highlightAll();
            addCopyButtons();
        }

        enableInput();
        scrollToBottom();
    }
});

// Helper Function to attach images
function attachImageWithTools(imageContainer, base64Image, originalUrl, prompt) {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-container p-0 lg:p-2';
    wrapper.innerHTML = `
                <img src="${base64Image}" alt="${prompt}" class="chat-image rounded-lg shadow-lg">
                <div class="image-utils">
                    <button onclick="downloadImage('${base64Image}', 'generated-image.png')" title="Download Image">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.25 20.5h13.498a.75.75 0 0 1 .101 1.493l-.101.007H5.25a.75.75 0 0 1-.102-1.494l.102-.006h13.498H5.25Zm6.633-18.498L12 1.995a1 1 0 0 1 .993.883l.007.117v12.59l3.294-3.293a1 1 0 0 1 1.32-.083l.094.084a1 1 0 0 1 .083 1.32l-.083.094-4.997 4.996a1 1 0 0 1-1.32.084l-.094-.083-5.004-4.997a1 1 0 0 1 1.32-1.498l.094.083L11 15.58V2.995a1 1 0 0 1 .883-.993L12 1.995l-.117.007Z" fill="currentcolor"/></svg>
                    </button>
                    <button onclick="copyImageToClipboard('${base64Image}')" title="Copy Image">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Z" fill="currentcolor"/></svg>
                    </button>
                    <button onclick="copyURLToClipboard('${originalUrl}')" title="Copy URL">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 7a1 1 0 0 1 .117 1.993L9 9H7a3 3 0 0 0-.176 5.995L7 15h2a1 1 0 0 1 .117 1.993L9 17H7a5 5 0 0 1-.217-9.995L7 7h2Zm8 0a5 5 0 0 1 .217 9.995L17 17h-2a1 1 0 0 1-.117-1.993L15 15h2a3 3 0 0 0 .176-5.995L17 9h-2a1 1 0 0 1-.117-1.993L15 7h2ZM7 11h10a1 1 0 0 1 .117 1.993L17 13H7a1 1 0 0 1-.117-1.993L7 11h10H7Z" fill="currentcolor"/></svg>
                    </button>
                </div>
            `;
    imageContainer.innerHTML = '';
    imageContainer.appendChild(wrapper);
}
