// Download Image utility
function downloadImage(url, filename) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || 'generated-image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        });
}

// Copy Image utility (bugged)
async function copyImageToClipboard(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();

        // Try the newer Clipboard API first
        if (navigator.clipboard?.write) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
                showToast('Image copied to clipboard!');
                return;
            } catch (e) {
                console.warn('Clipboard API write failed, trying alternative method:', e);
            }
        }

        // Fallback method using canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
                showToast('Image copied to clipboard!');
            } catch (e) {
                console.error('Failed to copy image:', e);
                showToast('Failed to copy image. Try using the download button instead.', true);
            }
        });
    } catch (error) {
        console.error('Error copying image:', error);
        showToast('Failed to copy image. Try using the download button instead.', true);
    }
}

// Copy Image URL utility
function copyURLToClipboard(text) {
    const encodedText = encodeURI(text);
    navigator.clipboard.writeText(encodedText).then(() => {
        showToast('URL Copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy', true);
    });
}

// Utility function to show toast notifications used by imageAction functions
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${isError ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateY(150%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}
