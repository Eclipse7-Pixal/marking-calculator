// ============================================================================
// ECLIPSE7 ARCHITECTURAL CORE ENGINE v8.0
// ============================================================================

const EXAM_PROFILES = {
    jeemain: {
        label: "JEE MAIN PRESET",
        totalQs: 75,
        maxMarks: 300,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4 (-25%)",
        subjects: {
            phy: { qs: 25, maxMarks: 100 },
            chem: { qs: 25, maxMarks: 100 },
            mathBio: { qs: 25, maxMarks: 100 }
        },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Main preset applied. [25 Q / 100 Marks per Subject]. Matrix +4 / -1."
    },
    jeeadv: {
        label: "JEE ADVANCED CONFIGURABLE",
        totalQs: 54,
        maxMarks: 180,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4 (-25%)",
        subjects: {
            phy: { qs: 18, maxMarks: 60 },
            chem: { qs: 18, maxMarks: 60 },
            mathBio: { qs: 18, maxMarks: 60 }
        },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Advanced layout generated. Standard pattern 18 Q / 60 Marks per subject."
    },
    neet: {
        label: "NEET UG PRESET",
        totalQs: 180,
        maxMarks: 720,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4 (-25%)",
        subjects: {
            phy: { qs: 45, maxMarks: 180 },
            chem: { qs: 45, maxMarks: 180 },
            mathBio: { qs: 90, maxMarks: 360 }
        },
        labelMathBio: "BIOLOGY",
        intel: "Curriculum: NEET UG preset. [Phy: 180, Chem: 180, Bio: 360]. Matrix +4 / -1."
    },
    custom: {
        label: "CUSTOM MODE (MANUAL OVERRIDE)",
        intel: "Manual Override operational. Input constraints active across form modules."
    }
};

const E7_HISTORY_KEY = 'e7_assessment_history_v2';

// Global Instances & Active States
let breakdownChartInstance = null;
let subjectChartInstance = null;
let activeCanonicalResult = null;

let subjectScores = {
    phy: { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxMarks: 100 },
    chem: { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxMarks: 100 },
    mathBio: { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxMarks: 100 }
};

// ============================================================================
// SECURITY / SANITIZATION UTILITIES
// ============================================================================
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function generateUniqueID() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `E7-${dateStr}-${timeStr}-${rand}`;
}

// ============================================================================
// DROPDOWNS & NAVIGATION SYSTEM
// ============================================================================
function handleProfileTap() {
    if (window.getCurrentUser && window.getCurrentUser()) {
        if (confirm("Sign out of your ECLIPSE7 Cloud account?")) {
            window.logout();
        }
    } else {
        if (window.loginWithGoogle) {
            window.loginWithGoogle();
        }
    }
}

function closeTooltip(e) {
    if (e) e.stopPropagation();
    const tooltip = document.getElementById('signin-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
}

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
            trigger.textContent = item.textContent;

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
// EVENT BINDINGS & SYSTEM INITIALIZATION
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
    setupEventListeners();
    setupSimulatorObservers();
    
    toggleSubjectSectionDisplay();
    renderHistoryVault();
});

function setupEventListeners() {
    document.getElementById('auth-container')?.addEventListener('click', handleProfileTap);
    document.getElementById('closeTooltipBtn')?.addEventListener('click', closeTooltip);
    document.getElementById('btnCalculate')?.addEventListener('click', executeCalculationSequence);

    // Export Action Handlers
    document.getElementById('btnExportPDF')?.addEventListener('click', downloadPDFReportSequence);
    document.getElementById('btnExportPNG')?.addEventListener('click', exportCurrentPNG);
    document.getElementById('btnExportJSON')?.addEventListener('click', exportCurrentJSON);
    document.getElementById('btnShareResult')?.addEventListener('click', triggerShareMenu);

    // History & Drawer Controllers
    document.getElementById('menu-toggle-btn')?.addEventListener('click', () => toggleHistoryDrawer(true));
    document.getElementById('closeHistoryBtn')?.addEventListener('click', () => toggleHistoryDrawer(false));
    document.getElementById('drawerOverlay')?.addEventListener('click', () => toggleHistoryDrawer(false));
    
    document.getElementById('historySearchInput')?.addEventListener('input', filterHistoryList);
    document.getElementById('btnGenerateFullReport')?.addEventListener('click', generateAndShowFullHistoryReport);
    document.getElementById('btnHistoryPDF')?.addEventListener('click', downloadCompleteHistoryPDF);
    document.getElementById('btnHistoryJSON')?.addEventListener('click', exportHistoryJSON);
    document.getElementById('btnHistoryCSV')?.addEventListener('click', exportHistoryCSV);
    document.getElementById('btnHistoryCompare')?.addEventListener('click', openCompareModalLauncher);
    document.getElementById('btnClearHistory')?.addEventListener('click', clearAssessmentHistory);

    // Modals
    document.getElementById('closeCompareBtn')?.addEventListener('click', () => toggleCompareModal(false));
    document.getElementById('compareModalOverlay')?.addEventListener('click', () => toggleCompareModal(false));
    document.getElementById('closeFullReportBtn')?.addEventListener('click', () => toggleFullReportModal(false));
    document.getElementById('fullReportOverlay')?.addEventListener('click', () => toggleFullReportModal(false));

    // Dynamic selects for comparison
    document.getElementById('compareSelect1')?.addEventListener('change', renderComparisonView);
    document.getElementById('compareSelect2')?.addEventListener('change', renderComparisonView);
}

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
// CURRICULUM PROFILES & INPUT ALGEBRA
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
        const skipped = parseFloat(document.getElementById(`${sub}N`).value) || 0;

        let maxMarks = subjectScores[sub].maxMarks;
        if (document.getElementById('examProfile').value === 'custom') {
            const globalTotalQs = parseFloat(document.getElementById('totalQs').value) || 1;
            const globalMaxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
            maxMarks = total > 0 ? (total / globalTotalQs) * globalMaxMarks : 100;
        }

        const marksPerQ = total > 0 ? maxMarks / total : 4; 
        const score = (correct * marksPerQ) - (wrong * marksPerQ * ratio);

        subjectScores[sub] = { correct, wrong, skipped, total, score, maxMarks };

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

    ['phy', 'chem', 'mathBio'].forEach(sub => {
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
// VALIDATION ENGINE
// ============================================================================
function triggerSystemToastNotification(message, isError = true) {
    const toast = document.getElementById('systemNotification');
    const msgSpan = document.getElementById('notificationMessage');
    const icon = document.getElementById('toastIcon');
    if (!toast || !msgSpan) return;

    msgSpan.textContent = message;
    if (isError) {
        toast.style.background = "rgba(244, 63, 94, 0.25)";
        toast.style.borderColor = "rgba(244, 63, 94, 0.4)";
        toast.style.color = "#fecdd3";
        if (icon) icon.className = "fa-solid fa-triangle-exclamation";
    } else {
        toast.style.background = "rgba(16, 185, 129, 0.25)";
        toast.style.borderColor = "rgba(16, 185, 129, 0.4)";
        toast.style.color = "#a7f3d0";
        if (icon) icon.className = "fa-solid fa-circle-check";
    }

    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

function clearInputValidationStyles() {
    document.querySelectorAll('input').forEach(input => input.classList.remove('validation-error'));
}

function validateInput() {
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

    const tVal = parseFloat(totalQs.value);
    const mVal = parseFloat(maxMarks.value);
    const aVal = parseFloat(attempted.value);
    const wVal = parseFloat(wrong.value);

    if (!totalQs.value || tVal <= 0) invalidNodes.push(totalQs);
    if (!maxMarks.value || mVal <= 0) invalidNodes.push(maxMarks);
    if (attempted.value === "" || aVal < 0) invalidNodes.push(attempted);
    if (wrong.value === "" || wVal < 0) invalidNodes.push(wrong);

    if (invalidNodes.length === 0) {
        if (wVal > aVal) {
            invalidNodes.push(wrong, attempted);
            triggerSystemToastNotification("Validation Error: Wrong attempts cannot exceed total attempts.");
            return false;
        }
        if (aVal > tVal) {
            invalidNodes.push(attempted, totalQs);
            triggerSystemToastNotification("Validation Error: Total attempts cannot exceed total questions.");
            return false;
        }
    }

    if (document.getElementById('reportType').value === 'subjectwise') {
        let subSumQs = 0;
        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const tot = parseFloat(document.getElementById(`${sub}A`).value) || 0;
            const cor = parseFloat(document.getElementById(`${sub}C`).value) || 0;
            const wro = parseFloat(document.getElementById(`${sub}W`).value) || 0;
            const skp = parseFloat(document.getElementById(`${sub}N`).value) || 0;
            subSumQs += tot;
            if (cor + wro + skp !== tot) {
                invalidNodes.push(document.getElementById(`${sub}A`));
                triggerSystemToastNotification(`Subject Matrix Mismatch: ${sub.toUpperCase()} sum (C+W+Skipped) must equal total.`);
            }
        });
        if (subSumQs !== tVal) {
            invalidNodes.push(totalQs);
            triggerSystemToastNotification("Subject Matrix Mismatch: Sum of subject totals does not match global total.");
            return false;
        }
    }

    if (invalidNodes.length > 0) {
        invalidNodes.forEach(node => node.classList.add('validation-error'));
        triggerSystemToastNotification("Action Blocked: Please complete required fields correctly.");
        return false;
    }

    return true;
}

// ============================================================================
// CANONICAL CALCULATION ENGINE
// ============================================================================
function collectInput() {
    return {
        studentName: document.getElementById('studentName').value.trim(),
        testName: document.getElementById('testName').value.trim(),
        examProfile: document.getElementById('examProfile').value,
        totalQs: parseFloat(document.getElementById('totalQs').value) || 0,
        maxMarks: parseFloat(document.getElementById('maxMarks').value) || 0,
        attempted: parseFloat(document.getElementById('attempted').value) || 0,
        wrong: parseFloat(document.getElementById('wrong').value) || 0,
        markingRatio: parseFloat(document.getElementById('markingRatio').value) || 0.25,
        reportType: document.getElementById('reportType').value,
        subjectScores: JSON.parse(JSON.stringify(subjectScores))
    };
}

function calculateScore(inputData) {
    const correct = inputData.attempted - inputData.wrong;
    const skipped = Math.max(0, inputData.totalQs - inputData.attempted);
    const marksPerCorrect = inputData.totalQs > 0 ? (inputData.maxMarks / inputData.totalQs) : 0;
    const penaltyMarks = inputData.wrong * (marksPerCorrect * inputData.markingRatio); 
    const finalScore = (correct * marksPerCorrect) - penaltyMarks;
    
    const efficiency = inputData.maxMarks > 0 ? ((finalScore / inputData.maxMarks) * 100) : 0;
    const accuracy = inputData.attempted > 0 ? ((correct / inputData.attempted) * 100) : 0;
    const attemptRate = inputData.totalQs > 0 ? ((inputData.attempted / inputData.totalQs) * 100) : 0;

    return {
        correct,
        skipped,
        marksPerCorrect,
        penaltyMarks,
        finalScore,
        efficiency,
        accuracy,
        attemptRate
    };
}

function calculateAnalytics(inputData, scoreResult) {
    let performanceLevel = "Developing";
    let color = "#f43f5e";
    const pct = scoreResult.efficiency;

    if (pct >= 90) { performanceLevel = "Exceptional"; color = "#10b981"; }
    else if (pct >= 80) { performanceLevel = "Excellent"; color = "#34d399"; }
    else if (pct >= 70) { performanceLevel = "Strong"; color = "#38bdf8"; }
    else if (pct >= 60) { performanceLevel = "Good"; color = "#60a5fa"; }
    else if (pct >= 50) { performanceLevel = "Developing"; color = "#c084fc"; }

    let wrongRatio = inputData.attempted > 0 ? (inputData.wrong / inputData.attempted) : 0;
    let riskIndex = "Low Risk";
    if (wrongRatio > 0.4) riskIndex = "High Volatility";
    else if (wrongRatio > 0.2) riskIndex = "Moderate Risk";

    let recommendations = [];
    if (scoreResult.accuracy < 75) recommendations.push("Reduce speculative attempts to minimize negative marking.");
    if (scoreResult.skipped > inputData.totalQs * 0.3) recommendations.push("Optimize time allocation to review unanswered questions.");
    if (recommendations.length === 0) recommendations.push("Maintain current question selection strategy and balanced timing.");

    return {
        performanceLevel,
        color,
        riskIndex,
        recommendations
    };
}

function predictRankAndPercentile(inputData, scoreResult) {
    let scorePct = Math.max(0, Math.min(100, (scoreResult.finalScore / inputData.maxMarks) * 100));
    let percentileMin = 0, percentileMax = 0;
    let rankMin = 0, rankMax = 0;

    if (inputData.examProfile === 'jeemain') {
        percentileMin = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 2) * 100);
        percentileMax = Math.min(99.99, percentileMin + 0.5);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 12000));
        rankMax = Math.round((100 - percentileMin) * 12000);
    } else if (inputData.examProfile === 'jeeadv') {
        percentileMin = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 1.8) * 100);
        percentileMax = Math.min(99.99, percentileMin + 0.6);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 2500));
        rankMax = Math.round((100 - percentileMin) * 2500);
    } else if (inputData.examProfile === 'neet') {
        percentileMin = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 2.2) * 100);
        percentileMax = Math.min(99.99, percentileMin + 0.4);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 20000));
        rankMax = Math.round((100 - percentileMin) * 20000);
    } else {
        percentileMin = scorePct;
        percentileMax = Math.min(100, scorePct + 1.0);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 1000));
        rankMax = Math.round((100 - percentileMin) * 1000);
    }

    return {
        percentileRange: `${percentileMin.toFixed(1)}% - ${percentileMax.toFixed(1)}%`,
        rankRange: `${rankMin.toLocaleString()} - ${rankMax.toLocaleString()}`,
        confidence: "Moderate (Mathematical Model)",
        methodology: "Normalized Score Curve"
    };
}

function buildAssessmentResult(existingID = null) {
    const rawInput = collectInput();
    const scoreRes = calculateScore(rawInput);
    const analyticsRes = calculateAnalytics(rawInput, scoreRes);
    const predRes = predictRankAndPercentile(rawInput, scoreRes);

    return {
        id: existingID || generateUniqueID(),
        schemaVersion: "8.0",
        createdAt: Date.now(),
        timestamp: new Date().toLocaleString(),

        student: { name: rawInput.studentName },
        assessment: { testName: rawInput.testName, examProfile: rawInput.examProfile },
        
        scoring: {
            totalQuestions: rawInput.totalQs,
            attempted: rawInput.attempted,
            correct: scoreRes.correct,
            wrong: rawInput.wrong,
            skipped: scoreRes.skipped,
            maxMarks: rawInput.maxMarks,
            marksPerCorrect: scoreRes.marksPerCorrect,
            negativeMarkingRatio: rawInput.markingRatio
        },

        subjects: {
            enabled: rawInput.reportType === 'subjectwise',
            data: rawInput.subjectScores
        },

        result: {
            finalScore: scoreRes.finalScore,
            scorePercentage: scoreRes.efficiency.toFixed(2),
            accuracy: scoreRes.accuracy.toFixed(2),
            attemptRate: scoreRes.attemptRate.toFixed(2),
            penaltyMarks: scoreRes.penaltyMarks
        },

        analytics: analyticsRes,
        prediction: predRes
    };
}

function renderResult(canonicalObj) {
    activeCanonicalResult = canonicalObj;

    animateNumberCounter('score', canonicalObj.result.finalScore, 2);

    const gradeEl = document.getElementById('dashGrade');
    if (gradeEl) {
        gradeEl.innerText = canonicalObj.analytics.performanceLevel;
        gradeEl.style.backgroundColor = canonicalObj.analytics.color + "22";
        gradeEl.style.color = canonicalObj.analytics.color;
        gradeEl.style.border = `1px solid ${canonicalObj.analytics.color}55`;
    }

    animateNumberCounter('dashAccuracy', parseFloat(canonicalObj.result.accuracy), 1, '', '%');
    animateNumberCounter('dashEfficiency', parseFloat(canonicalObj.result.scorePercentage), 1, '', '%');
    animateNumberCounter('dashPenalty', canonicalObj.result.penaltyMarks, 2);

    document.getElementById('dashCorrect').innerText = canonicalObj.scoring.correct;
    document.getElementById('dashWrong').innerText = canonicalObj.scoring.wrong;
    document.getElementById('dashSkipped').innerText = canonicalObj.scoring.skipped;
    document.getElementById('dashRiskIndex').innerText = canonicalObj.analytics.riskIndex;

    document.getElementById('predPercentile').innerText = canonicalObj.prediction.percentileRange;
    document.getElementById('predRank').innerText = canonicalObj.prediction.rankRange;
    document.getElementById('predConfidence').innerText = canonicalObj.prediction.confidence;
    document.getElementById('predMethodology').innerText = canonicalObj.prediction.methodology;

    // Diagnostics Text
    let diagText = `ECLIPSE7 Performance Diagnostic Engine\n`;
    diagText += `• Accuracy: ${canonicalObj.result.accuracy}%\n`;
    diagText += `• Penalty Drag: ${canonicalObj.result.penaltyMarks.toFixed(2)} marks lost to wrong attempts.\n`;
    diagText += `• Attempt Strategy: ${canonicalObj.result.attemptRate}% total test coverage.\n\n`;
    diagText += `Recommendations:\n` + canonicalObj.analytics.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');

    document.getElementById('aiReportContent').innerText = diagText;

    // Insight List
    const insightList = document.getElementById('insightList');
    if (insightList) {
        insightList.innerHTML = '';
        canonicalObj.analytics.recommendations.forEach(r => {
            let li = document.createElement('li');
            li.textContent = r;
            insightList.appendChild(li);
        });
    }

    renderCurrentDashboardCharts(canonicalObj);
    initSimulatorValues(canonicalObj);

    document.getElementById('analyticsDashboardContainer').classList.remove('hidden');
}

function executeCalculationSequence() {
    if (!validateInput()) return null;
    const resultObj = buildAssessmentResult();
    renderResult(resultObj);
    saveAssessment(resultObj);
    return resultObj;
}

// ============================================================================
// SIMULATOR ("WHAT IF?")
// ============================================================================
function setupSimulatorObservers() {
    const s1 = document.getElementById('simWrongToCorrect');
    const s2 = document.getElementById('simSkipToCorrect');

    if (s1 && s2) {
        s1.addEventListener('input', updateSimulatorOutcome);
        s2.addEventListener('input', updateSimulatorOutcome);
    }
}

function initSimulatorValues(canonicalObj) {
    const s1 = document.getElementById('simWrongToCorrect');
    const s2 = document.getElementById('simSkipToCorrect');
    if (!s1 || !s2) return;

    s1.max = Math.min(15, canonicalObj.scoring.wrong);
    s1.value = 0;
    s2.max = Math.min(15, canonicalObj.scoring.skipped);
    s2.value = 0;

    document.getElementById('simValWrongToCorrect').textContent = "0";
    document.getElementById('simValSkipToCorrect').textContent = "0";
    document.getElementById('simProjectedScore').textContent = canonicalObj.result.finalScore.toFixed(2);
    document.getElementById('simScoreDelta').textContent = "+0.00";
}

function updateSimulatorOutcome() {
    if (!activeCanonicalResult) return;

    const wToC = parseInt(document.getElementById('simWrongToCorrect').value) || 0;
    const sToC = parseInt(document.getElementById('simSkipToCorrect').value) || 0;

    document.getElementById('simValWrongToCorrect').textContent = wToC;
    document.getElementById('simValSkipToCorrect').textContent = sToC;

    const mpc = activeCanonicalResult.scoring.marksPerCorrect;
    const ratio = activeCanonicalResult.scoring.negativeMarkingRatio;

    // Recover negative penalty + add positive score for wrong->correct
    const recoveredPenalty = wToC * (mpc * ratio);
    const addedScoreWrong = wToC * mpc;
    const addedScoreSkip = sToC * mpc;

    const delta = recoveredPenalty + addedScoreWrong + addedScoreSkip;
    const projected = activeCanonicalResult.result.finalScore + delta;

    document.getElementById('simProjectedScore').textContent = projected.toFixed(2);
    document.getElementById('simScoreDelta').textContent = `+${delta.toFixed(2)}`;
}

// ============================================================================
// ANIMATIONS & CHARTS
// ============================================================================
function animateNumberCounter(elementId, targetValue, decimals = 0, prefix = '', suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    let start = 0;
    let duration = 600;
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

function renderCurrentDashboardCharts(canonicalObj) {
    if (breakdownChartInstance) breakdownChartInstance.destroy();
    if (subjectChartInstance) subjectChartInstance.destroy();

    const ctxPie = document.getElementById('currentBreakdownChart').getContext('2d');
    breakdownChartInstance = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Correct', 'Wrong', 'Skipped'],
            datasets: [{
                data: [canonicalObj.scoring.correct, canonicalObj.scoring.wrong, canonicalObj.scoring.skipped],
                backgroundColor: ['#10b981', '#f43f5e', '#64748b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#f8fafc', font: { family: 'Plus Jakarta Sans', size: 11 } } } }
        }
    });

    const ctxBar = document.getElementById('currentSubjectChart').getContext('2d');
    const dynLabel = document.getElementById('mathBioLabel')?.textContent || 'MATHEMATICS';
    const subData = canonicalObj.subjects.data;
    
    subjectChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Physics', 'Chemistry', dynLabel],
            datasets: [{
                label: 'Subject Score',
                data: [subData.phy.score, subData.chem.score, subData.mathBio.score],
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
// STORAGE & HISTORY VAULT ARCHITECTURE
// ============================================================================
function getStoredHistory() {
    try {
        const raw = localStorage.getItem(E7_HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Local storage error:", e);
        return [];
    }
}

function saveAssessment(canonicalObj) {
    let history = getStoredHistory();
    const existingIndex = history.findIndex(h => h.id === canonicalObj.id);

    if (existingIndex >= 0) {
        history[existingIndex] = canonicalObj;
    } else {
        history.unshift(canonicalObj);
    }

    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(history));
    renderHistoryVault();

    if (window.saveScoreToDatabase) {
        window.saveScoreToDatabase(canonicalObj);
    }
}

function mergeCloudAndLocalHistory(cloudRecords) {
    let localHistory = getStoredHistory();
    let mergedMap = new Map();

    localHistory.forEach(item => mergedMap.set(item.id, item));
    cloudRecords.forEach(item => mergedMap.set(item.id, item));

    let mergedArray = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(mergedArray));
    renderHistoryVault();
}

function renderHistoryVault() {
    const container = document.getElementById('historyListContainer');
    const badge = document.getElementById('navHistoryCounter');
    const totalTxt = document.getElementById('historyTotalText');
    if (!container) return;

    const history = getStoredHistory();
    if (badge) badge.textContent = history.length;
    if (totalTxt) totalTxt.textContent = `${history.length} Records Stored`;

    if (history.length === 0) {
        container.innerHTML = `<div class="empty-history-msg">No stored assessment history found.</div>`;
        return;
    }

    let html = '';
    history.forEach(item => {
        const student = escapeHTML(item.student?.name || item.studentName || 'Candidate');
        const test = escapeHTML(item.assessment?.testName || item.testName || 'Assessment');
        const profile = escapeHTML((item.assessment?.examProfile || item.profile || 'custom').toUpperCase());
        const score = typeof item.result?.finalScore === 'number' ? item.result.finalScore.toFixed(2) : (item.finalScore || '0.00');
        const maxM = item.scoring?.maxMarks || item.maxMarks || 300;
        const eff = item.result?.scorePercentage || item.efficiency || '0.00';

        html += `
        <div class="history-item-card" data-id="${item.id}">
            <div class="item-card-header">
                <span class="item-test-title">${test}</span>
                <span class="item-badge-profile">${profile}</span>
            </div>
            <div class="item-student-name"><i class="fa-solid fa-user-graduate"></i> ${student}</div>
            <div class="item-metrics-grid">
                <div>Score: <strong>${score} / ${maxM}</strong></div>
                <div>Accuracy: <strong>${item.result?.accuracy || item.accuracy || 0}%</strong></div>
                <div>Efficiency: <strong>${eff}%</strong></div>
                <div>Date: <strong>${item.timestamp || 'N/A'}</strong></div>
            </div>
            <div class="item-card-actions">
                <button class="item-btn btn-restore" onclick="restoreAssessmentState('${item.id}')"><i class="fa-solid fa-rotate-left"></i> Restore</button>
                <button class="item-btn btn-delete" onclick="deleteAssessmentItem('${item.id}')"><i class="fa-solid fa-trash-can"></i> Delete</button>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function restoreAssessmentState(id) {
    const history = getStoredHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;

    document.getElementById('studentName').value = item.student?.name || item.studentName || '';
    document.getElementById('testName').value = item.assessment?.testName || item.testName || '';
    
    const profileKey = item.assessment?.examProfile || item.profile || 'custom';
    document.getElementById('examProfile').value = profileKey;
    document.getElementById('examProfileLabel').textContent = EXAM_PROFILES[profileKey]?.label || EXAM_PROFILES.custom.label;

    document.getElementById('totalQs').value = item.scoring?.totalQuestions || item.totalQs || 0;
    document.getElementById('maxMarks').value = item.scoring?.maxMarks || item.maxMarks || 0;
    document.getElementById('attempted').value = item.scoring?.attempted || item.attempted || 0;
    document.getElementById('wrong').value = item.scoring?.wrong || item.wrong || 0;
    document.getElementById('markingRatio').value = item.scoring?.negativeMarkingRatio || item.markingRatio || 0.25;

    if (item.subjects?.data) {
        document.getElementById('reportType').value = 'subjectwise';
        document.getElementById('selectedLabel').textContent = 'SUBJECT BREAKDOWN';
        toggleSubjectSectionDisplay();

        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const sData = item.subjects.data[sub];
            if (sData) {
                document.getElementById(`${sub}A`).value = sData.total || 0;
                document.getElementById(`${sub}C`).value = sData.correct || 0;
                document.getElementById(`${sub}W`).value = sData.wrong || 0;
                document.getElementById(`${sub}N`).value = sData.skipped || 0;
            }
        });
        recalculateSubjectScores();
    } else {
        document.getElementById('reportType').value = 'overall';
        document.getElementById('selectedLabel').textContent = 'OVERALL MODE';
        toggleSubjectSectionDisplay();
    }

    renderResult(item);
    toggleHistoryDrawer(false);
    triggerSystemToastNotification("Assessment state perfectly restored.", false);
}

function deleteAssessmentItem(id) {
    let history = getStoredHistory();
    const item = history.find(h => h.id === id);
    history = history.filter(h => h.id !== id);
    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(history));
    renderHistoryVault();

    if (item && item.firebaseKey && window.deleteScoreFromDatabase) {
        window.deleteScoreFromDatabase(item.firebaseKey);
    }
    triggerSystemToastNotification("Record removed from vault.", false);
}

function clearAssessmentHistory() {
    if (!confirm("Are you sure you want to purge all stored assessments?")) return;
    localStorage.removeItem(E7_HISTORY_KEY);
    renderHistoryVault();
    if (window.clearAllDatabaseScores) {
        window.clearAllDatabaseScores();
    }
    triggerSystemToastNotification("History vault purged completely.", false);
}

function filterHistoryList() {
    const q = document.getElementById('historySearchInput').value.toLowerCase();
    const items = document.querySelectorAll('.history-item-card');
    items.forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = text.includes(q) ? 'block' : 'none';
    });
}

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

// ============================================================================
// COMPARISON ENGINE & FULL REPORT MODALS
// ============================================================================
function openCompareModalLauncher() {
    const history = getStoredHistory();
    if (history.length < 2) {
        triggerSystemToastNotification("Require at least 2 historical records to run comparison.");
        return;
    }

    const s1 = document.getElementById('compareSelect1');
    const s2 = document.getElementById('compareSelect2');
    s1.innerHTML = ''; s2.innerHTML = '';

    history.forEach((h, idx) => {
        const opt1 = document.createElement('option');
        opt1.value = h.id; opt1.textContent = `${h.assessment?.testName || h.testName} (${h.result?.scorePercentage || h.efficiency}%)`;
        s1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = h.id; opt2.textContent = `${h.assessment?.testName || h.testName} (${h.result?.scorePercentage || h.efficiency}%)`;
        s2.appendChild(opt2);
    });

    s2.selectedIndex = 1;
    toggleCompareModal(true);
    renderComparisonView();
}

function toggleCompareModal(show) {
    const modal = document.getElementById('compareModal');
    const overlay = document.getElementById('compareModalOverlay');
    if (show) {
        modal?.classList.add('active');
        overlay?.classList.add('active');
    } else {
        modal?.classList.remove('active');
        overlay?.classList.remove('active');
    }
}

function renderComparisonView() {
    const id1 = document.getElementById('compareSelect1').value;
    const id2 = document.getElementById('compareSelect2').value;
    const history = getStoredHistory();
    const t1 = history.find(h => h.id === id1);
    const t2 = history.find(h => h.id === id2);
    const container = document.getElementById('comparisonGrid');

    if (!t1 || !t2) return;

    const eff1 = parseFloat(t1.result?.scorePercentage || t1.efficiency);
    const eff2 = parseFloat(t2.result?.scorePercentage || t2.efficiency);
    const diffEff = (eff2 - eff1).toFixed(2);
    const diffPen = ((t2.result?.penaltyMarks || t2.totalPenalty) - (t1.result?.penaltyMarks || t1.totalPenalty)).toFixed(2);

    container.innerHTML = `
        <div class="cmp-card">
            <h4>${escapeHTML(t1.assessment?.testName || t1.testName)}</h4>
            <p>Score: <strong>${t1.result?.finalScore || t1.finalScore} / ${t1.scoring?.maxMarks || t1.maxMarks}</strong></p>
            <p>Efficiency: <strong>${eff1}%</strong></p>
            <p>Accuracy: <strong>${t1.result?.accuracy || t1.accuracy}%</strong></p>
            <p>Penalty: <strong>${t1.result?.penaltyMarks || t1.totalPenalty}</strong></p>
        </div>
        <div class="cmp-card">
            <h4>${escapeHTML(t2.assessment?.testName || t2.testName)}</h4>
            <p>Score: <strong>${t2.result?.finalScore || t2.finalScore} / ${t2.scoring?.maxMarks || t2.maxMarks}</strong></p>
            <p>Efficiency: <strong>${eff2}%</strong></p>
            <p>Accuracy: <strong>${t2.result?.accuracy || t2.accuracy}%</strong></p>
            <p>Penalty: <strong>${t2.result?.penaltyMarks || t2.totalPenalty}</strong></p>
        </div>
        <div class="cmp-summary-box">
            <strong>Delta Analysis:</strong> ${diffEff >= 0 ? `+${diffEff}% Efficiency gain` : `${diffEff}% Efficiency loss`}.
            Penalty difference: ${diffPen} marks.
        </div>
    `;
}

function generateAndShowFullHistoryReport() {
    const history = getStoredHistory();
    if (history.length === 0) {
        triggerSystemToastNotification("No history available to generate full report.");
        return;
    }

    const container = document.getElementById('fullReportContent');
    let avgScorePct = (history.reduce((a, b) => a + parseFloat(b.result?.scorePercentage || b.efficiency), 0) / history.length).toFixed(2);
    let avgAcc = (history.reduce((a, b) => a + parseFloat(b.result?.accuracy || b.accuracy), 0) / history.length).toFixed(2);

    container.innerHTML = `
        <div class="full-report-section">
            <h4>Executive Analytics Summary</h4>
            <p>Evaluated <strong>${history.length}</strong> total assessments. Average Efficiency: <strong>${avgScorePct}%</strong> | Average Accuracy: <strong>${avgAcc}%</strong>.</p>
        </div>
        <div class="full-report-section">
            <h4>Assessment Progression Timeline</h4>
            <ul class="timeline-list">
                ${history.map(h => `
                    <li>
                        <strong>${escapeHTML(h.assessment?.testName || h.testName)}</strong> — Score: ${h.result?.finalScore || h.finalScore} (${h.result?.scorePercentage || h.efficiency}%) on ${h.timestamp}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    toggleFullReportModal(true);
}

function toggleFullReportModal(show) {
    const modal = document.getElementById('fullReportModal');
    const overlay = document.getElementById('fullReportOverlay');
    if (show) {
        modal?.classList.add('active');
        overlay?.classList.add('active');
    } else {
        modal?.classList.remove('active');
        overlay?.classList.remove('active');
    }
}

// ============================================================================
// EXPORT ENGINE (PDF, PNG, JSON, CSV, SHARE)
// ============================================================================
function createPDFDocumentObject(canonicalObj) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const profile = (canonicalObj.assessment.examProfile).toUpperCase();
    const student = canonicalObj.student.name.toUpperCase();
    const test = canonicalObj.assessment.testName.toUpperCase();
    const timestamp = canonicalObj.timestamp;

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setDrawColor(240, 244, 248); doc.setLineWidth(0.25);
    for (let i = 10; i < 210; i += 20) doc.line(i, 0, i, 297);
    for (let j = 10; j < 297; j += 20) doc.line(0, j, 210, j);

    doc.setDrawColor(148, 163, 184); doc.setLineWidth(0.3);
    doc.rect(8, 8, 194, 281);

    doc.setFillColor(248, 250, 252); doc.rect(10, 10, 190, 32, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 32, 'D');

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("EXAMINATION PERFORMANCE & METRIC REPORT", 16, 21);
    
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(14, 165, 233);
    doc.text(`ECLIPSE7 ENGINE // PROFILE: ${profile} // ID: ${canonicalObj.id}`, 16, 27);
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text("ECLIPSE7 PERFORMANCE ANALYTICS PLATFORM | ENGINEER: SAIPRASAD BARURE", 16, 35);

    let cardY = 46;
    doc.setFillColor(241, 245, 249); doc.rect(10, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(10, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" STUDENT IDENTITY MATRIX", 12, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255); doc.setDrawColor(203, 213, 225);
    doc.rect(10, cardY + 6, 92, 26, 'DF');
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("CANDIDATE NAME    :", 14, cardY + 14);
    doc.text("TARGET ASSESSMENT  :", 14, cardY + 20);
    doc.text("TIMESTAMP           :", 14, cardY + 26);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(student.length > 20 ? student.substring(0, 20) + "..." : student, 44, cardY + 14);
    doc.text(test.length > 20 ? test.substring(0, 20) + "..." : test, 44, cardY + 20);
    doc.setFont("courier", "bold"); doc.setFontSize(6.5); doc.text(timestamp, 44, cardY + 26);

    doc.setFillColor(241, 245, 249); doc.rect(108, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(108, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" EVALUATION METRICS SUMMARY", 110, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255); doc.setDrawColor(203, 213, 225);
    doc.rect(108, cardY + 6, 92, 26, 'DF');
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("TOTAL QUESTIONS    :", 112, cardY + 13);
    doc.text("MAX EVAL MARKS      :", 112, cardY + 19);
    doc.text("TOTAL ATTEMPTS      :", 112, cardY + 25);
    doc.text("INCORRECT FAULTS    :", 112, cardY + 31);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(`${canonicalObj.scoring.totalQuestions} ITEMS`, 148, cardY + 13);
    doc.text(`${canonicalObj.scoring.maxMarks} MARKS`, 148, cardY + 19);
    doc.text(`${canonicalObj.scoring.attempted} UNITS`, 148, cardY + 25);
    doc.setTextColor(225, 29, 72); doc.text(`${canonicalObj.scoring.wrong} FAULTS`, 148, cardY + 31);

    let scoreY = 82;
    doc.setFillColor(250, 251, 253); doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.4);
    doc.rect(10, scoreY, 190, 22, 'DF');

    doc.setTextColor(14, 165, 233); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("FINAL SCORE", 15, scoreY + 6);
    doc.setFont("courier", "bold"); doc.setFontSize(16); doc.setTextColor(15, 23, 42);
    doc.text(`${canonicalObj.result.finalScore.toFixed(2)} / ${canonicalObj.scoring.maxMarks}`, 15, scoreY + 15);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text("SCORE EFFICIENCY", 100, scoreY + 6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text(`${canonicalObj.result.scorePercentage}%`, 100, scoreY + 14);

    doc.text("ACCURACY", 150, scoreY + 6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text(`${canonicalObj.result.accuracy}%`, 150, scoreY + 14);

    return doc;
}

function downloadPDFReportSequence() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Please calculate an assessment first.");
        return;
    }

    const doc = createPDFDocumentObject(activeCanonicalResult);
    const fileName = `${activeCanonicalResult.student.name.replace(/ /g, "_")}_ECLIPSE7_Report.pdf`;
    doc.save(fileName);
}

function exportCurrentPNG() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Please calculate an assessment first.");
        return;
    }

    document.getElementById('exportStudentName').textContent = activeCanonicalResult.student.name;
    document.getElementById('exportTestName').textContent = activeCanonicalResult.assessment.testName;
    document.getElementById('exportProfileTag').textContent = activeCanonicalResult.assessment.examProfile.toUpperCase();
    document.getElementById('exportScoreVal').textContent = activeCanonicalResult.result.finalScore.toFixed(2);
    document.getElementById('exportScoreSub').textContent = `${activeCanonicalResult.result.scorePercentage}% | Band: ${activeCanonicalResult.analytics.performanceLevel}`;
    document.getElementById('exportAcc').textContent = `${activeCanonicalResult.result.accuracy}%`;
    document.getElementById('exportAtt').textContent = activeCanonicalResult.scoring.attempted;
    document.getElementById('exportPen').textContent = activeCanonicalResult.result.penaltyMarks.toFixed(2);
    document.getElementById('exportDocId').textContent = `ID: ${activeCanonicalResult.id}`;

    const card = document.getElementById('exportReportCard');
    card.style.display = 'block';

    html2canvas(card, { backgroundColor: '#0f172a' }).then(canvas => {
        card.style.display = 'none';
        let link = document.createElement('a');
        link.download = `${activeCanonicalResult.student.name.replace(/ /g, "_")}_Card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function exportCurrentJSON() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Please calculate an assessment first.");
        return;
    }
    let blob = new Blob([JSON.stringify(activeCanonicalResult, null, 2)], { type: 'application/json' });
    let link = document.createElement('a');
    link.download = `${activeCanonicalResult.id}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function downloadCompleteHistoryPDF() {
    const history = getStoredHistory();
    if (history.length === 0) {
        triggerSystemToastNotification("No history records available.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("ECLIPSE7 - Complete History Performance Analytics", 14, 20);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()} | Total Tests: ${history.length}`, 14, 26);

    const tableRows = history.map(h => [
        h.timestamp || 'N/A',
        h.student?.name || h.studentName || 'Candidate',
        h.assessment?.testName || h.testName || 'Assessment',
        (h.assessment?.examProfile || h.profile || 'custom').toUpperCase(),
        `${h.result?.finalScore || h.finalScore} / ${h.scoring?.maxMarks || h.maxMarks}`,
        `${h.result?.scorePercentage || h.efficiency}%`
    ]);

    doc.autoTable({
        startY: 32,
        head: [['Timestamp', 'Student', 'Test', 'Profile', 'Score', 'Efficiency']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save("ECLIPSE7_History_Vault_Report.pdf");
}

function exportHistoryJSON() {
    const history = getStoredHistory();
    let blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    let link = document.createElement('a');
    link.download = 'ECLIPSE7_History_Vault.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function exportHistoryCSV() {
    const history = getStoredHistory();
    if (history.length === 0) return;
    
    let csv = "ID,Timestamp,Student,Test,Profile,Score,MaxMarks,Efficiency,Accuracy\n";
    history.forEach(h => {
        const id = `"${(h.id || '').replace(/"/g, '""')}"`;
        const ts = `"${(h.timestamp || '').replace(/"/g, '""')}"`;
        const st = `"${(h.student?.name || h.studentName || '').replace(/"/g, '""')}"`;
        const tt = `"${(h.assessment?.testName || h.testName || '').replace(/"/g, '""')}"`;
        const pr = `"${(h.assessment?.examProfile || h.profile || '').replace(/"/g, '""')}"`;
        const sc = h.result?.finalScore || h.finalScore || 0;
        const mx = h.scoring?.maxMarks || h.maxMarks || 0;
        const ef = h.result?.scorePercentage || h.efficiency || 0;
        const ac = h.result?.accuracy || h.accuracy || 0;

        csv += `${id},${ts},${st},${tt},${pr},${sc},${mx},${ef},${ac}\n`;
    });

    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement('a');
    link.download = 'ECLIPSE7_History_Vault.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function triggerShareMenu() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Please calculate an assessment first.");
        return;
    }

    const shareText = 
`🎓 *ECLIPSE7 ASSESSMENT REPORT*
----------------------------------------
👤 *Student Name:* ${activeCanonicalResult.student.name}
📝 *Assessment:* ${activeCanonicalResult.assessment.testName}
🎯 *Profile:* ${activeCanonicalResult.assessment.examProfile.toUpperCase()}

📊 *SCORE METRICS*
• *Final Score:* ${activeCanonicalResult.result.finalScore.toFixed(2)} / ${activeCanonicalResult.scoring.maxMarks}
• *Efficiency:* ${activeCanonicalResult.result.scorePercentage}%
• *Accuracy:* ${activeCanonicalResult.result.accuracy}%
• *Penalty Lost:* ${activeCanonicalResult.result.penaltyMarks.toFixed(2)} Marks

🚀 *ESTIMATED RANGE*
• *Percentile Range:* ${activeCanonicalResult.prediction.percentileRange}
• *Rank Range:* ${activeCanonicalResult.prediction.rankRange}

----------------------------------------
⚡ *ECLIPSE7 Performance Analytics Engine*
🔗 https://eclipse7.odoo.com/`;

    if (navigator.share) {
        navigator.share({
            title: `ECLIPSE7 Assessment - ${activeCanonicalResult.student.name}`,
            text: shareText
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareText);
        triggerSystemToastNotification("Result summary copied to clipboard!", false);
    }
}
