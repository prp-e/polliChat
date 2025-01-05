const modelSelect = document.getElementById('modelSelect');

// Add these new functions for model persistence
function saveModelPreference(model) {
    localStorage.setItem('preferredModel', model);
}

function loadModelPreference() {
    return localStorage.getItem('preferredModel');
}

// function to fetch available models
async function fetchModels() {
    try {
        const response = await fetch('https://text.pollinations.ai/models');
        const models = await response.json();
        // remove specific models (if exist any longer) because doesnot work properly with system commands
        // remove unity, midijourney, rtist, p1 and evil models
        const filteredModels = models.filter(model => !['unity', 'midijourney', 'rtist', 'evil', 'p1'].includes(model.name));
        modelSelect.innerHTML = filteredModels.map(filteredModels =>
            `<option value="${filteredModels.name}">${filteredModels.name}</option>`
        ).join('');

        // Set the previously selected model if it exists
        const preferredModel = loadModelPreference();
        if (preferredModel && modelSelect.querySelector(`option[value="${preferredModel}"]`)) {
            modelSelect.value = preferredModel;
        }
    } catch (error) {
        console.error('Error fetching models:', error);
        modelSelect.innerHTML = '<option value="openai">openai</option>';
    }
}

fetchModels();

// Add event listener for model selection
modelSelect.addEventListener('change', (e) => {
    saveModelPreference(e.target.value);
});
