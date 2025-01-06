// Generate random seed
function generateSeed() {
    return Math.floor(Math.random() * 1000000);
}

// Handle image generation
async function generateImage(prompt, width = 1024, height = 1024) {
    const seed = generateSeed();
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=True`;
}

// Helper function to convert URL to base64
async function urlToBase64(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        throw error;
    }
}