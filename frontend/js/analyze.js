document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    analyzeBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('resumeFiles');
        const jobDesc = document.getElementById('jobDescription').value;

        if (fileInput.files.length === 0 || jobDesc.trim() === "") {
            alert("Please upload at least one resume and paste a job description.");
            return;
        }

        // Show Loading UI
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        
        // Animated text sequence to look professional
        const loadingMessages = ["Extracting text from files...", "Running NLP Models...", "Calculating Cosine Similarity...", "Ranking Candidates..."];
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            loadingText.textContent = loadingMessages[msgIndex];
        }, 1500);

        // Prepare Data
        const formData = new FormData();
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('resumes', fileInput.files[i]);
        }
        formData.append('job_description', jobDesc);

        try {
            // Actual Backend Call
            const response = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                body: formData
            });
            
            clearInterval(msgInterval);
            
            if(!response.ok) throw new Error("Server Error");
            
            const data = await response.json();
            
            // Save data locally to pass to dashboard
            localStorage.setItem('scanResults', JSON.stringify(data));
            
            loadingText.textContent = "Analysis Complete! Redirecting...";
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);

        } catch (error) {
            clearInterval(msgInterval);
            console.error('Error:', error);
            alert("Error connecting to backend. Make sure Flask is running!");
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
    });
});