// Speech Recognition Setup
const micButton = document.getElementById('micButton');
let recognition = null;
let isRecording = false;

// Initialize speech recognition
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micButton.style.display = 'none';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        micButton.classList.add('recording');
        messageInput.placeholder = 'Listening...';
    };

    recognition.onend = () => {
        isRecording = false;
        micButton.classList.remove('recording');
        messageInput.placeholder = 'Type your message here...';
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        messageInput.value = transcript;
    };

    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            return;
        }
        console.error('Speech recognition error:', event.error);
        showToast(`Error: ${event.error}`, true);
        stopRecording();
    };
}

// Handle recording start/stop
function toggleRecording() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (!recognition) {
        showToast('Speech recognition is not supported in your browser', true);
        return;
    }

    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    messageInput.value = '';
    recognition.start();
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
    }
}

micButton.addEventListener('click', toggleRecording);
initSpeechRecognition();