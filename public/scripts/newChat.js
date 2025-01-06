// Add the new chat functionality
const newChatButton = document.getElementById('newChatButton');

function startNewChat() {
    conversationHistory = [];
    messagesContainer.innerHTML = '';

    // Add the default welcome message
    const welcomeMessage = `
                <div class="flex items-start">
                    <div class="flex-shrink-0 bg-blue-500 rounded-lg p-2">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="ml-4 bg-gray-100 rounded-lg p-4 max-w-[85%]">
                        <p class="text-gray-800">Hello! I'm your AI assistant. Choose a model and start chatting!</p>
                    </div>
                </div>
            `;
    messagesContainer.innerHTML = welcomeMessage;

    messageInput.value = '';
    enableInput();
}

newChatButton.addEventListener('click', startNewChat);