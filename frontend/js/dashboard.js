document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('dashboardGrid');
    
    grid.innerHTML = `
        <div id="col1Container" class="flex flex-col h-full"></div>
        <div id="col2Container" class="flex flex-col h-full animate-slide-up delay-200"></div>
        <div id="col3Container" class="flex flex-col gap-6 h-full animate-slide-up delay-300"></div>
    `;
    grid.className = "grid grid-cols-1 lg:grid-cols-3 gap-6";

    const rawData = localStorage.getItem('scanResults');

    if (!rawData) {
        grid.innerHTML = `<p class="text-red-500 col-span-3 text-center py-10 font-medium">No data found. Please run a scan first.</p>`;
        return;
    }

    const data = JSON.parse(rawData);
    window.candidateList = data.candidates || []; 
    window.currentJDText = data.job_description ? data.job_description.toLowerCase() : "";

    if (window.candidateList.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-3 text-center py-10">No candidates could be processed.</p>`;
        return;
    }

    // ==========================================
    // 🚀 TWO-WAY SMART SKILL EXTRACTOR 
    // ==========================================
    function extractCandidateSkills(text) {
        if (!text) return [];
        let extracted = new Set();

        // WAY 1: MASSIVE DICTIONARY SCAN
        const massiveSkillList = [
            'Python', 'SQL', 'Machine Learning', 'Data Analysis', 'JavaScript', 'HTML', 'CSS',
            'React', 'Node', 'Pandas', 'NumPy', 'SEO', 'Marketing', 'Excel', 'Engineering',
            'Electrical', 'AutoCAD', 'PLC', 'Servo Drives', 'Sensors', 'Panel Wiring',
            'Switchgear', 'Transformers', 'C++', 'Java', 'Django', 'Flask',
            'Data Visualization', 'Content Writing', 'Lead Generation', 'Algorithms',
            'Deep Learning', 'NLP', 'Google Ads', 'Email Campaigns', 'UI/UX'
        ];

        massiveSkillList.forEach(skill => {
            let escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) {
                extracted.add(skill);
            }
        });

        // WAY 2: STRICT HEADING SCAN
        const skillsRegex = /(?:\n|^)\s*(skills|technical skills|core competencies|expertise)\s*[:\n]([\s\S]*?)(?=(?:\n|^)\s*(experience|projects|education|personal details|objective|declaration|certifications|languages|hobbies)\s*[:\n]|$)/i;
        const match = text.match(skillsRegex);

        if (match && match[2]) {
            let rawItems = match[2].split(/[\n,•\-\|\*]/);
            rawItems.forEach(s => {
                let cleaned = s.replace(/[^a-zA-Z0-9\s#\+\-\.\/]/g, '').trim();
                const stop = ['and', 'the', 'for', 'with', 'from', 'this', 'have', 'experience'];
                if (cleaned.length > 2 && cleaned.length < 35 && !stop.includes(cleaned.toLowerCase())) {
                    extracted.add(cleaned);
                }
            });
        }

        let finalSkills = Array.from(extracted);
        return finalSkills.length > 0 ? finalSkills : ['General Profile'];
    }

    // ==========================================
    // TOP CANDIDATE (RANK 1) DATA - LOCKED
    // ==========================================
    const topCandidate = window.candidateList[0];
    const topName = topCandidate.candidate_name || topCandidate.filename;
    const topScore = topCandidate.match_score; 
    const displayTopScore = topScore.toFixed(1);

    let matchQuality = ""; let summaryText = ""; let aiInsight = "";
    let colorClass = ""; let bgColorClass = ""; let hexColor = ""; 

    if (topScore >= 70) {
        matchQuality = "✨ Excellent Match"; colorClass = "text-green-600"; bgColorClass = "bg-green-600"; hexColor = "#16a34a";
        summaryText = `Based on the analysis, <span class="border-b-2 border-green-300 text-green-800 bg-green-50 px-1 font-medium">${topName}</span> is the most suitable candidate.`;
        aiInsight = `"Candidate ${topName} demonstrates exceptional keyword overlap with the Job Description. Strong alignment found in core competencies."`;
    } else if (topScore >= 40) {
        matchQuality = "⚠️ Average Match"; colorClass = "text-yellow-600"; bgColorClass = "bg-yellow-500"; hexColor = "#eab308";
        summaryText = `Based on the analysis, <span class="border-b-2 border-yellow-300 text-yellow-800 bg-yellow-50 px-1 font-medium">${topName}</span> is the best available match, meeting basic requirements.`;
        aiInsight = `"Candidate ${topName} has the highest overlap with the JD among the pool, but might need training or lack specific required experience."`;
    } else {
        matchQuality = "❌ Poor Matches Overall"; colorClass = "text-red-600"; bgColorClass = "bg-red-600"; hexColor = "#dc2626";
        summaryText = `Based on the analysis, even the top profile <span class="border-b-2 border-red-300 text-red-800 bg-red-50 px-1 font-medium">${topName}</span> does NOT strongly match the job description.`;
        aiInsight = `"Candidate ${topName} shows low keyword similarity (${displayTopScore}%). The entire candidate pool lacks the core technical skills requested."`;
    }

    // ==========================================
    // COLUMN 1: INTERACTIVE LIST 
    // ==========================================
    let col1HTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div class="bg-[#2D8C6D] px-5 py-3 text-white font-medium flex justify-between items-center">
                <span>Ranked Candidates</span>
                <span class="text-sm bg-white/20 px-2 py-0.5 rounded">Matches</span>
            </div>
            <ul class="divide-y divide-gray-100 flex-grow overflow-y-auto">
    `;
    
    window.candidateList.forEach((cand, index) => {
        let cleanName = cand.candidate_name || cand.filename;
        let cScore = cand.match_score;
        let barColor = cScore >= 70 ? 'bg-green-500' : (cScore >= 40 ? 'bg-yellow-400' : 'bg-red-500');
        let textCol = cScore >= 70 ? 'text-green-600' : (cScore >= 40 ? 'text-yellow-600' : 'text-red-600');
        
        col1HTML += `
            <li id="candRow-${index}" onclick="updateSkillsOnly(${index})" class="cand-row p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-all group">
                <div class="flex items-center gap-3 w-7/12 overflow-hidden">
                    <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'} flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">${index + 1}</div>
                    <h4 class="font-medium text-gray-800 truncate" title="${cleanName}">${cleanName}</h4>
                    
                    <span onclick="event.stopPropagation(); openResumeModal(${index})" class="opacity-0 group-hover:opacity-100 bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-opacity text-xs font-bold flex-shrink-0 border border-blue-200">👁️ View</span>
                </div>
                
                <div class="w-4/12 flex flex-col items-end gap-1.5">
                    <span class="font-bold text-sm ${textCol}">${cScore.toFixed(1)}%</span>
                    <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full ${barColor} rounded-full transition-all duration-1000 ease-out" style="width: ${cScore}%"></div>
                    </div>
                </div>
            </li>
        `;
    });
    col1HTML += `</ul></div>`;
    document.getElementById('col1Container').innerHTML = col1HTML;

    // ==========================================
    // COLUMN 2: LOCKED TOP CANDIDATE SUMMARY
    // ==========================================
    document.getElementById('col2Container').innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div class="flex items-center gap-2 mb-4 ${colorClass} font-bold text-lg">${matchQuality}</div>
            <div class="flex justify-between items-center mb-6 border-b border-gray-100 pb-5">
                <div class="flex items-center gap-3">
                    
                    <div class="relative flex-shrink-0">
                        <div class="w-14 h-14 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 font-bold text-2xl shadow-sm">
                            ${topName.charAt(0).toUpperCase()}
                        </div>
                        <div class="absolute -top-2 -right-2 bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">TOP</div>
                    </div>

                    <div>
                        <h3 class="font-bold text-xl text-gray-800">${topName}</h3>
                        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5">Top Matched Profile</p>
                    </div>
                </div>
                <span class="font-extrabold ${colorClass} text-3xl">${displayTopScore}%</span>
            </div>
            <div class="mb-6 flex-grow">
                <h4 class="font-bold text-sm text-gray-800 mb-2 uppercase tracking-wide">AI Summary</h4>
                <p class="text-sm text-gray-600 leading-relaxed">${summaryText}</p>
            </div>
            
            <div id="dynamicSkillsContainer" class="bg-gray-50 p-4 rounded-lg border border-gray-100 transition-all duration-300">
                </div>
        </div>
    `;

    // ==========================================
    // COLUMN 3: LOCKED TOP CANDIDATE METRICS
    // ==========================================
    document.getElementById('col3Container').innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="${bgColorClass} px-5 py-2.5 text-white font-medium text-sm flex justify-between items-center">
                <span>Top Profile Performance</span>
                <span class="text-xs opacity-80">TF-IDF & Cosine</span>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-center mb-6 border-b border-gray-100 pb-6">
                    <div class="max-w-[50%]">
                        <h3 class="font-bold text-xl text-gray-800 truncate" title="${topName}">${topName}</h3>
                        <p class="text-xs text-gray-500 mt-1">Algorithm Confidence Score</p>
                    </div>
                    <div id="circleProgress" class="relative w-20 h-20 rounded-full flex items-center justify-center shadow-inner" style="background: conic-gradient(#f3f4f6 100%, #f3f4f6 0%);">
                        <div class="absolute w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span id="scoreCounter" class="font-bold text-xl ${colorClass}">0%</span>
                        </div>
                    </div>
                </div>
                <div class="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p class="text-xs text-blue-800 font-medium leading-relaxed">System calculated the similarity distance vector matching ${topName}'s resume data against the specific requirements.</p>
                </div>
            </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-grow">
            <h3 class="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                <span class="text-blue-500">✨</span> AI Insight (Rank 1)
            </h3>
            <div class="p-4 rounded-lg bg-gray-50 border-l-4 ${topScore >= 40 ? (topScore >= 70 ? 'border-green-500' : 'border-yellow-400') : 'border-red-500'}">
                <p class="text-sm text-gray-700 italic font-serif">"${aiInsight}"</p>
            </div>
        </div>
    `;

    let startTimestamp = null;
    const circleObj = document.getElementById('circleProgress');
    const textObj = document.getElementById('scoreCounter');
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / 1500, 1);
        const currentVal = (progress * topScore).toFixed(1);
        textObj.innerHTML = currentVal + "%";
        circleObj.style.background = `conic-gradient(${hexColor} ${currentVal}%, #f3f4f6 0%)`;
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);

    // ==========================================
    // DYNAMIC REVERSE-MATCH SKILLS UPDATER 
    // ==========================================
    window.updateSkillsOnly = function(index) {
        document.querySelectorAll('.cand-row').forEach(row => {
            row.classList.remove('border-l-4', 'border-blue-500', 'bg-blue-50');
        });
        const activeRow = document.getElementById(`candRow-${index}`);
        if(activeRow) activeRow.classList.add('border-l-4', 'border-blue-500', 'bg-blue-50');

        const activeCand = window.candidateList[index];
        const candName = activeCand.candidate_name || activeCand.filename;
        let textToSearch = activeCand.raw_text || activeCand.processed_text || "";
        
        let allCandidateSkills = extractCandidateSkills(textToSearch);
        
        const stopWords = ['and', 'the', 'for', 'with', 'from', 'this', 'that', 'have', 'experience', 'education', 'projects', 'personal', 'details', 'objective', 'summary', 'about', 'work', 'years', 'using', 'general profile'];

        let matchedSkills = allCandidateSkills.filter(skill => {
            let cleanSkill = skill.toLowerCase().trim();
            if(stopWords.includes(cleanSkill) || cleanSkill.length <= 2) return false; 
            
            // STRICT EXACT WORD MATCH
            let escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
            let regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
            return regex.test(window.currentJDText);
        });
        
        let skillsHTML = "";
        if (matchedSkills.length === 0) {
            skillsHTML = `<span class="text-sm text-gray-500 italic font-medium px-1">⚠️ No exact JD skills matched.</span>`;
        } else {
            skillsHTML = matchedSkills.map(s => `<span class="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-sm"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>${s}</span>`).join(' ');
        }

        const container = document.getElementById('dynamicSkillsContainer');
        if(container) {
            container.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">JD Matched Skills For:</h4>
                    <span class="text-[10px] font-bold text-white bg-gray-700 px-2 py-1 rounded max-w-[150px] truncate" title="${candName}">${candName}</span>
                </div>
                <div class="flex flex-wrap gap-2">${skillsHTML}</div>
            `;
        }
    };

    // INIT: Auto-select Rank 1's skills on page load
    window.updateSkillsOnly(0);

    // ==========================================
    // EXPORT REPORT & EDIT JD LOGIC
    // ==========================================
    // ==========================================
    // EXPORT REPORT & EDIT JD LOGIC
    // ==========================================
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.onclick = function() {
            // 1. Date aur Time nikalne ka naya logic
            const now = new Date();
            const currentDate = now.toLocaleDateString('en-GB'); // Ex: 15/03/2026
            const currentTime = now.toLocaleTimeString('en-US'); // Ex: 10:30:15 AM
            
            // 2. Report ke andar sundar formatting ke sath Date/Time daalna
            let reportContent = "====================================\n";
            reportContent += "   MATCH ANALYTICS - ANALYSIS REPORT\n";
            reportContent += "====================================\n";
            reportContent += `Date Generated : ${currentDate}\n`;
            reportContent += `Time Generated : ${currentTime}\n`;
            reportContent += "------------------------------------\n\n";
            
            // 3. Candidates ka data daalna
            window.candidateList.forEach((cand, idx) => {
                let candName = cand.candidate_name || cand.filename;
                reportContent += `Rank: ${idx + 1}\nCandidate: ${candName}\nMatch Score: ${cand.match_score.toFixed(1)}%\n------------------------------------\n`;
            });
            
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `MatchAnalytics_Report_${now.getTime()}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        };
    }
    
    const editJDBtn = document.getElementById('editJDBtn');
    if (editJDBtn) {
        editJDBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('editMode', 'true');
            window.location.href = 'index.html';
        });
    }
});

// ==========================================
// RESUME MODAL LOGIC (SMART FORMATTING)
// ==========================================
const modalHTML = `
    <div id="resumeModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4 transition-opacity">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up border border-gray-200">
            <div class="p-5 border-b flex justify-between items-center bg-gray-50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
                        📄
                    </div>
                    <div>
                        <h3 id="modalTitle" class="font-bold text-xl text-gray-800">Candidate Resume</h3>
                        <p class="text-xs text-gray-500 font-medium">Original Extracted Text</p>
                    </div>
                </div>
                <button onclick="closeResumeModal()" class="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors font-bold text-xl">&times;</button>
            </div>
            <div class="p-8 overflow-y-auto flex-grow bg-white">
                <div id="modalContent" class="text-gray-700 text-sm leading-relaxed font-sans"></div>
            </div>
            <div class="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button onclick="closeResumeModal()" class="bg-gray-800 text-white hover:bg-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm">Close Window</button>
            </div>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

// 🛠️ BUG FIX: Naya Smart Resume Formatter
function formatResumeText(text) {
    if (!text) return "Resume text not available. Please try scanning again.";
    
    let formatted = text;
    
    // 1. Links aur Emails protect karein
    formatted = formatted.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '<span class="text-blue-500 font-medium bg-blue-50 px-1 rounded">$1</span>');
    formatted = formatted.replace(/(linkedin\.com\/[^\s<]+)/gi, '<span class="text-blue-500 font-medium bg-blue-50 px-1 rounded">$1</span>');
    
    // 2. Newlines ko HTML line breaks mein badlein
    formatted = formatted.replace(/\n/g, '<br>');
    
    const headings = ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATION', 'CERTIFICATIONS', 'LANGUAGES', 'STRENGTHS', 'PASSIONS', 'VOLUNTEERING', 'PROJECTS', 'PROFILE', 'OBJECTIVE'];
    
    // 3. SMART HEADING LOGIC
    headings.forEach(heading => {
        // Sirf unhi words ko heading banao jinke aage Colon (:) ho ya line end ho rahi ho (<br> ya $)
        // Isse "2 years of experience." jaise normal sentences kharab nahi honge
        const regex = new RegExp(`\\b(${heading})\\b\\s*(?=:|<br>|$)`, 'gi');
        formatted = formatted.replace(regex, function(match, word) {
            return `<br><br><span class="text-blue-700 font-extrabold text-base tracking-widest uppercase border-b-2 border-blue-200 block pb-1 mb-2">${word.toUpperCase()}</span>`;
        });
    });

    // 4. Faltu empty spaces aur extra line breaks ko clean karna
    formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>'); 
    formatted = formatted.replace(/^(<br>\s*)+/, ''); 

    return formatted;
}

window.openResumeModal = function(index) {
    const cand = window.candidateList[index];
    document.getElementById('modalTitle').innerText = (cand.candidate_name || cand.filename);
    let rawText = cand.raw_text || cand.processed_text || "";
    document.getElementById('modalContent').innerHTML = formatResumeText(rawText);
    document.getElementById('resumeModal').classList.remove('hidden');
};

window.closeResumeModal = function() {
    document.getElementById('resumeModal').classList.add('hidden');
};