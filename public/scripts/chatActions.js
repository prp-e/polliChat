function copyOriginalResponse(button) {
    const messageWrapper = button.closest('.mb-4');
    const originalContent = messageWrapper.dataset.originalResponse;
    navigator.clipboard.writeText(originalContent).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = `
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                    </svg>
                    Copied!
                `;
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    });
}

function speakResponse(button) {
    const messageWrapper = button.closest('.mb-4');
    const textContent = messageWrapper.querySelector('.markdown-content').textContent;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        updateSpeakButton(button, false);
    } else {
        const utterance = new SpeechSynthesisUtterance(textContent);
        utterance.onend = () => updateSpeakButton(button, false);
        utterance.onstart = () => updateSpeakButton(button, true);
        window.speechSynthesis.speak(utterance);
    }
}

// Function to update the speak button based on the speaking state
function updateSpeakButton(button, isSpeaking) {
    if (isSpeaking) {
        button.innerHTML = `
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.75 3A1.75 1.75 0 0 0 3 4.75v14.5c0 .966.784 1.75 1.75 1.75h14.5A1.75 1.75 0 0 0 21 19.25V4.75A1.75 1.75 0 0 0 19.25 3H4.75Z" fill="currentcolor"/>
                    </svg>
                    Stop
                `;
    } else {
        button.innerHTML = `
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.704 3.442c.191.226.296.512.296.808v15.502a1.25 1.25 0 0 1-2.058.954L7.975 16.5H4.25A2.25 2.25 0 0 1 2 14.25v-4.5A2.25 2.25 0 0 1 4.25 7.5h3.725l4.968-4.204a1.25 1.25 0 0 1 1.761.147Zm2.4 5.198a.75.75 0 0 1 1.03.25c.574.94.862 1.992.862 3.14 0 1.149-.288 2.201-.862 3.141a.75.75 0 1 1-1.28-.781c.428-.702.642-1.483.642-2.36 0-.876-.214-1.657-.642-2.359a.75.75 0 0 1 .25-1.03Z" fill="currentcolor"/>
                    </svg>
                    Speak
                `;
    }
}
