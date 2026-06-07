// ============================================================================
// 1. CURRICULUM INTELLIGENCE CORE CONFIGURATION MATRIX
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
        intel: "Curriculum: JEE Main loaded. Total Q: 75 [25 Single Choice/NV per subject]. Marking: +4 / -1."
    },
    jeeadv: {
        label: "JEE ADVANCED PROFILE",
        totalQs: 54,
        maxMarks: 180,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4",
        subjects: { phy: 18, chem: 18, mathBio: 18 },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Advanced variables initialized (Dynamic Pattern Base). Standardizing at 18Q/subject."
    },
    neet: {
        label: "NEET UG PROFILE",
        totalQs: 180,
        maxMarks: 720,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4",
        subjects: { phy: 45, chem: 45, mathBio: 90 },
        labelMathBio: "BIOLOGY",
        intel: "Curriculum: NEET UG loaded. Total Q: 180 [Phy: 45, Chem: 45, Bio: 90]. Marking: +4 / -1."
    },
    custom: {
        label: "CUSTOM MODE (MANUAL)",
        intel: "Manual Override active. Enter specific examination constants below."
    }
};

// ============================================================================
// 2. UNIVERSAL DROPDOWN ENGINE WITH SYNC & PREFIX PRESERVATION
// ============================================================================
function initDropdown(containerId, triggerId, panelId, hiddenInputId, callback) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const panel = document.getElementById(panelId);
    const hidden = document.getElementById(hiddenInputId);
    if (!container || !trigger || !panel) return;

    const options = panel.querySelectorAll('.option-item');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        
        document.querySelectorAll('.select-options').forEach(p => {
            if(p !== panel) p.classList.remove('show');
        });
        document.querySelectorAll('.custom-select').forEach(c => {
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
// 3. COMPLETE DOM READY BINDING MATRIX
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initDropdown('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectInputs);
    initDropdown('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', () => {
        setProfileToCustom();
    });
    initDropdown('examProfileSelectContainer', 'examProfileLabel', 'examProfileOptions', 'examProfile', applyExamProfile);
    
    // Bind Realtime Intelligence Sync Observers to Subject Target Vectors
    setupSubjectChangeTracking();
    setupMainInputsFallbackTracking();
    
    toggleSubjectInputs();
});

function toggleSubjectInputs() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    if (!section) return;

    if (type === 'subjectwise') {
        section.classList.add('visible');
        // Auto-run sync from current subject numbers to refresh top nodes
        syncSubjectInputsToMain();
    } else {
        section.classList.remove('visible');
    }
}

// ============================================================================
// 4. SMART CURRICULUM PROFILE ENGINE
// ============================================================================
function applyExamProfile(profileKey) {
    const profile = EXAM_PROFILES[profileKey];
    if (!profile) return;

    // Update Status Label Interface Text
    const intelBox = document.getElementById('intelMessage');
    if (intelBox) intelBox.textContent = profile.intel;

    if (profileKey === 'custom') return;

    // Force inject static profile curriculum values
    document.getElementById('totalQs').value = profile.totalQs;
    document.getElementById('maxMarks').value = profile.maxMarks;

    // Synchronize Marking Multipliers
    document.getElementById('markingRatio').value = profile.ratio;
    document.getElementById('ratioLabel').textContent = profile.labelRatio;

    // Change label tags according to curriculum configuration (e.g., Biology vs Math)
    const mbLabel = document.getElementById('mathBioLabel');
    if (mbLabel && profile.labelMathBio) mbLabel.textContent = profile.labelMathBio;

    // Fill structural breakdown values
    document.getElementById('phyA').value = profile.subjects.phy;
    document.getElementById('chemA').value = profile.subjects.chem;
    document.getElementById('mathBioA').value = profile.subjects.mathBio;

    // Clear previous dynamic interaction residuals
    clearSubjectCalculations();
}

function setProfileToCustom() {
    const hiddenProf = document.getElementById('examProfile');
    const triggerProf = document.getElementById('examProfileLabel');
    if(hiddenProf && hiddenProf.value !== 'custom') {
        hiddenProf.value = 'custom';
        if(triggerProf) triggerProf.textContent = EXAM_PROFILES.custom.label;
        const intelBox = document.getElementById('intelMessage');
        if (intelBox) intelBox.textContent = EXAM_PROFILES.custom.intel;
    }
}

function clearSubjectCalculations() {
    ['phy', 'chem', 'mathBio'].forEach(sub => {
        document.getElementById(`${sub}C`).value = '';
        document.getElementById(`${sub}W`).value = '';
    });
    document.getElementById('attempted').value = '';
    document.getElementById('wrong').value = '';
}

// ============================================================================
// 5. BIDIRECTIONAL REACTIVE INPUT LINKER & INTELLIGENCE RUN
// ============================================================================
function setupSubjectChangeTracking() {
    const subPanel = document.getElementById('subjectSection');
    if (!subPanel) return;

    // Listen to changes recursively across the subject section grid layout
    subPanel.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            // Any structural manual entry detaches standard preset modes
            if (!e.target.classList.contains('sub-tot')) {
                 setProfileToCustom();
            } else {
                 setProfileToCustom();
            }
            syncSubjectInputsToMain();
        }
    });
}

function setupMainInputsFallbackTracking() {
    ['totalQs', 'maxMarks', 'attempted', 'wrong'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                setProfileToCustom();
            });
        }
    });
}

function syncSubjectInputsToMain() {
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

    // Mirror aggregated metrics directly to global control modules
    if(aggregateTotal > 0) document.getElementById('totalQs').value = aggregateTotal;
    
    // Only mirror attempts and faults if student has actively filled details
    let totalAttemptsCalculated = aggregateCorrect + aggregateWrong;
    if(totalAttemptsCalculated > 0 || aggregateWrong > 0) {
        document.getElementById('attempted').value = totalAttemptsCalculated;
        document.getElementById('wrong').value = aggregateWrong;
    }
}

// ============================================================================
// 6. CORE ANALYTICAL CALCULATION ENGINE (CORE IMMUTABLE LOGIC)
// ============================================================================
function calculateScore() {
    // If breakdown layout option is operational, re-sync values to catch edge-cases
    syncSubjectInputsToMain();

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

    document.getElementById('score').innerText = finalScore.toFixed(2);
    
    // Add micro-animation punch on calculated numbers
    const scoreValEl = document.getElementById('score');
    if(scoreValEl) {
        scoreValEl.style.animation = 'none';
        scoreValEl.offsetHeight; // Force reflow matrix
        scoreValEl.style.animation = 'scorePulse 0.5s ease-out';
    }

    return { 
        totalQs, maxMarks, attempted, wrong, correct, 
        unattempted, finalScore, efficiency, totalPenalty, marksPerCorrect 
    };
}

// ============================================================================
// 7. EXTRAORDINARY PDF GENERATION REPORT (STAMP INCLUDED)
// ============================================================================
async function downloadPDF() {
    const data = calculateScore();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const reportType = document.getElementById('reportType').value;
    const currentProfile = document.getElementById('examProfile').value.toUpperCase();
    const student = (document.getElementById('studentName').value || "UNVERIFIED_CANDIDATE").toUpperCase();
    const test = (document.getElementById('testName').value || "CORE_ASSESSMENT_RUN").toUpperCase();
    const timestamp = new Date().toLocaleString().toUpperCase();

    // --- PHASE 1: LIGHT MICRO-GRID BLUEPRINT BACKGROUND MATRIX ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setDrawColor(240, 244, 248);
    doc.setLineWidth(0.25);
    for (let i = 10; i < 210; i += 20) doc.line(i, 0, i, 297);
    for (let j = 10; j < 297; j += 20) doc.line(0, j, 210, j);

    // --- PHASE 2: TECHNICAL OUTER BOUNDING FRAME & ACCENT TICKS ---
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.rect(8, 8, 194, 281);
    
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.7);
    doc.line(6, 6, 16, 6); doc.line(6, 6, 6, 16);
    doc.line(204, 6, 194, 6); doc.line(204, 6, 204, 16);
    doc.line(6, 291, 16, 291); doc.line(6, 291, 6, 281);
    doc.line(204, 291, 194, 291); doc.line(204, 291, 204, 281);

    // --- PHASE 3: HEADER PANEL ---
    doc.setFillColor(248, 250, 252);
    doc.rect(10, 10, 190, 32, 'F');
    
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 32, 'D');
    
    doc.setFillColor(14, 165, 233);
    doc.rect(10, 41, 130, 1, 'F');
    doc.setFillColor(168, 85, 247);
    doc.rect(140, 41, 60, 1, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("NEGATIVE MARKING PERFORMANCE REPORT", 16, 21);
    
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(14, 165, 233);
    doc.text(`SYSTEM CORE: PROFILE_${currentProfile} // EMISSION RUN: E7_V4.5_GEN_${Math.floor(1000 + Math.random() * 9000)}`, 16, 27);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("ECLIPSE7 PERFORMANCE MATRIX LABORATORY | REPRESENTATIVE: SAIPRASAD BARURE", 16, 35);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.rect(156, 14, 38, 8, 'DF');
    doc.setTextColor(71, 85, 105);
    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.text("PRINT OPTIMIZED", 161, 19);

    // --- PHASE 4: ASYMMETRIC TWO-COLUMN TELEMETRY PODS GRID ---
    let cardY = 48;
    
    doc.setFillColor(241, 245, 249);
    doc.rect(10, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3);
    doc.rect(10, cardY, 92, 6, 'D');
    
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" SECURE INITIAL IDENTITY MATRIX", 12, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.rect(10, cardY + 6, 92, 26, 'DF');
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("CANDIDATE INITIALS :", 14, cardY + 14);
    doc.text("TARGET MATRIX APP  :", 14, cardY + 22);
    doc.text("SYSTEM TIME STAMP  :", 14, cardY + 30);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(student.length > 20 ? student.substring(0, 20) + "..." : student, 44, cardY + 14);
    doc.text(test.length > 20 ? test.substring(0, 20) + "..." : test, 44, cardY + 22);
    doc.setFont("courier", "bold"); doc.setFontSize(6.5);
    doc.text(timestamp, 44, cardY + 30);

    doc.setFillColor(241, 245, 249);
    doc.rect(108, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3);
    doc.rect(108, cardY, 92, 6, 'D');
    
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" LOAD DATA STRUCTURAL CONSTANTS", 110, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.rect(108, cardY + 6, 92, 26, 'DF');
    
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("TOTAL QUESTIONS    :", 112, cardY + 13);
    doc.text("MAX EVAL MARKS      :", 112, cardY + 19);
    doc.text("EVAL USER ATTEMPTS  :", 112, cardY + 25);
    doc.text("VERIFIED FAULTS     :", 112, cardY + 31);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(`${data.totalQs} ITEMS`, 148, cardY + 13);
    doc.text(`${data.maxMarks} MARKS`, 148, cardY + 19);
    doc.text(`${data.attempted} UNITS`, 148, cardY + 25);
    doc.setTextColor(225, 29, 72);
    doc.text(`${data.wrong} FAULTS`, 148, cardY + 31);

    // --- PHASE 5: GRAND SCORE BADGE VIEW ---
    let scoreY = 86;
    doc.setFillColor(250, 251, 253);
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.4);
    doc.rect(10, scoreY, 190, 24, 'DF');
    
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
    doc.line(68, scoreY, 68, scoreY + 24);
    doc.line(142, scoreY, 142, scoreY + 24);
    
    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text("COMPUTED REAL MARKS", 15, scoreY + 6);
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(`${(data.correct * data.marksPerCorrect).toFixed(2)}`, 15, scoreY + 14);
    doc.setFontSize(6); doc.setTextColor(148, 163, 184);
    doc.text(`FROM ${data.correct} CORRECT UNTIED ANCHORS`, 15, scoreY + 20);

    doc.setTextColor(14, 165, 233); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("INTELLIGENCE ENGINE SCORE RUN", 73, scoreY + 6);
    doc.setFont("courier", "bold"); doc.setFontSize(20); doc.setTextColor(15, 23, 42);
    doc.text(`${data.finalScore.toFixed(2)}`, 73, scoreY + 15);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(`/ ${data.maxMarks} ABSOLUTE EVALUATION LIMIT`, 73, scoreY + 21);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text("ENGINE EFFICIENCY RATIO", 147, scoreY + 6);
    
    if(data.efficiency >= 75) doc.setTextColor(5, 150, 105);
    else if(data.efficiency >= 45) doc.setTextColor(217, 119, 6);
    else doc.setTextColor(220, 38, 38);
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text(`${data.efficiency}%`, 147, scoreY + 14);
    doc.setFontSize(6); doc.setTextColor(148, 163, 184);
    doc.text("SCALED PERFORMANCE METRIC VALUE", 147, scoreY + 20);

    // --- PHASE 6: TELEMETRY METER BARS ---
    let meterY = 118;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4);
    doc.line(10, meterY - 4, 200, meterY - 4);
    
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("BASIC INFO OF RESULT", 11, meterY);
    meterY += 5;

    const dataMeters = [
        { title: "ACCURACY TRACKER", value: data.correct, max: data.totalQs || 1, color: [14, 165, 233] },
        { title: "PENALTY INFLICTED", value: data.wrong, max: data.totalQs || 1, color: [168, 85, 247] }
    ];

    dataMeters.forEach(mItem => {
        doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
        doc.text(mItem.title, 11, meterY + 3.5);

        let segmentsCount = 24;
        let activeSegments = Math.round((mItem.value / mItem.max) * segmentsCount);
        let barStartX = 74;
        
        for(let s = 0; s < segmentsCount; s++) {
            doc.setLineWidth(0.2);
            if(s < activeSegments) {
                doc.setFillColor(mItem.color[0], mItem.color[1], mItem.color[2]);
                doc.setDrawColor(mItem.color[0], mItem.color[1], mItem.color[2]);
                doc.rect(barStartX + (s * 5.1), meterY, 4.0, 4.0, 'F');
            } else {
                doc.setDrawColor(226, 232, 240);
                doc.rect(barStartX + (s * 5.1), meterY, 4.0, 4.0, 'D');
            }
        }
        meterY += 7;
    });

    // --- PHASE 7: MODULAR SUBJECTWISE BREAKDOWN STACKS ---
    if (reportType === 'subjectwise') {
        doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4);
        doc.line(10, meterY - 1, 200, meterY - 1);
        
        doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text("CROSS-SUBJECT ANALYTICS MODULE ENGINE", 11, meterY + 4);
        meterY += 9;

        const dynamicMBLabel = document.getElementById('mathBioLabel')?.textContent || 'MATH / BIO';
        const analyticalSubjects = [
            { name: 'PHYSICS SUBSYSTEM', keyA: 'phyA', keyC: 'phyC', keyW: 'phyW' },
            { name: 'CHEMISTRY SUBSYSTEM', keyA: 'chemA', keyC: 'chemC', keyW: 'chemW' },
            { name: `${dynamicMBLabel} SUBSYSTEM`, keyA: 'mathBioA', keyC: 'mathBioC', keyW: 'mathBioW' }
        ];

        analyticalSubjects.forEach(subItem => {
            const total = parseInt(document.getElementById(subItem.keyA).value) || 0;
            const corr = parseInt(document.getElementById(subItem.keyC).value) || 0;
            const wrng = parseInt(document.getElementById(subItem.keyW).value) || 0;

            doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
            doc.text(subItem.name, 11, meterY + 3);

            if (total > 0) {
                let segmentMaxWidth = 122;
                let correctWidth = (corr / total) * segmentMaxWidth;
                let wrongWidth = (wrng / total) * segmentMaxWidth;
                let idleWidth = Math.max(0, segmentMaxWidth - (correctWidth + wrongWidth));

                doc.setFillColor(16, 185, 129);
                if(correctWidth > 0) doc.rect(74, meterY, correctWidth, 4.0, 'F');
                
                doc.setFillColor(244, 63, 94);
                if(wrongWidth > 0) doc.rect(74 + correctWidth, meterY, wrongWidth, 4.0, 'F');

                doc.setFillColor(241, 245, 249);
                if(idleWidth > 0) doc.rect(74 + correctWidth + wrongWidth, meterY, idleWidth, 4.0, 'F');
                
                doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.25);
                doc.rect(74, meterY, segmentMaxWidth, 4.0, 'D');
                
                doc.setFontSize(5.5); doc.setTextColor(15, 23, 42); doc.setFont("courier", "bold");
                doc.text(`[ OK: ${corr} | ERR: ${wrng} | IDLE: ${Math.max(0, total - (corr + wrng))} ]`, 146 + 12, meterY - 1.2);
            } else {
                doc.setFont("helvetica", "oblique"); doc.setFontSize(6); doc.setTextColor(148, 163, 184);
                doc.text("CORE CHANNELS SHUT DOWN // DATA FEED UNINITIALIZED IN EVALUATION PLATFORM", 74, meterY + 3);
                doc.setFont("helvetica", "bold");
            }
            meterY += 7;
        });
    }

    // --- PHASE 8: TERMINAL INTEL CONTAINER ---
    let terminalBoxY = Math.max(meterY + 4, 148);
    
    doc.setFillColor(252, 253, 255);
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.4);
    doc.rect(10, terminalBoxY, 190, 36, 'DF');
    
    doc.setFillColor(168, 85, 247);
    doc.rect(10, terminalBoxY, 2.5, 36, 'F');

    doc.setTextColor(15, 23, 42); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
    doc.text("AUTOMATED ALGORITHMIC INTELLIGENCE RECOMMENDATIONS MATRIX", 16, terminalBoxY + 6);
    
    doc.setFont("courier", "bold"); doc.setFontSize(7.5); doc.setTextColor(51, 65, 85);

    let strategyString = "";
    if (data.efficiency > 80) strategyString = "EXCELLENT PERFORMANCE CONTEXT. OPTIMIZE SPEED TRACKERS TO RETAIN PEAK SCALING STATUS.";
    else if (data.efficiency > 50) strategyString = "STABLE INTERMEDIATE SYSTEM ACCURACY. ISOLATE INCIDENCE LOOPS TO BREAK THE 80% THRESHOLD.";
    else strategyString = "CONCEPTUAL CORE VULNERABILITY FOUND. CEASE RANDOM GUESS PROCEDURES TO REMOVE PENALTY DECAY.";

    doc.text(`>> SYSTEM_STRATEGY  : ${strategyString}`, 15, terminalBoxY + 14);
    doc.text(`>> PENALTY_ANALYSIS : TOTAL ACCUMULATED PENALTY IMPACT REDUCES PERFORMANCE BY ${data.totalPenalty.toFixed(2)} ABSOLUTE MARKS.`, 15, terminalBoxY + 21);
    doc.text(`>> CORE_OPTIMIZATION: ANALYZE THE ${data.unattempted} UNATTEMPTED BLANK PROMPTS TO DISCOVER LOW RESISTANCE ADVANTAGES.`, 15, terminalBoxY + 28);

    // --- PHASE 9: EXECUTIVE SIGN-OFF & STAMP ATTACHMENT ---
    const finalFooterY = 254;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4);
    doc.line(10, finalFooterY - 4, 200, finalFooterY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("MR. PRASAD REDDY", 14, finalFooterY + 4);
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterY + 9);
    
    doc.setFont("courier", "bold"); doc.setFontSize(7); doc.setTextColor(5, 150, 105);
    doc.text("STATUS: COGNITIVE SYSTEM RECORD INTEGRITY APPROVED & SECURELY VERIFIED", 14, finalFooterY + 14);
    
    doc.setFont("courier", "normal"); doc.setFontSize(6); doc.setTextColor(148, 163, 184);
    doc.text(`HASH_BLOCK_ID: E7_PRINT_DOCK_RECONSTRUCT_METRIC_VALID_RUN_${timestamp.replace(/ /g, "_")}`, 14, finalFooterY + 21);

    // Dynamic rendering fallback for verification engine stamp image asset (stamp.jpg)
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "stamp.jpg"; 
    
    img.onload = function() {
        doc.addImage(img, 'JPEG', 158, 244, 34, 34);
        doc.save(`${student}_Eclipse7_NME_REPORT.pdf`);
    };
    img.onerror = () => {
        // Fallback save routine if resource assets cannot be compiled locally
        doc.save(`${student}_Eclipse7_NME_REPORT.pdf`);
    };
}
