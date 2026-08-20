document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('resumeFiles');
    const fileCountText = document.getElementById('fileCount');

    // Click to open file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-active'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-active'), false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files; // Assign files to input
        updateFileText(files);
    });

    // Handle clicked files
    fileInput.addEventListener('change', (e) => {
        updateFileText(e.target.files);
    });

    function updateFileText(files) {
        if (files.length === 0) {
            fileCountText.textContent = "No files selected";
        } else if (files.length === 1) {
            fileCountText.textContent = files[0].name;
        } else {
            fileCountText.textContent = `${files.length} files selected ready for analysis`;
        }
    }
});