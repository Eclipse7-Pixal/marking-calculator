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

    // Hook buttons
    document.getElementById('computeEngineMetricsBtn').addEventListener('click', triggerEvaluationSequence);
    document.getElementById('resetEngineStateBtn').addEventListener('click', clearFormResetEngineState);
    document.getElementById('generatePdfReportBtn').addEventListener('click', exportCertifiedPdfReportDocument);
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

    const totalQsInput = document.getElementById('totalQs');

    if (profileKey === 'custom') {
        if (totalQsInput) {
            totalQsInput.classList.remove('profile-locked-row');
        }
        return;
    }

    if (totalQsInput) {
        totalQsInput.classList.add('profile-locked-row');
    }

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
    
    ['phy', 'chem', 'mathBio'].forEach(sub => executeRowAlgebraSolver(sub));
    syncSubjectBreakdownToMainInputs();
}

function setProfileToCustomOverride() {
    const hiddenProf = document.getElementById('examProfile');
    const triggerProf = document.getElementById('examProfileLabel');
    
    const totalQsInput = document.getElementById('totalQs');
    if (totalQsInput) {
        totalQsInput.classList.remove('profile-locked-row');
    }

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
// 5. BIDIRECTIONAL DYNAMIC CROSS-INPUT LINKER & ALGEBRA MATRIX SOLVER
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
    if (targetNode.id !== 'totalQs' && !targetNode.classList.contains('profile-locked-row')) {
        const selectedProfile = document.getElementById('examProfile').value;
        if (selectedProfile === 'custom' || targetNode.classList.contains('sub-input')) {
            // Allowed override flows
        }
    }
    const card = targetNode.closest('.subject-card-panel');
    if (card) {
        const subjectKey = card.getAttribute('data-subject');
        executeRowAlgebraSolver(subjectKey, targetNode);
    }
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
            elCor.value = updatedCor === 0 ? '' : updatedCor;
        } else if (activeElement === elWro) {
            let updatedCor = Math.max(0, tot - wro - not);
            elCor.value = updatedCor === 0 ? '' : updatedCor;
        } else {
            let updatedNot = Math.max(0, tot - cor - wro);
            elNot.value = updatedNot === 0 ? '' : updatedNot;
        }
    } else if (filledFields.length === 2) {
        const containsC = filledFields.some(f => f.id === 'C');
        const containsW = filledFields.some(f => f.id === 'W');
        const containsN = filledFields.some(f => f.id === 'N');

        if (containsC && containsW) {
            let val = tot - cor - wro;
            elNot.value = val <= 0 ? '' : val;
        } else if (containsC && containsN) {
            let val = tot - cor - not;
            elWro.value = val <= 0 ? '' : val;
        } else if (containsW && containsN) {
            let val = tot - wro - not;
            elCor.value = val <= 0 ? '' : val;
        }
    }
}

function syncSubjectBreakdownToMainInputs() {
    if (document.getElementById('reportType').value !== 'subjectwise') return;

    let aggregateAttempted = 0;
    let aggregateWrong = 0;
    let aggregateTotalQs = 0;

    ['phy', 'chem', 'mathBio'].forEach(sub => {
        const c = parseFloat(document.getElementById(`${sub}C`).value) || 0;
        const w = parseFloat(document.getElementById(`${sub}W`).value) || 0;
        const t = parseFloat(document.getElementById(`${sub}A`).value) || 0;

        aggregateAttempted += (c + w);
        aggregateWrong += w;
        aggregateTotalQs += t;
    });

    document.getElementById('attempted').value = aggregateAttempted || '';
    document.getElementById('wrong').value = aggregateWrong || '';

    if (document.getElementById('examProfile').value === 'custom' && aggregateTotalQs > 0) {
        document.getElementById('totalQs').value = aggregateTotalQs;
    }
}

function setupMainFallbackInputObservers() {
    ['totalQs', 'correctMarks'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (id === 'totalQs' || id === 'correctMarks') {
                    setProfileToCustomOverride();
                }
            });
        }
    });
}

// ============================================================================
// 6. CRYPTOGRAPHIC DATA PACK TELEMETRY MATRIX COMPILER
// ============================================================================
let evaluationTelemetryPacket = null;

function triggerEvaluationSequence() {
    clearInputValidationStyles();

    const studentName = document.getElementById('studentName').value.trim();
    const testName = document.getElementById('testName').value.trim();
    const isSubjectWise = document.getElementById('reportType').value === 'subjectwise';

    if (!studentName || !testName) {
        showSystemToastNotification("Authentication Profiles incomplete. Please authenticate identity details.");
        if(!studentName) flagFieldAsViolated('studentName');
        if(!testName) flagFieldAsViolated('testName');
        return;
    }

    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const plusWeight = parseFloat(document.getElementById('correctMarks').value) || 0;
    const ratio = parseFloat(document.getElementById('markingRatio').value) || 0;
    const minusWeight = plusWeight * ratio;

    if (totalQs <= 0 || maxMarks <= 0 || plusWeight <= 0) {
        showSystemToastNotification("Core marking parameters must hold absolute positive limits.");
        return;
    }

    let globalCorrect = 0, globalWrong = 0, globalAttempted = 0, globalUnattempted = 0;
    let subjectsTelemetry = {};

    if (isSubjectWise) {
        let logicalViolationDetected = false;

        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const label = sub === 'mathBio' ? document.getElementById('mathBioLabel').textContent : sub.toUpperCase();
            const alloc = parseFloat(document.getElementById(`${sub}A`).value) || 0;
            const cor = parseFloat(document.getElementById(`${sub}C`).value) || 0;
            const wro = parseFloat(document.getElementById(`${sub}W`).value) || 0;
            const not = parseFloat(document.getElementById(`${sub}N`).value) || 0;

            if (alloc < (cor + wro + not) && alloc > 0) {
                showSystemToastNotification(`Mathematical Overflow in ${label} parameters.`);
                flagFieldAsViolated(`${sub}A`);
                logicalViolationDetected = true;
            }

            const subScore = (cor * plusWeight) - (wro * minusWeight);
            subjectsTelemetry[sub] = { label, allocated: alloc, correct: cor, wrong: wro, unattempted: not, score: subScore };

            globalCorrect += cor;
            globalWrong += wro;
            globalUnattempted += not;
            globalAttempted += (cor + wro);
        });

        if (logicalViolationDetected) return;

    } else {
        globalAttempted = parseFloat(document.getElementById('attempted').value) || 0;
        globalWrong = parseFloat(document.getElementById('wrong').value) || 0;
        globalCorrect = Math.max(0, globalAttempted - globalWrong);
        globalUnattempted = Math.max(0, totalQs - globalAttempted);
    }

    const compiledNetScore = (globalCorrect * plusWeight) - (globalWrong * minusWeight);
    const totalPenaltyLoss = globalWrong * minusWeight;
    const exactAccuracyIndex = globalAttempted > 0 ? (globalCorrect / globalAttempted) * 100 : 0;

    evaluationTelemetryPacket = {
        studentName, testName, totalQs, maxMarks, plusWeight, minusWeight, ratio,
        globalCorrect, globalWrong, globalAttempted, globalUnattempted,
        compiledNetScore, totalPenaltyLoss, exactAccuracyIndex,
        isSubjectWise, subjects: subjectsTelemetry,
        timestamp: new Date().toLocaleString()
    };

    renderTelemetryDashboardOutputs();
}

function renderTelemetryDashboardOutputs() {
    const data = evaluationTelemetryPacket;
    if (!data) return;

    document.getElementById('renderNetScore').textContent = data.compiledNetScore.toFixed(0);
    document.getElementById('renderScoreRatio').textContent = `Out of ${data.maxMarks} Maximum Limit`;
    document.getElementById('renderAccuracy').textContent = `${data.exactAccuracyIndex.toFixed(2)}%`;
    document.getElementById('renderAttempted').textContent = data.globalAttempted;
    document.getElementById('renderPenalty').textContent = `-${data.totalPenaltyLoss.toFixed(1)}`;
    document.getElementById('renderUnattempted').textContent = data.globalUnattempted;

    const wrapper = document.getElementById('dynamicSubjectSummaryNode');
    wrapper.innerHTML = '';

    if (data.isSubjectWise) {
        Object.keys(data.subjects).forEach(key => {
            const s = data.subjects[key];
            const div = document.createElement('div');
            div.className = `subject-summary-row`;
            div.innerHTML = `
                <span class="summary-row-label">${s.label}</span>
                <span class="summary-row-stats">Score: <strong>${s.score.toFixed(0)}</strong> | Att: ${s.correct + s.wrong} [R: ${s.correct} / W: ${s.wrong}]</span>
            `;
            wrapper.appendChild(div);
        });
    }

    const reportPanel = document.getElementById('diagnosticReportDashboard');
    reportPanel.classList.add('activated');
    reportPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================================
// 7. JSPDF OFFICIAL CRITICAL CORE EXPORT REPORT MECHANICS
// ============================================================================
function exportCertifiedPdfReportDocument() {
    const data = evaluationTelemetryPacket;
    if (!data) {
        showSystemToastNotification("No telemetry data compiled. Run diagnostics first.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Structural Geometry coordinates mapping
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 40, 'F'); 
    doc.setFillColor(124, 58, 237); doc.rect(0, 40, 210, 2.5, 'F');

    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text("ECLIPSE7 PERFORMANCE CORE", 14, 18);
    doc.setFont("courier", "bold"); doc.setFontSize(8.5); doc.setTextColor(147, 197, 253);
    doc.text(">> NEGATIVE MARKING DIAGNOSTIC ENGINE COMPILER // VER 2.5", 14, 25);

    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text(`GENERATED: ${data.timestamp.toUpperCase()}`, 144, 25);

    // Profile Blocks metadata 
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("STUDENT IDENTITY  :", 14, 54);
    doc.setFont("helvetica", "normal"); doc.text(data.studentName.toUpperCase(), 54, 54);

    doc.setFont("helvetica", "bold"); doc.text("ASSESSMENT TOKEN  :", 14, 60);
    doc.setFont("helvetica", "normal"); doc.text(data.testName.toUpperCase(), 54, 60);

    doc.setFont("helvetica", "bold"); doc.text("EVALUATION SCHEMA :", 14, 66);
    doc.setFont("helvetica", "normal"); doc.text(document.getElementById('examProfileLabel').textContent, 54, 66);

    // Primary Score Board Matrix
    doc.setFillColor(248, 250, 252); doc.roundedRect(14, 74, 182, 34, 4, 4, 'FD');
    doc.setDrawColor(226, 232, 240); doc.rect(14, 74, 182, 34);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("NET MATRIX SCORE SECURED", 24, 86);
    doc.setTextColor(124, 58, 237); doc.setFontSize(36);
    doc.text(`${data.compiledNetScore.toFixed(0)}`, 24, 101);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("ACCURACY RATING INDEX", 124, 86);
    doc.setTextColor(15, 23, 42); doc.setFontSize(26);
    doc.text(`${data.exactAccuracyIndex.toFixed(2)}%`, 124, 100);

    // Dynamic Tabular Array Compilation
    let tableBody = [];
    if (data.isSubjectWise) {
        Object.keys(data.subjects).forEach(k => {
            const s = data.subjects[k];
            tableBody.push([s.label, s.allocated, s.correct + s.wrong, s.correct, s.wrong, s.unattempted, s.score.toFixed(0)]);
        });
    } else {
        tableBody.push(["Global Overview Profile", data.totalQs, data.globalAttempted, data.globalCorrect, data.globalWrong, data.globalUnattempted, data.compiledNetScore.toFixed(0)]);
    }

    doc.autoTable({
        startY: 118,
        head: [['PERFORMANCE EVALUATION DOMAIN', 'TOTAL Q', 'ATTEMPTED', 'CORRECT (R)', 'INCORRECT (W)', 'UNATTEMPTED', 'NET WEIGHT']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], fontSize: 8.5, font: 'helvetica', fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, font: 'helvetica', textColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: 'bold' }, 6: { fontStyle: 'bold' } }
    });

    let currentY = doc.lastAutoTable.finalY + 12;

    // Diagnostic System Recommendations Box
    doc.setFillColor(241, 245, 249); doc.roundedRect(14, currentY, 182, 38, 3, 3, 'F');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
    doc.text("ENGINE TELEMETRY SYSTEM DIAGNOSTICS", 20, currentY + 7);

    doc.setFont("courier", "bold"); doc.setFontSize(8.5); doc.setTextColor(51, 65, 85);
    
    let recommStr = data.exactAccuracyIndex > 80 ? "CRITICAL EFFICIENCY ACCELERATION CONFIRMED." : "CONSOLIDATE ERRORS IMMEDIATELY TO REMOVE PENALTY DRAINS.";
    doc.text(`>> RECOM_STRATEGY : ${recommStr}`, 20, currentY + 16);
    doc.text(`>> PENALTY_DECAY  : REGISTERED LOSS SUBTRACTS ${data.totalPenaltyLoss.toFixed(1)} MARKS FROM ASSIGNED CAPACITY.`, 20, currentY + 23);
    doc.text(`>> EFFICIENCY_GAP : ${data.globalUnattempted} UNATTEMPTED SEGMENTS IDENTIFIED FOR PERFORMANCE OPTIMIZATION.`, 20, currentY + 30);

    // Official Verification Signature Dock Footer
    const finalFooterY = 265;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(14, finalFooterY - 4, 196, finalFooterY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("MR. SAIPRASAD BARURE", 14, finalFooterY + 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterY + 9);

    doc.save(`E7_Marking_Report_${data.studentName.replace(/\s+/g, '_')}.pdf`);
}

// Helper styling state engines
function showSystemToastNotification(msg) {
    const toast = document.getElementById('systemNotification');
    document.getElementById('notificationMessage').textContent = msg;
    toast.classList.add('active');
    setTimeout(() => { toast.classList.remove('active'); }, 4000);
}

function flagFieldAsViolated(id) {
    const el = document.getElementById(id);
    if(el) el.style.borderColor = '#ef4444';
}

function clearInputValidationStyles() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => i.style.borderColor = '');
}

function clearFormResetEngineState() {
    document.getElementById('evaluationForm').reset();
    clearInputValidationStyles();
    document.getElementById('diagnosticReportDashboard').classList.remove('activated');
    applySelectedExamProfile('jeemain');
    document.getElementById('examProfileLabel').textContent = EXAM_PROFILES.jeemain.label;
    document.getElementById('examProfile').value = 'jeemain';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
