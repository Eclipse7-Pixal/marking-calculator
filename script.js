// ============================================================================
// 1. CURRICULUM PERFORMANCE PROFILE MATRIX CONFIGURATION
// ============================================================================
const EXAM_PROFILES = {
    jeemain: {
        label: "JEE MAIN PROFILE",
        totalQs: 75,
        maxMarks: 300,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4",
        subjects: {
            phy: { qs: 25, maxMarks: 100 },
            chem: { qs: 25, maxMarks: 100 },
            mathBio: { qs: 25, maxMarks: 100 }
        },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Main mapped. [25 Q / 100 Marks per Subject]. Matrix +4 / -1."
    },
    jeeadv: {
        label: "JEE ADVANCED PROFILE",
        totalQs: 54,
        maxMarks: 180,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4",
        subjects: {
            phy: { qs: 18, maxMarks: 60 },
            chem: { qs: 18, maxMarks: 60 },
            mathBio: { qs: 18, maxMarks: 60 }
        },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Advanced layout generated. Standardized 18 Q / 60 Marks per subject."
    },
    neet: {
        label: "NEET UG PROFILE",
        totalQs: 180,
        maxMarks: 720,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4",
        subjects: {
            phy: { qs: 45, maxMarks: 180 },
            chem: { qs: 45, maxMarks: 180 },
            mathBio: { qs: 90, maxMarks: 360 }
        },
        labelMathBio: "BIOLOGY",
        intel: "Curriculum: NEET UG mapped. [Phy: 180, Chem: 180, Bio: 360]. Matrix +4 / -1."
    },
    custom: {
        label: "CUSTOM MODE (MANUAL OVERRIDE)",
        intel: "Manual Override operational. Custom constraints active across input modules."
    }
};

const E7_HISTORY_KEY = 'e7_assessment_history_v2';

// Global Instances & States
let breakdownChartInstance = null;
let subjectChartInstance = null;

let subjectScores = {
    phy: { correct: 0, wrong: 0, total: 0, score: 0, maxMarks: 100 },
    chem: { correct: 0, wrong: 0, total: 0, score: 0, maxMarks: 100 },
    mathBio: { correct: 0, wrong: 0, total: 0, score: 0, maxMarks: 100 }
};

// ============================================================================
// 2. DROPDOWN CONTROLLER
// ============================================================================
function initDropdownSystem(containerId, triggerId, panelId, hiddenInputId, callback) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const panel = document.getElementById(panelId);
    const hidden = document.getElementById(hiddenInputId);
    if (!container || !trigger || !panel) return;

    const options = panel.querySelectorAll('.select-box-option');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.select-box-dropdown').forEach(p => {
            if(p !== panel) p.classList.remove('show');
        });
        document.querySelectorAll('.custom-select-box').forEach(c => {
            if(c !== container) c.classList.remove('active');
        });
        panel.classList.toggle('show');
        container.classList.toggle('active');
    });

    options.forEach(item => {
        item.addEventListener('click', () => {
            const chosenVal = item.getAttribute('data-value');
            hidden.value = chosenVal;
            
            if (containerId === 'ratioSelectContainer') {
                trigger.textContent = `Ratio: ${item.textContent.split(' ')[0]}`;
            } else {
                trigger.textContent = item.textContent;
            }

            panel.classList.remove('show');
            container.classList.remove('active');
            if (callback) callback(chosenVal);
        });
    });

    window.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            panel.classList.remove('show');
            container.classList.remove('active');
        }
    });
}

// ============================================================================
// 3. INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initDropdownSystem('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectSectionDisplay);
    initDropdownSystem('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', () => { 
        setProfileToCustomOverride(); 
        recalculateSubjectScores();
    });
    initDropdownSystem('examProfileSelectContainer', 'examProfileLabel', 'examProfileOptions', 'examProfile', applySelectedExamProfile);
    
    setupReactiveSubjectSyncObservers();
    setupMainFallbackInputObservers();
    
    toggleSubjectSectionDisplay();
    renderHistoryVault();
});

function toggleSubjectSectionDisplay() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    const subjCard = document.getElementById('subjectChartCard');
    if (!section) return;

    if (type === 'subjectwise') {
        section.classList.add('visible');
        if(subjCard) subjCard.classList.remove('hidden');
        syncSubjectBreakdownToMainInputs();
    } else {
        section.classList.remove('visible');
        if(subjCard) subjCard.classList.add('hidden');
    }
}

// ============================================================================
// 4. SMART PROFILING ARCHITECTURE
// ============================================================================
function applySelectedExamProfile(profileKey) {
    const profile = EXAM_PROFILES[profileKey];
    if (!profile) return;

    const intelBox = document.getElementById('intelMessage');
    if (intelBox) intelBox.textContent = profile.intel;

    const totalQsInput = document.getElementById('totalQs');

    if (profileKey === 'custom') {
        if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
        return;
    }

    if (totalQsInput) totalQsInput.classList.add('profile-locked-row');

    document.getElementById('totalQs').value = profile.totalQs;
    document.getElementById('maxMarks').value = profile.maxMarks;
    document.getElementById('markingRatio').value = profile.ratio;
    document.getElementById('ratioLabel').textContent = profile.labelRatio;

    const mbLabel = document.getElementById('mathBioLabel');
    if (mbLabel && profile.labelMathBio) mbLabel.textContent = profile.labelMathBio;

    document.getElementById('phyA').value = profile.subjects.phy.qs;
    document.getElementById('chemA').value = profile.subjects.chem.qs;
    document.getElementById('mathBioA').value = profile.subjects.mathBio.qs;

    subjectScores.phy.maxMarks = profile.subjects.phy.maxMarks;
    subjectScores.chem.maxMarks = profile.subjects.chem.maxMarks;
    subjectScores.mathBio.maxMarks = profile.subjects.mathBio.maxMarks;

    clearImplicitTransientResiduals();
    clearInputValidationStyles();
    
    ['phy', 'chem', 'mathBio'].forEach(sub => executeRowAlgebraSolver(sub));
    recalculateSubjectScores();
    syncSubjectBreakdownToMainInputs();
}

function setProfileToCustomOverride() {
    const hiddenProf = document.getElementById('examProfile');
    const triggerProf = document.getElementById('examProfileLabel');
    
    const totalQsInput = document.getElementById('totalQs');
    if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');

    if(hiddenProf && hiddenProf.value !== 'custom') {
        hiddenProf.value = 'custom';
        if(triggerProf) triggerProf.textContent = EXAM_PROFILES.custom.label;
        const intelBox = document.getElementById('intelMessage');
        if (intelBox) intelBox.textContent = EXAM_PROFILES.custom.intel;
    }
}

function clearImplicitTransientResiduals() {
    ['phy', 'chem', 'mathBio'].forEach(sub => {
        document.getElementById(`${sub}C`).value = '';
        document.getElementById(`${sub}W`).value = '';
        document.getElementById(`${sub}N`).value = '';
    });
    document.getElementById('attempted').value = '';
    document.getElementById('wrong').value = '';
}

// ============================================================================
// 5. SUBJECT ALGEBRA & NTA SCORE CALCULATOR
// ============================================================================
function setupReactiveSubjectSyncObservers() {
    const subPanel = document.getElementById('subjectSection');
    if (!subPanel) return;

    subPanel.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            processSubjectRowRecalculationSequence(e.target);
        }
    });
}

function processSubjectRowRecalculationSequence(targetNode) {
    const row = targetNode.closest('.subject-grid-row');
    if (row) {
        const subjectKey = row.getAttribute('data-subject');
        executeRowAlgebraSolver(subjectKey, targetNode);
    }
    recalculateSubjectScores();
    syncSubjectBreakdownToMainInputs();
}

function executeRowAlgebraSolver(sub, activeElement = null) {
    const elTot = document.getElementById(`${sub}A`);
    const elCor = document.getElementById(`${sub}C`);
    const elWro = document.getElementById(`${sub}W`);
    const elNot = document.getElementById(`${sub}N`);

    const tot = elTot.value !== "" ? parseFloat(elTot.value) : null;
    const cor = elCor.value !== "" ? parseFloat(elCor.value) : null;
    const wro = elWro.value !== "" ? parseFloat(elWro.value) : null;
    const not = elNot.value !== "" ? parseFloat(elNot.value) : null;

    if (tot === null) return; 

    let filledFields = [];
    if (cor !== null) filledFields.push({ id: 'C', val: cor, el: elCor });
    if (wro !== null) filledFields.push({ id: 'W', val: wro, el: elWro });
    if (not !== null) filledFields.push({ id: 'N', val: not, el: elNot });

    if (filledFields.length === 3) {
        if (activeElement === elNot) {
            let updatedCor = Math.max(0, tot - not - wro);
            elCor.value = updatedCor === 0 && not === 0 && wro === 0 ? "" : updatedCor;
        } else if (activeElement === elWro) {
            let updatedCor = Math.max(0, tot - wro - not);
            elCor.value = updatedCor === 0 && wro === 0 && not === 0 ? "" : updatedCor;
        } else {
            let updatedNot = Math.max(0, tot - cor - wro);
            elNot.value = updatedNot === 0 && cor === 0 && wro === 0 ? "" : updatedNot;
        }
        return;
    }

    if (filledFields.length === 2) {
        const structuralMask = filledFields.map(f => f.id).join('');
        if (structuralMask === 'CW') elNot.value = Math.max(0, tot - cor - wro);
        else if (structuralMask === 'WN') elCor.value = Math.max(0, tot - wro - not);
        else if (structuralMask === 'CN') elWro.value = Math.max(0, tot - cor - not);
    }
}

function recalculateSubjectScores() {
    const ratio = parseFloat(document.getElementById('markingRatio').value) || 0.25;
    const subjects = ['phy', 'chem', 'mathBio'];

    subjects.forEach(sub => {
        const total = parseFloat(document.getElementById(`${sub}A`).value) || 0;
        const correct = parseFloat(document.getElementById(`${sub}C`).value) || 0;
        const wrong = parseFloat(document.getElementById(`${sub}W`).value) || 0;

        let maxMarks = subjectScores[sub].maxMarks;
        if (document.getElementById('examProfile').value === 'custom') {
            const globalTotalQs = parseFloat(document.getElementById('totalQs').value) || 1;
            const globalMaxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
            maxMarks = total > 0 ? (total / globalTotalQs) * globalMaxMarks : 100;
        }

        const marksPerQ = total > 0 ? maxMarks / total : 4; 
        const score = (correct * marksPerQ) - (wrong * marksPerQ * ratio);

        subjectScores[sub] = { correct, wrong, total, score, maxMarks };

        const chip = document.getElementById(`${sub}ScoreChip`);
        if (chip) {
            chip.textContent = `Score: ${score.toFixed(2)} / ${maxMarks}`;
        }
    });
}

function setupMainFallbackInputObservers() {
    ['studentName', 'testName', 'totalQs', 'maxMarks', 'attempted', 'wrong'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                if(id !== 'studentName' && id !== 'testName' && id !== 'totalQs') {
                    setProfileToCustomOverride();
                }
                el.classList.remove('validation-error');
            });
        }
    });
}

function syncSubjectBreakdownToMainInputs() {
    const reportType = document.getElementById('reportType').value;
    if (reportType !== 'subjectwise') return;

    let aggregateTotal = 0;
    let aggregateCorrect = 0;
    let aggregateWrong = 0;

    const subjects = ['phy', 'chem', 'mathBio'];
    subjects.forEach(sub => {
        const t = parseFloat(document.getElementById(`${sub}A`).value) || 0;
        const c = parseFloat(document.getElementById(`${sub}C`).value) || 0;
        const w = parseFloat(document.getElementById(`${sub}W`).value) || 0;

        aggregateTotal += t;
        aggregateCorrect += c;
        aggregateWrong += w;
    });

    const totalQsInput = document.getElementById('totalQs');
    if(aggregateTotal > 0 && totalQsInput) totalQsInput.value = aggregateTotal;
    
    let computedAttempts = aggregateCorrect + aggregateWrong;
    document.getElementById('attempted').value = computedAttempts > 0 || aggregateWrong > 0 ? computedAttempts : '';
    document.getElementById('wrong').value = aggregateWrong > 0 ? aggregateWrong : '';
}

// ============================================================================
// 6. VALIDATION & TOAST SYSTEM
// ============================================================================
function triggerSystemToastNotification(message, isError = true) {
    const toast = document.getElementById('systemNotification');
    const msgSpan = document.getElementById('notificationMessage');
    if (!toast || !msgSpan) return;

    msgSpan.textContent = message;
    if (isError) {
        toast.style.background = "rgba(244, 63, 94, 0.15)";
        toast.style.borderColor = "rgba(244, 63, 94, 0.3)";
        toast.style.color = "#fecdd3";
    } else {
        toast.style.background = "rgba(16, 185, 129, 0.15)";
        toast.style.borderColor = "rgba(16, 185, 129, 0.3)";
        toast.style.color = "#a7f3d0";
    }

    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

function clearInputValidationStyles() {
    document.querySelectorAll('input').forEach(input => input.classList.remove('validation-error'));
}

function scanAndValidateSystemInputs() {
    clearInputValidationStyles();
    let invalidNodes = [];

    const studentName = document.getElementById('studentName');
    const testName = document.getElementById('testName');
    
    if (!studentName.value.trim()) invalidNodes.push(studentName);
    if (!testName.value.trim()) invalidNodes.push(testName);

    const totalQs = document.getElementById('totalQs');
    const maxMarks = document.getElementById('maxMarks');
    const attempted = document.getElementById('attempted');
    const wrong = document.getElementById('wrong');

    if (!totalQs.value || parseFloat(totalQs.value) <= 0) invalidNodes.push(totalQs);
    if (!maxMarks.value || parseFloat(maxMarks.value) <= 0) invalidNodes.push(maxMarks);
    if (attempted.value === "" || parseFloat(attempted.value) < 0) invalidNodes.push(attempted);
    if (wrong.value === "" || parseFloat(wrong.value) < 0) invalidNodes.push(wrong);

    if (invalidNodes.length === 0) {
        if (parseFloat(wrong.value) > parseFloat(attempted.value)) {
            invalidNodes.push(wrong, attempted);
            triggerSystemToastNotification("Logic Error: Incorrect answers cannot exceed total attempts.");
            return false;
        }
        if (parseFloat(attempted.value) > parseFloat(totalQs.value)) {
            invalidNodes.push(attempted, totalQs);
            triggerSystemToastNotification("Logic Error: Total attempts cannot exceed total questions.");
            return false;
        }
    }

    if (invalidNodes.length > 0) {
        invalidNodes.forEach(node => node.classList.add('validation-error'));
        triggerSystemToastNotification("Action Blocked: Please populate required fields correctly.");
        return false;
    }

    return true;
}

// ============================================================================
// 7. MAIN CALCULATION ENGINE + FEATURE 1, 2, 4, 7, 8, 9 INTEGRATION
// ============================================================================
function executeCalculationSequence() {
    if (!scanAndValidateSystemInputs()) return null;

    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('markingRatio').value) || 0.25;
    
    const correct = attempted - wrong;
    const unattempted = Math.max(0, totalQs - attempted);
    const marksPerCorrect = totalQs > 0 ? (maxMarks / totalQs) : 0;
    
    const totalPenalty = wrong * (marksPerCorrect * ratio); 
    const finalScore = (correct * marksPerCorrect) - totalPenalty;
    const efficiency = maxMarks > 0 ? ((finalScore / maxMarks) * 100) : 0;
    const accuracy = attempted > 0 ? ((correct / attempted) * 100) : 0;

    // Smooth counter animation for score hero
    animateNumberCounter('score', finalScore, 2);

    const profileKey = document.getElementById('examProfile').value;

    const resultData = { 
        totalQs, maxMarks, attempted, wrong, correct, 
        unattempted, finalScore, efficiency: efficiency.toFixed(2), 
        accuracy: accuracy.toFixed(2), totalPenalty, marksPerCorrect, profileKey,
        subjectScores: JSON.parse(JSON.stringify(subjectScores))
    };

    // Auto-save calculated metrics to persistent storage vault
    saveRecordToVault(resultData);

    // Update Dashboard & Sub-modules
    updateDashboardUI(resultData);
    computeRankAndPercentile(resultData);
    generateAIReport(resultData);
    generateInsightEngineList(resultData);
    renderCurrentDashboardCharts(resultData);

    document.getElementById('analyticsDashboardContainer').classList.remove('hidden');

    return resultData;
}

function animateNumberCounter(elementId, targetValue, decimals = 0, prefix = '', suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    let start = 0;
    let duration = 800;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = Math.min((timestamp - startTime) / duration, 1);
        let curr = start + progress * (targetValue - start);
        el.innerText = `${prefix}${curr.toFixed(decimals)}${suffix}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}

// FEATURE 8: PERFORMANCE GRADE ASSIGNMENT
function calculateGrade(pct) {
    if (pct >= 95) return { grade: "S+", color: "#10b981" };
    if (pct >= 90) return { grade: "S", color: "#34d399" };
    if (pct >= 80) return { grade: "A+", color: "#38bdf8" };
    if (pct >= 70) return { grade: "A", color: "#60a5fa" };
    if (pct >= 60) return { grade: "B+", color: "#a78bfa" };
    if (pct >= 50) return { grade: "B", color: "#c084fc" };
    if (pct >= 40) return { grade: "C", color: "#facc15" };
    if (pct >= 30) return { grade: "D", color: "#fb923c" };
    return { grade: "Needs Improvement", color: "#f43f5e" };
}

// FEATURE 7: DASHBOARD UI UPDATE
function updateDashboardUI(data) {
    const gradeObj = calculateGrade(parseFloat(data.efficiency));
    const gradeEl = document.getElementById('dashGrade');
    gradeEl.innerText = gradeObj.grade;
    gradeEl.style.backgroundColor = gradeObj.color + "22";
    gradeEl.style.color = gradeObj.color;
    gradeEl.style.border = `1px solid ${gradeObj.color}55`;

    animateNumberCounter('dashAccuracy', parseFloat(data.accuracy), 1, '', '%');
    animateNumberCounter('dashEfficiency', parseFloat(data.efficiency), 1, '', '%');
    animateNumberCounter('dashPenalty', data.totalPenalty, 2);
    document.getElementById('dashCorrect').innerText = data.correct;
    document.getElementById('dashWrong').innerText = data.wrong;
    document.getElementById('dashSkipped').innerText = data.unattempted;

    let risk = "Low";
    let wrongRatio = data.attempted > 0 ? (data.wrong / data.attempted) : 0;
    if (wrongRatio > 0.4) risk = "High Risk";
    else if (wrongRatio > 0.2) risk = "Moderate";
    document.getElementById('dashRiskIndex').innerText = risk;
}

// FEATURE 1: SMART RANK & PERCENTILE PREDICTOR
function computeRankAndPercentile(data) {
    let scorePct = Math.max(0, Math.min(100, (data.finalScore / data.maxMarks) * 100));
    let percentile = 0;
    let rank = 0;
    let band = "Good";
    let competition = "Top 10%";

    if (data.profileKey === 'jeemain') {
        percentile = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 2) * 100);
        rank = Math.round((100 - percentile) * 12000);
    } else if (data.profileKey === 'jeeadv') {
        percentile = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 1.8) * 100);
        rank = Math.round((100 - percentile) * 2500);
    } else if (data.profileKey === 'neet') {
        percentile = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 2.2) * 100);
        rank = Math.round((100 - percentile) * 20000);
    } else {
        percentile = scorePct;
        rank = Math.round((100 - scorePct) * 1000);
    }

    if (percentile >= 99) { band = "Outstanding"; competition = "Top 1%"; }
    else if (percentile >= 95) { band = "Excellent"; competition = "Top 5%"; }
    else if (percentile >= 85) { band = "Very Good"; competition = "Top 15%"; }
    else if (percentile >= 70) { band = "Above Average"; competition = "Top 30%"; }
    else { band = "Developing"; competition = "Top 50%+"; }

    animateNumberCounter('predPercentile', percentile, 2, '', '%');
    animateNumberCounter('predRank', Math.max(1, rank), 0);
    document.getElementById('predBand').innerText = band;
    document.getElementById('predCompetition').innerText = competition;
}

// FEATURE 2: AI PERFORMANCE ANALYSIS
function generateAIReport(data) {
    let report = [];
    let eff = parseFloat(data.efficiency);
    let acc = parseFloat(data.accuracy);

    if (eff >= 80) report.push("★ Excellent Overall Work. Your performance efficiency is in the top bracket.");
    else if (eff >= 50) report.push("★ Solid Foundation. Performance is steady but requires accuracy refinement.");
    else report.push("★ Caution Required. High score volatility detected.");

    report.push(`• Accuracy Analysis: You maintained an accuracy of ${acc}%.`);
    report.push(`• Negative Mark Analysis: You lost approximately ${data.totalPenalty.toFixed(2)} marks because of risky attempts.`);

    if (data.wrong > 5) {
        report.push(`• Risk Level: High negative drag. ${data.wrong} questions answered incorrectly.`);
    } else {
        report.push(`• Risk Level: Controlled precision. Minimal incorrect responses detected.`);
    }

    report.push("\nRecommendations:");
    if (acc < 75) report.push("1. Attempt fewer uncertain questions to safeguard your positive scores.");
    if (data.unattempted > data.totalQs * 0.3) report.push("2. Work on time management to reduce skipped questions.");
    report.push("3. Focus on subject consistency to maintain continuous score improvement.");

    document.getElementById('aiReportContent').innerText = report.join("\n");
}

// FEATURE 9: INSIGHT ENGINE
function generateInsightEngineList(currentData) {
    const listEl = document.getElementById('insightList');
    listEl.innerHTML = '';
    const history = getStoredHistory();

    let insights = [];
    
    if (currentData.wrong > currentData.correct * 0.35) {
        insights.push("You attempted too many risky questions in this session.");
    }
    
    if (history.length > 1) {
        let prev = history[1];
        let scoreDiff = parseFloat(currentData.finalScore) - parseFloat(prev.finalScore);
        if (scoreDiff > 0) {
            insights.push(`Score improved by +${scoreDiff.toFixed(2)} marks compared to previous test.`);
        } else if (scoreDiff < 0) {
            insights.push(`Score dropped by ${scoreDiff.toFixed(2)} marks compared to previous test.`);
        }
    }

    if (insights.length === 0) {
        insights.push("Performance metrics logged. Continue testing to track growth trends.");
    }

    insights.forEach(txt => {
        let li = document.createElement('li');
        li.innerText = txt;
        listEl.appendChild(li);
    });
}

// FEATURE 4: PERFORMANCE GRAPHS
function renderCurrentDashboardCharts(data) {
    if (breakdownChartInstance) breakdownChartInstance.destroy();
    if (subjectChartInstance) subjectChartInstance.destroy();

    const ctxPie = document.getElementById('currentBreakdownChart').getContext('2d');
    breakdownChartInstance = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Correct', 'Wrong', 'Skipped'],
            datasets: [{
                data: [data.correct, data.wrong, data.unattempted],
                backgroundColor: ['#10b981', '#f43f5e', '#64748b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#f8fafc', font: { size: 10 } } } }
        }
    });

    const ctxBar = document.getElementById('currentSubjectChart').getContext('2d');
    const dynLabel = document.getElementById('mathBioLabel')?.textContent || 'MATHEMATICS';
    
    subjectChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Physics', 'Chemistry', dynLabel],
            datasets: [{
                label: 'Subject Score',
                data: [subjectScores.phy.score, subjectScores.chem.score, subjectScores.mathBio.score],
                backgroundColor: ['#8b5cf6', '#0284c7', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94a3b8' } },
                y: { ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// ============================================================================
// 8. DATA EXPORT & FEATURE 6 SHARE SYSTEM
// ============================================================================
async function downloadPDFReportSequence() {
    const telemetryData = executeCalculationSequence();
    if (!telemetryData) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const reportType = document.getElementById('reportType').value;
    const currentProfile = document.getElementById('examProfile').value.toUpperCase();
    const student = document.getElementById('studentName').value.toUpperCase();
    const test = document.getElementById('testName').value.toUpperCase();
    const timestamp = new Date().toLocaleString().toUpperCase();

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setDrawColor(240, 244, 248); doc.setLineWidth(0.25);
    for (let i = 10; i < 210; i += 20) doc.line(i, 0, i, 297);
    for (let j = 10; j < 297; j += 20) doc.line(0, j, 210, j);

    doc.setDrawColor(148, 163, 184); doc.setLineWidth(0.3);
    doc.rect(8, 8, 194, 281);

    doc.setFillColor(248, 250, 252); doc.rect(10, 10, 190, 32, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 32, 'D');
    
    doc.setFillColor(14, 165, 233); doc.rect(10, 41, 130, 1, 'F');
    doc.setFillColor(168, 85, 247); doc.rect(140, 41, 60, 1, 'F');

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("NEGATIVE MARKING PERFORMANCE REPORT", 16, 21);
    
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(14, 165, 233);
    doc.text(`SYSTEM CORE: SCORE_PROFILE_${currentProfile} // CORE v7.0`, 16, 27);
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text("ECLIPSE7 PERFORMANCE MATRIX LABORATORY | FOUNDER: SAIPRASAD BARURE", 16, 35);

    let cardY = 48;
    doc.setFillColor(241, 245, 249); doc.rect(10, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(10, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" STUDENT IDENTITY MATRIX", 12, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255); doc.setDrawColor(203, 213, 225);
    doc.rect(10, cardY + 6, 92, 26, 'DF');
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("CANDIDATE NAME    :", 14, cardY + 14);
    doc.text("TARGET EXAM       :", 14, cardY + 22);
    doc.text("SYSTEM TIME STAMP :", 14, cardY + 30);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(student.length > 20 ? student.substring(0, 20) + "..." : student, 44, cardY + 14);
    doc.text(test.length > 20 ? test.substring(0, 20) + "..." : test, 44, cardY + 22);
    doc.setFont("courier", "bold"); doc.setFontSize(6.5); doc.text(timestamp, 44, cardY + 30);

    doc.setFillColor(241, 245, 249); doc.rect(108, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(108, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" LOAD DATA STRUCTURAL CONSTANTS", 110, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255); doc.setDrawColor(203, 213, 225);
    doc.rect(108, cardY + 6, 92, 26, 'DF');
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("TOTAL QUESTIONS    :", 112, cardY + 13);
    doc.text("MAX EVAL MARKS      :", 112, cardY + 19);
    doc.text("EVAL USER ATTEMPTS  :", 112, cardY + 25);
    doc.text("VERIFIED FAULTS     :", 112, cardY + 31);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(`${telemetryData.totalQs} ITEMS`, 148, cardY + 13);
    doc.text(`${telemetryData.maxMarks} MARKS`, 148, cardY + 19);
    doc.text(`${telemetryData.attempted} UNITS`, 148, cardY + 25);
    doc.setTextColor(225, 29, 72); doc.text(`${telemetryData.wrong} FAULTS`, 148, cardY + 31);

    let scoreY = 86;
    doc.setFillColor(250, 251, 253); doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.4);
    doc.rect(10, scoreY, 190, 24, 'DF');
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
    doc.line(68, scoreY, 68, scoreY + 24); doc.line(142, scoreY, 142, scoreY + 24);
    
    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text("COMPUTED GROSS MARKS", 15, scoreY + 6);
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(`${(telemetryData.correct * telemetryData.marksPerCorrect).toFixed(2)}`, 15, scoreY + 14);

    doc.setTextColor(14, 165, 233); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("INTELLIGENCE ENGINE SCORE RUN", 73, scoreY + 6);
    doc.setFont("courier", "bold"); doc.setFontSize(20); doc.setTextColor(15, 23, 42);
    doc.text(`${telemetryData.finalScore.toFixed(2)}`, 73, scoreY + 15);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text("ENGINE PERFORMANCE EFFICIENCY", 147, scoreY + 6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text(`${telemetryData.efficiency}%`, 147, scoreY + 14);

    let meterY = 118;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(10, meterY - 4, 200, meterY - 4);
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("VISUAL TELEMETRY EVALUATION GRAPH", 11, meterY);
    meterY += 5;

    const analyticalGauges = [
        { title: "ACCURACY DENSITY", value: telemetryData.correct, max: telemetryData.totalQs || 1, color: [14, 165, 233] },
        { title: "PENALTY COEFFICIENT", value: telemetryData.wrong, max: telemetryData.totalQs || 1, color: [168, 85, 247] }
    ];

    analyticalGauges.forEach(gauge => {
        doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
        doc.text(gauge.title, 11, meterY + 3.5);

        let segments = 24;
        let activeBlocks = Math.round((gauge.value / gauge.max) * segments);
        let startX = 74;
        
        for(let s = 0; s < segments; s++) {
            if(s < activeBlocks) {
                doc.setFillColor(gauge.color[0], gauge.color[1], gauge.color[2]);
                doc.rect(startX + (s * 5.1), meterY, 4.0, 4.0, 'F');
            } else {
                doc.setDrawColor(226, 232, 240);
                doc.rect(startX + (s * 5.1), meterY, 4.0, 4.0, 'D');
            }
        }
        meterY += 7;
    });

    if (reportType === 'subjectwise') {
        doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(10, meterY - 1, 200, meterY - 1);
        doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text("CROSS-SUBJECT ANALYTICS MATRIX", 11, meterY + 4);
        meterY += 9;

        const dynLabel = document.getElementById('mathBioLabel')?.textContent || 'MATHEMATICS';
        const rows = [
            { name: 'PHYSICS SUBSYSTEM', key: 'phy', kA: 'phyA', kC: 'phyC', kW: 'phyW' },
            { name: 'CHEMISTRY SUBSYSTEM', key: 'chem', kA: 'chemA', kC: 'chemC', kW: 'chemW' },
            { name: `${dynLabel} SUBSYSTEM`, key: 'mathBio', kA: 'mathBioA', kC: 'mathBioC', kW: 'mathBioW' }
        ];

        rows.forEach(r => {
            const total = parseInt(document.getElementById(r.kA).value) || 0;
            const corr = parseInt(document.getElementById(r.kC).value) || 0;
            const wrng = parseInt(document.getElementById(r.kW).value) || 0;
            const sData = subjectScores[r.key];

            doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
            doc.text(r.name, 11, meterY + 3);

            if (total > 0) {
                let maxWidth = 80;
                let cW = (corr / total) * maxWidth;
                let wW = (wrng / total) * maxWidth;
                let iW = Math.max(0, maxWidth - (cW + wW));

                doc.setFillColor(16, 185, 129); if(cW > 0) doc.rect(74, meterY, cW, 4.0, 'F');
                doc.setFillColor(244, 63, 94); if(wW > 0) doc.rect(74 + cW, meterY, wW, 4.0, 'F');
                doc.setFillColor(241, 245, 249); if(iW > 0) doc.rect(74 + cW + wW, meterY, iW, 4.0, 'F');
                
                doc.setDrawColor(203, 213, 225); doc.rect(74, meterY, maxWidth, 4.0, 'D');
                
                doc.setFontSize(5.5); doc.setTextColor(15, 23, 42); doc.setFont("courier", "bold");
                doc.text(`[ MARKS: ${sData.score.toFixed(2)}/${sData.maxMarks} | OK: ${corr} | WRG: ${wrng} ]`, 156, meterY + 2.8);
            } else {
                doc.setFont("helvetica", "oblique"); doc.setFontSize(6); doc.setTextColor(148, 163, 184);
                doc.text("CHANNEL OFFLINE // NO CURRICULUM STREAM LOADED IN DATA MODEM", 74, meterY + 3);
            }
            meterY += 7;
        });
    }

    let tBoxY = Math.max(meterY + 4, 148);
    doc.setFillColor(252, 253, 255); doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.4);
    doc.rect(10, tBoxY, 190, 36, 'DF');
    doc.setFillColor(168, 85, 247); doc.rect(10, tBoxY, 2.5, 36, 'F');

    doc.setTextColor(15, 23, 42); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
    doc.text("AUTOMATED ALGORITHMIC INTELLIGENCE RECOMMENDATIONS MATRIX", 16, tBoxY + 6);
    doc.setFont("courier", "bold"); doc.setFontSize(7.5); doc.setTextColor(51, 65, 85);

    let systemRecommendationText = "";
    if (telemetryData.efficiency > 80) systemRecommendationText = "EXCELLENT CONTEXT ACUITY. MAINTAIN CONSTANT VELOCITY PATTERNS TO PRESERVE CAP LIMIT.";
    else if (telemetryData.efficiency > 50) systemRecommendationText = "STABLE EQUILIBRIUM. ELIMINATE TRIVIAL FAULT TRIGGERS TO BRIDGE THE SUB-80% ACCURACY DECAY.";
    else systemRecommendationText = "CRITICAL SYSTEM FAULT DENSITY. ELIMINATE GUESSWORK PATTERNS IMMEDIATELY TO REMOVE PENALTY DRAINS.";

    doc.text(`>> RECOM_STRATEGY : ${systemRecommendationText}`, 15, tBoxY + 14);
    doc.text(`>> PENALTY_DECAY  : THE REGISTERED PENALTY INFLICTED SUBTRACTS ${telemetryData.totalPenalty.toFixed(2)} POINTS FROM ABSOLUTE CAPACITY.`, 15, tBoxY + 21);
    doc.text(`>> EFFICIENCY_GAP : ${telemetryData.unattempted} UNATTEMPTED SEGMENTS IDENTIFIED FOR LOW-COST SCORE OPTIMIZATION.`, 15, tBoxY + 28);

    const finalFooterY = 254;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(10, finalFooterY - 4, 200, finalFooterY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("MR. PRASAD REDDY", 14, finalFooterY + 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterY + 9);
    doc.setFont("courier", "bold"); doc.setFontSize(7); doc.setTextColor(5, 150, 105);
    doc.text("STATUS: INTEGRITY MATRIX APPROVED & DIGITAL RECORD VERIFIED VIA CORE STREAM", 14, finalFooterY + 14);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "stamp.jpg"; 
    
    img.onload = function() {
        doc.addImage(img, 'JPEG', 158, 244, 34, 34);
        doc.save(`${student.replace(/ /g, "_")}_ECLIPSE7_METRIC_REPORT.pdf`);
    };
    img.onerror = () => {
        doc.save(`${student.replace(/ /g, "_")}_ECLIPSE7_METRIC_REPORT.pdf`);
    };
}

function exportCurrentPNG() {
    const el = document.getElementById('mainAppContainer');
    html2canvas(el).then(canvas => {
        let link = document.createElement('a');
        link.download = 'ECLIPSE7_Assessment_Result.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function exportCurrentJSON() {
    const data = executeCalculationSequence();
    if (!data) return;
    let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    let link = document.createElement('a');
    link.download = 'ECLIPSE7_Result.json';
    link.href = URL.createObjectURL(blob);
    link.click();
}

function triggerShareMenu() {
    const data = executeCalculationSequence();
    if (!data) return;
    const shareText = `ECLIPSE7 Exam Result\nStudent: ${document.getElementById('studentName').value}\nScore: ${data.finalScore.toFixed(2)} / ${data.maxMarks}\nAccuracy: ${data.accuracy}%\nEfficiency: ${data.efficiency}%`;

    if (navigator.share) {
        navigator.share({
            title: 'ECLIPSE7 Assessment Result',
            text: shareText,
            url: window.location.href
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareText);
        triggerSystemToastNotification("Result Summary copied to clipboard!", false);
    }
}

// FEATURE 5: DOWNLOAD COMPLETE HISTORY PDF
function downloadCompleteHistoryPDF() {
    const history = getStoredHistory();
    if (history.length === 0) {
        triggerSystemToastNotification("No history records available to export PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("ECLIPSE7 - Complete History Performance Analytics", 14, 20);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()} | Total Tests: ${history.length}`, 14, 26);

    const tableRows = history.map(h => [
        h.timestamp,
        h.studentName,
        h.testName,
        h.profile.toUpperCase(),
        `${h.finalScore} / ${h.maxMarks}`,
        `${h.efficiency}%`
    ]);

    doc.autoTable({
        startY: 32,
        head: [['Timestamp', 'Student', 'Test', 'Profile', 'Score', 'Efficiency']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save("ECLIPSE7_Complete_History_Report.pdf");
}

function exportHistoryJSON() {
    const history = getStoredHistory();
    let blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    let link = document.createElement('a');
    link.download = 'ECLIPSE7_History_Vault.json';
    link.href = URL.createObjectURL(blob);
    link.click();
}

function exportHistoryCSV() {
    const history = getStoredHistory();
    if (history.length === 0) return;
    let csv = "ID,Timestamp,Student,Test,Profile,Score,MaxMarks,Efficiency\n";
    history.forEach(h => {
        csv += `"${h.id}","${h.timestamp}","${h.studentName}","${h.testName}","${h.profile}","${h.finalScore}","${h.maxMarks}","${h.efficiency}"\n`;
    });
    let blob = new Blob([csv], { type: 'text/csv' });
    let link = document.createElement('a');
    link.download = 'ECLIPSE7_History_Vault.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
}

// ============================================================================
// 9. HISTORY VAULT STORAGE, COMPARISON & FULL AI REPORT
// ============================================================================
function toggleHistoryDrawer(show) {
    const drawer = document.getElementById('historyDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (!drawer || !overlay) return;

    if (show) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        renderHistoryVault();
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function getStoredHistory() {
    try {
        const raw = localStorage.getItem(E7_HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Storage Access Fault", e);
        return [];
    }
}

function saveRecordToVault(computed) {
    const studentName = document.getElementById('studentName').value.trim();
    const testName = document.getElementById('testName').value.trim();
    const profile = document.getElementById('examProfile').value;

    if (!studentName || !testName) return;

    const record = {
        id: 'E7-REC-' + Date.now(),
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        studentName,
        testName,
        profile,
        finalScore: computed.finalScore.toFixed(2),
        maxMarks: computed.maxMarks,
        totalQs: computed.totalQs,
        attempted: computed.attempted,
        wrong: computed.wrong,
        correct: computed.correct,
        efficiency: computed.efficiency,
        accuracy: computed.accuracy
    };

    let history = getStoredHistory();
    if (history.length > 0 && history[0].studentName === studentName && history[0].testName === testName && history[0].finalScore === record.finalScore) {
        return;
    }

    history.unshift(record);
    if (history.length > 50) history = history.slice(0, 50);

    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(history));
    updateHistoryCounterBadge(history.length);
}

function updateHistoryCounterBadge(count) {
    const counterNodes = [document.getElementById('historyCounter'), document.getElementById('headerHistoryCounter')];
    counterNodes.forEach(node => { if(node) node.textContent = count; });
}

function renderHistoryVault(filterQuery = "") {
    const container = document.getElementById('historyListContainer');
    const totalLabel = document.getElementById('historyTotalText');
    if (!container) return;

    const history = getStoredHistory();
    updateHistoryCounterBadge(history.length);

    const filtered = filterQuery.trim() === "" ? history : history.filter(item => 
        item.studentName.toLowerCase().includes(filterQuery.toLowerCase()) || 
        item.testName.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (totalLabel) totalLabel.textContent = `${filtered.length} Records Shown`;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-history-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>${filterQuery ? "No matching records found." : "Vault empty. Compute a test score to log history."}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="history-item-card" id="card-${item.id}">
            <div class="history-card-top">
                <h4 class="history-cand-name">${escapeHtml(item.studentName)}</h4>
                <span class="history-badge-profile">${item.profile}</span>
            </div>
            <div class="history-card-mid">
                <span class="history-test-name">${escapeHtml(item.testName)}</span>
                <span class="history-card-score">${item.finalScore} / ${item.maxMarks}</span>
            </div>
            <div class="history-card-bottom">
                <span>${item.timestamp} | Acc: ${item.efficiency}%</span>
                <div class="history-card-controls">
                    <button class="history-ctrl-btn" onclick="restoreHistoryItem('${item.id}')" title="Load into Calculator">
                        <i class="fa-solid fa-rotate-left"></i> Load
                    </button>
                    <button class="history-ctrl-btn del" onclick="deleteHistoryItem('${item.id}')" title="Delete Entry">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterHistoryList() {
    const query = document.getElementById('historySearchInput').value;
    renderHistoryVault(query);
}

function restoreHistoryItem(id) {
    const history = getStoredHistory();
    const item = history.find(x => x.id === id);
    if (!item) return;

    document.getElementById('studentName').value = item.studentName;
    document.getElementById('testName').value = item.testName;
    document.getElementById('totalQs').value = item.totalQs;
    document.getElementById('maxMarks').value = item.maxMarks;
    document.getElementById('attempted').value = item.attempted;
    document.getElementById('wrong').value = item.wrong;

    document.getElementById('score').innerText = item.finalScore;

    toggleHistoryDrawer(false);
    triggerSystemToastNotification(`Loaded assessment record for ${item.studentName}`, false);
    executeCalculationSequence();
}

function deleteHistoryItem(id) {
    let history = getStoredHistory();
    history = history.filter(x => x.id !== id);
    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(history));
    renderHistoryVault(document.getElementById('historySearchInput').value);
    triggerSystemToastNotification("Record removed from Vault.", false);
}

function clearAssessmentHistory() {
    if (confirm("Purge all recorded assessment history from browser vault?")) {
        localStorage.removeItem(E7_HISTORY_KEY);
        renderHistoryVault();
        triggerSystemToastNotification("Vault completely purged.", false);
    }
}

// FEATURE 3: FULL HISTORY ANALYTICS AI REPORT
function toggleFullReportModal(show) {
    const modal = document.getElementById('fullReportModal');
    const overlay = document.getElementById('fullReportOverlay');
    if (show) { modal.classList.add('active'); overlay.classList.add('active'); }
    else { modal.classList.remove('active'); overlay.classList.remove('active'); }
}

function generateAndShowFullHistoryReport() {
    const history = getStoredHistory();
    if (history.length === 0) {
        triggerSystemToastNotification("Vault empty. Add tests to generate history analysis.");
        return;
    }

    let totalTests = history.length;
    let scores = history.map(h => parseFloat(h.finalScore));
    let highest = Math.max(...scores);
    let lowest = Math.min(...scores);
    let avgScore = (scores.reduce((a, b) => a + b, 0) / totalTests).toFixed(2);
    let avgAcc = (history.reduce((a, b) => a + parseFloat(h.accuracy || h.efficiency), 0) / totalTests).toFixed(2);

    let content = document.getElementById('fullReportContent');
    content.innerHTML = `
        <div class="full-report-section">
            <h4><i class="fa-solid fa-chart-line"></i> Historical Executive Summary</h4>
            <p>Over the past ${totalTests} recorded assessments, the student has maintained an average score of <strong>${avgScore}</strong> with an average efficiency/accuracy of <strong>${avgAcc}%</strong>.</p>
            <p>The highest score achieved across all assessments is <strong>${highest}</strong>, with a lower baseline recorded at <strong>${lowest}</strong>.</p>
        </div>
        <div class="full-report-section">
            <h4><i class="fa-solid fa-microchip"></i> Performance & Strategy Recommendations</h4>
            <p>Assessment trends indicate periodic score fluctuations primarily influenced by incorrect attempts. To maximize total score consistency, it is recommended to restrict uncertain answers and adopt a selective attempt framework in high-penalty sections.</p>
        </div>
    `;

    toggleFullReportModal(true);
}

// FEATURE 10: COMPARE TESTS
function toggleCompareModal(show) {
    const modal = document.getElementById('compareModal');
    const overlay = document.getElementById('compareModalOverlay');
    if (show) { modal.classList.add('active'); overlay.classList.add('active'); }
    else { modal.classList.remove('active'); overlay.classList.remove('active'); }
}

function openCompareModalLauncher() {
    const history = getStoredHistory();
    if (history.length < 2) {
        triggerSystemToastNotification("At least 2 test entries required for comparison.");
        return;
    }

    const sel1 = document.getElementById('compareSelect1');
    const sel2 = document.getElementById('compareSelect2');
    sel1.innerHTML = ''; sel2.innerHTML = '';

    history.forEach((h, i) => {
        let opt1 = document.createElement('option');
        opt1.value = h.id; opt1.text = `${h.testName} (${h.finalScore})`;
        let opt2 = opt1.cloneNode(true);
        
        sel1.appendChild(opt1);
        sel2.appendChild(opt2);
    });

    sel2.selectedIndex = Math.min(1, history.length - 1);
    renderComparisonView();
    toggleCompareModal(true);
}

function renderComparisonView() {
    const history = getStoredHistory();
    const id1 = document.getElementById('compareSelect1').value;
    const id2 = document.getElementById('compareSelect2').value;

    const t1 = history.find(x => x.id === id1);
    const t2 = history.find(x => x.id === id2);

    if (!t1 || !t2) return;

    let s1 = parseFloat(t1.finalScore);
    let s2 = parseFloat(t2.finalScore);

    const grid = document.getElementById('comparisonGrid');
    grid.innerHTML = `
        <table class="comp-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>${t1.testName}</th>
                    <th>${t2.testName}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Final Score</td>
                    <td class="${s1 >= s2 ? 'comp-winner' : ''}">${t1.finalScore} / ${t1.maxMarks}</td>
                    <td class="${s2 >= s1 ? 'comp-winner' : ''}">${t2.finalScore} / ${t2.maxMarks}</td>
                </tr>
                <tr>
                    <td>Efficiency</td>
                    <td>${t1.efficiency}%</td>
                    <td>${t2.efficiency}%</td>
                </tr>
                <tr>
                    <td>Attempts / Wrong</td>
                    <td>${t1.attempted} / ${t1.wrong}</td>
                    <td>${t2.attempted} / ${t2.wrong}</td>
                </tr>
            </tbody>
        </table>
    `;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
