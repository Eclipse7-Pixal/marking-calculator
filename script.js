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
        subjects: { phy: 25, chem: 25, mathBio: 25 },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Main successfully mapped. [25 Q per Subject Base]. Matrix +4 / -1."
    },
    jeeadv: {
        label: "JEE ADVANCED PROFILE",
        totalQs: 54,
        maxMarks: 180,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4",
        subjects: { phy: 18, chem: 18, mathBio: 18 },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Advanced layout generated. Standardized at 18 Questions per section."
    },
    neet: {
        label: "NEET UG PROFILE",
        totalQs: 180,
        maxMarks: 720,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4",
        subjects: { phy: 45, chem: 45, mathBio: 90 },
        labelMathBio: "BIOLOGY",
        intel: "Curriculum: NEET UG mapped. [Phy: 45, Chem: 45, Bio: 90]. Matrix +4 / -1."
    },
    custom: {
        label: "CUSTOM MODE (MANUAL OVERRIDE)",
        intel: "Manual Override operational. Custom constraints active across input modules."
    }
};

// ============================================================================
// 2. MODERN RE-ENGINEERED FLUENT DROPDOWN CONTROLLER
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
// 3. CENTRALIZED LIFE-CYCLE INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initDropdownSystem('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectSectionDisplay);
    initDropdownSystem('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', () => { setProfileToCustomOverride(); });
    initDropdownSystem('examProfileSelectContainer', 'examProfileLabel', 'examProfileOptions', 'examProfile', applySelectedExamProfile);
    
    setupReactiveSubjectSyncObservers();
    setupMainFallbackInputObservers();
    
    toggleSubjectSectionDisplay();
});

function toggleSubjectSectionDisplay() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    if (!section) return;

    if (type === 'subjectwise') {
        section.classList.add('visible');
        syncSubjectBreakdownToMainInputs();
    } else {
        section.classList.remove('visible');
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

    if (profileKey === 'custom') return;

    document.getElementById('totalQs').value = profile.totalQs;
    document.getElementById('maxMarks').value = profile.maxMarks;
    document.getElementById('markingRatio').value = profile.ratio;
    document.getElementById('ratioLabel').textContent = profile.labelRatio;

    const mbLabel = document.getElementById('mathBioLabel');
    if (mbLabel && profile.labelMathBio) mbLabel.textContent = profile.labelMathBio;

    document.getElementById('phyA').value = profile.subjects.phy;
    document.getElementById('chemA').value = profile.subjects.chem;
    document.getElementById('mathBioA').value = profile.subjects.mathBio;

    clearImplicitTransientResiduals();
    clearInputValidationStyles();
}

function setProfileToCustomOverride() {
    const hiddenProf = document.getElementById('examProfile');
    const triggerProf = document.getElementById('examProfileLabel');
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
    });
    document.getElementById('attempted').value = '';
    document.getElementById('wrong').value = '';
}

// ============================================================================
// 5. BIDIRECTIONAL DYNAMIC CROSS-INPUT LINKER
// ============================================================================
function setupReactiveSubjectSyncObservers() {
    const subPanel = document.getElementById('subjectSection');
    if (!subPanel) return;

    subPanel.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            setProfileToCustomOverride();
            syncSubjectBreakdownToMainInputs();
        }
    });
}

function setupMainFallbackInputObservers() {
    ['studentName', 'testName', 'totalQs', 'maxMarks', 'attempted', 'wrong'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                if(id !== 'studentName' && id !== 'testName') {
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

    if(aggregateTotal > 0) document.getElementById('totalQs').value = aggregateTotal;
    
    let computedAttempts = aggregateCorrect + aggregateWrong;
    if(computedAttempts > 0 || aggregateWrong > 0) {
        document.getElementById('attempted').value = computedAttempts;
        document.getElementById('wrong').value = aggregateWrong;
    }
}

// ============================================================================
// 6. FLUENT NOTIFICATION SYSTEM & UI CRITICAL VALIDATION ENGINE
// ============================================================================
function triggerSystemToastNotification(message, isError = true) {
    const toast = document.getElementById('systemNotification');
    const msgSpan = document.getElementById('notificationMessage');
    if (!toast || !msgSpan) return;

    msgSpan.textContent = message;
    if (isError) {
        toast.style.background = "rgba(239, 68, 68, 0.15)";
        toast.style.borderColor = "rgba(239, 68, 68, 0.3)";
        toast.style.color = "#fca5a5";
    } else {
        toast.style.background = "rgba(16, 185, 129, 0.15)";
        toast.style.borderColor = "rgba(16, 185, 129, 0.3)";
        toast.style.color = "#a7f3d0";
    }

    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 5000);
}

function clearInputValidationStyles() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('validation-error'));
}

function scanAndValidateSystemInputs() {
    clearInputValidationStyles();
    let invalidNodes = [];

    // 1. Structural Identity Diagnostics
    const studentName = document.getElementById('studentName');
    const testName = document.getElementById('testName');
    
    if (!studentName.value.trim()) invalidNodes.push(studentName);
    if (!testName.value.trim()) invalidNodes.push(testName);

    // 2. Global Score Matrix Evaluation
    const totalQs = document.getElementById('totalQs');
    const maxMarks = document.getElementById('maxMarks');
    const attempted = document.getElementById('attempted');
    const wrong = document.getElementById('wrong');

    if (!totalQs.value || parseFloat(totalQs.value) <= 0) invalidNodes.push(totalQs);
    if (!maxMarks.value || parseFloat(maxMarks.value) <= 0) invalidNodes.push(maxMarks);
    if (attempted.value === "" || parseFloat(attempted.value) < 0) invalidNodes.push(attempted);
    if (wrong.value === "" || parseFloat(wrong.value) < 0) invalidNodes.push(wrong);

    // 3. Subject Wise Multi-Channel Subsystem Verification
    const reportType = document.getElementById('reportType').value;
    if (reportType === 'subjectwise') {
        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const ta = document.getElementById(`${sub}A`);
            const tc = document.getElementById(`${sub}C`);
            const tw = document.getElementById(`${sub}W`);
            
            if (!ta.value || parseFloat(ta.value) < 0) invalidNodes.push(ta);
            if (tc.value === "" || parseFloat(tc.value) < 0) invalidNodes.push(tc);
            if (tw.value === "" || parseFloat(tw.value) < 0) invalidNodes.push(tw);
        });
    }

    // Logical bound sanity checker
    if (invalidNodes.length === 0) {
        if (parseFloat(wrong.value) > parseFloat(attempted.value)) {
            invalidNodes.push(wrong);
            invalidNodes.push(attempted);
            triggerSystemToastNotification("Logic Error: Incorrect faults cannot exceed total attempts.");
            animateContainerShake();
            return false;
        }
        if (parseFloat(attempted.value) > parseFloat(totalQs.value)) {
            invalidNodes.push(attempted);
            invalidNodes.push(totalQs);
            triggerSystemToastNotification("Logic Error: Total attempts cannot exceed total questions.");
            animateContainerShake();
            return false;
        }
    }

    if (invalidNodes.length > 0) {
        invalidNodes.forEach(node => node.classList.add('validation-error'));
        triggerSystemToastNotification("Action Blocked: Please populate all required fields marked * with valid numerical data.");
        animateContainerShake();
        return false;
    }

    return true;
}

function animateContainerShake() {
    const container = document.getElementById('mainAppContainer');
    if (!container) return;
    container.style.animation = 'none';
    container.offsetHeight; // Force Layout Reflow Matrix
    container.style.animation = 'fluentContainerShake 0.45s cubic-bezier(.36,.07,.19,.97) both';
}

// ============================================================================
// 7. CALCULATION ENGINE LOGIC UNIFICATION
// ============================================================================
function executeCalculationSequence() {
    if (!scanAndValidateSystemInputs()) return null;

    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('markingRatio').value) || 0;
    
    const correct = attempted - wrong;
    const unattempted = Math.max(0, totalQs - attempted);
    const marksPerCorrect = totalQs > 0 ? (maxMarks / totalQs) : 0;
    const totalPenalty = wrong * (marksPerCorrect * ratio); 
    const finalScore = (correct * marksPerCorrect) - totalPenalty;
    const efficiency = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;

    const scoreDisplayNode = document.getElementById('score');
    scoreDisplayNode.innerText = finalScore.toFixed(2);
    
    scoreDisplayNode.style.animation = 'none';
    scoreDisplayNode.offsetHeight;
    scoreDisplayNode.style.animation = 'fluentScalePulse 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    return { 
        totalQs, maxMarks, attempted, wrong, correct, 
        unattempted, finalScore, efficiency, totalPenalty, marksPerCorrect 
    };
}

// ============================================================================
// 8. DATA INTELLIGENCE REPORT COMPILATION GATEWAY (PDF EXPORT)
// ============================================================================
async function downloadPDFReportSequence() {
    // CRITICAL ENGINE SAFEGUARD GATE: Execution halts if inputs fail diagnostics
    const telemetryData = executeCalculationSequence();
    if (!telemetryData) {
        // Validation messages are handled directly inside the validation loop.
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const reportType = document.getElementById('reportType').value;
    const currentProfile = document.getElementById('examProfile').value.toUpperCase();
    const student = document.getElementById('studentName').value.toUpperCase();
    const test = document.getElementById('testName').value.toUpperCase();
    const timestamp = new Date().toLocaleString().toUpperCase();

    // Background Canvas
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Light Technical Grid Architecture
    doc.setDrawColor(240, 244, 248);
    doc.setLineWidth(0.25);
    for (let i = 10; i < 210; i += 20) doc.line(i, 0, i, 297);
    for (let j = 10; j < 297; j += 20) doc.line(0, j, 210, j);

    // Frame
    doc.setDrawColor(148, 163, 184); doc.setLineWidth(0.3);
    doc.rect(8, 8, 194, 281);

    // Header Panel
    doc.setFillColor(248, 250, 252);
    doc.rect(10, 10, 190, 32, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 32, 'D');
    
    doc.setFillColor(14, 165, 233); doc.rect(10, 41, 130, 1, 'F');
    doc.setFillColor(168, 85, 247); doc.rect(140, 41, 60, 1, 'F');

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("NEGATIVE MARKING PERFORMANCE REPORT", 16, 21);
    
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(14, 165, 233);
    doc.text(`SYSTEM CORE: METRIC_PROFILE_${currentProfile} // CODE v5.0`, 16, 27);
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text("ECLIPSE7 PERFORMANCE MATRIX LABORATORY | AUDITOR: SAIPRASAD BARURE", 16, 35);

    // Telemetry Fields Layout Blocks
    let cardY = 48;
    doc.setFillColor(241, 245, 249); doc.rect(10, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(10, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" SECURE INITIAL IDENTITY MATRIX", 12, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255); doc.setDrawColor(203, 213, 225);
    doc.rect(10, cardY + 6, 92, 26, 'DF');
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("CANDIDATE INITIALS :", 14, cardY + 14);
    doc.text("TARGET MATRIX APP  :", 14, cardY + 22);
    doc.text("SYSTEM TIME STAMP  :", 14, cardY + 30);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(student.length > 20 ? student.substring(0, 20) + "..." : student, 44, cardY + 14);
    doc.text(test.length > 20 ? test.substring(0, 20) + "..." : test, 44, cardY + 22);
    doc.setFont("courier", "bold"); doc.setFontSize(6.5); doc.text(timestamp, 44, cardY + 30);

    // Numerical Telemetry Columns
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

    // Score Dashboard Layout Banner
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

    // Telemetry Graph Segmentation
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

    // Subject Breakdown Print Blocks
    if (reportType === 'subjectwise') {
        doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(10, meterY - 1, 200, meterY - 1);
        doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text("CROSS-SUBJECT ANALYTICS MATRIX", 11, meterY + 4);
        meterY += 9;

        const dynLabel = document.getElementById('mathBioLabel')?.textContent || 'MATH / BIO';
        const rows = [
            { name: 'PHYSICS SUBSYSTEM', kA: 'phyA', kC: 'phyC', kW: 'phyW' },
            { name: 'CHEMISTRY SUBSYSTEM', kA: 'chemA', kC: 'chemC', kW: 'chemW' },
            { name: `${dynLabel} SUBSYSTEM`, kA: 'mathBioA', kC: 'mathBioC', kW: 'mathBioW' }
        ];

        rows.forEach(r => {
            const total = parseInt(document.getElementById(r.kA).value) || 0;
            const corr = parseInt(document.getElementById(r.kC).value) || 0;
            const wrng = parseInt(document.getElementById(r.kW).value) || 0;

            doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
            doc.text(r.name, 11, meterY + 3);

            if (total > 0) {
                let maxWidth = 122;
                let cW = (corr / total) * maxWidth;
                let wW = (wrng / total) * maxWidth;
                let iW = Math.max(0, maxWidth - (cW + wW));

                doc.setFillColor(16, 185, 129); if(cW > 0) doc.rect(74, meterY, cW, 4.0, 'F');
                doc.setFillColor(244, 63, 94); if(wW > 0) doc.rect(74 + cW, meterY, wW, 4.0, 'F');
                doc.setFillColor(241, 245, 249); if(iW > 0) doc.rect(74 + cW + wW, meterY, iW, 4.0, 'F');
                
                doc.setDrawColor(203, 213, 225); doc.rect(74, meterY, maxWidth, 4.0, 'D');
                doc.setFontSize(5.5); doc.setTextColor(15, 23, 42); doc.setFont("courier", "bold");
                doc.text(`[ OK: ${corr} | WRG: ${wrng} | IDLE: ${Math.max(0, total-(corr+wrng))} ]`, 158, meterY - 1.2);
            } else {
                doc.setFont("helvetica", "oblique"); doc.setFontSize(6); doc.setTextColor(148, 163, 184);
                doc.text("CHANNEL OFFLINE // NO CURRICULUM STREAM LOADED IN DATA MODEM", 74, meterY + 3);
            }
            meterY += 7;
        });
    }

    // Terminal Insights Panel Block
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

    // Footer Sign-Off Blocks
    const finalFooterY = 254;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(10, finalFooterY - 4, 200, finalFooterY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("MR. PRASAD REDDY", 14, finalFooterY + 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterY + 9);
    doc.setFont("courier", "bold"); doc.setFontSize(7); doc.setTextColor(5, 150, 105);
    doc.text("STATUS: INTEGRITY MATRIX APPROVED & DIGITAL RECORD VERIFIED VIA CORE STREAM", 14, finalFooterY + 14);

    // Async Local Image Retrieval Channel For Stamp Embeds
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "stamp.jpg"; 
    
    img.onload = function() {
        doc.addImage(img, 'JPEG', 158, 244, 34, 34);
        doc.save(`${student.replace(/ /g, "_")}_E7_METRIC_REPORT.pdf`);
    };
    img.onerror = () => {
        doc.save(`${student.replace(/ /g, "_")}_E7_METRIC_REPORT.pdf`);
    };
}
