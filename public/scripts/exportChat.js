const exportButton = document.getElementById('exportButton');
const exportMenu = document.getElementById('exportMenu');

// Toggle export menu
exportButton.addEventListener('click', () => {
    exportMenu.classList.toggle('show');
});

// Close export menu when clicking outside
document.addEventListener('click', (e) => {
    if (!exportButton.contains(e.target)) {
        exportMenu.classList.remove('show');
    }
});

// Export chat function
async function exportChat(format) {
    const messages = Array.from(messagesContainer.children);

    switch (format) {
        case 'pdf':
            await exportToPDF(messages);
            break;
        case 'image':
            await exportToImage(messages);
            break;
        case 'json':
            await exportToJSON(messages);
            break;
        case 'txt':
            await exportToTXT(messages);
            break;
    }

    exportMenu.classList.remove('show');
}

// PDF export function
async function exportToPDF(messages) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Save current scroll position
    const scrollPos = messagesContainer.scrollTop;

    // Get the current background color of the chat container
    const chatBackgroundColor = getComputedStyle(messagesContainer.parentElement).backgroundColor;

    // Temporarily modify container for full capture
    const originalStyle = messagesContainer.style.cssText;
    messagesContainer.style.height = 'auto';
    messagesContainer.style.overflow = 'visible';

    // Create canvas
    const canvas = await html2canvas(messagesContainer, {
        backgroundColor: chatBackgroundColor,
        height: messagesContainer.scrollHeight,
        windowHeight: messagesContainer.scrollHeight,
        scrollY: -window.scrollY
    });

    // Restore container style
    messagesContainer.style.cssText = originalStyle;
    messagesContainer.scrollTop = scrollPos;

    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions to fit page width
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add pages as needed
    const pageHeight = doc.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
    }

    doc.save('chat-export.pdf');
}

// Image export function
async function exportToImage(messages) {
    // Save current scroll position
    const scrollPos = messagesContainer.scrollTop;

    // Temporarily modify container for full capture
    const originalStyle = messagesContainer.style.cssText;
    messagesContainer.style.background = 'transparent';
    messagesContainer.style.height = 'auto';
    messagesContainer.style.overflow = 'visible';

    // Create canvas
    const canvas = await html2canvas(messagesContainer, {
        backgroundColor: null,
        height: messagesContainer.scrollHeight,
        windowHeight: messagesContainer.scrollHeight,
        scrollY: -window.scrollY
    });

    // Restore container style
    messagesContainer.style.cssText = originalStyle;
    messagesContainer.scrollTop = scrollPos;

    // Download image
    const link = document.createElement('a');
    link.download = 'chat-export.png';
    link.href = canvas.toDataURL();
    link.click();
}

// TXT Export Function
async function exportToTXT(messages) {
    let txtContent = '=== AI Chat Export ===\n\n';

    for (const msg of conversationHistory) {
        const role = msg.role.toUpperCase();
        let content = msg.content;

        // Try to parse JSON content for assistant messages
        if (role === 'ASSISTANT') {
            try {
                const parsedContent = JSON.parse(content);
                content = parsedContent.response;

                // Add image information if present
                if (parsedContent.image && parsedContent.image.generate) {
                    content += `\n[Generated Image: ${parsedContent.image.prompt}]`;
                }
            } catch (e) {
                // Use content as-is if parsing fails
            }
        }

        txtContent += `[${role}]:\n${content}\n\n`;
    }

    downloadFile(txtContent, 'chat-export.txt', 'text/plain');
}

// JSON export function
async function exportToJSON(messages) {
    const chatData = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    const dataStr = JSON.stringify(chatData, null, 2);
    downloadFile(dataStr, 'chat-export.json', 'application/json');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}