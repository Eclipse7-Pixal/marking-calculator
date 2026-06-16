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

let currentlyFocusedInputFieldNode = null;
let isTouchFormFactorDevice = false;

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
    isTouchFormFactorDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);

    initDropdownSystem('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectSectionDisplay);
    initDropdownSystem('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', () => { setProfileToCustomOverride(); });
    initDropdownSystem('examProfileSelectContainer', 'examProfileLabel', 'examProfileOptions', 'examProfile', applySelectedExamProfile);
    
    setupReactiveSubjectSyncObservers();
    setupMainFallbackInputObservers();
    setupPremiumVirtualKeyboardCoreEngine();
    
    toggleSubjectSectionDisplay();
    
    const evalForm = document.getElementById('evaluationForm');
    if (evalForm) {
        evalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (executeSystemMetricsValidationRules()) {
                generatePerformanceTelemetryReportPDF();
            }
        });
    }
});

function toggleSubjectSectionDisplay() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    if (!section) return;

    if (type === 'subjectwise') {
        section.classList.add('visible');
        const currentProfile = document.getElementById('examProfile').value;
        if (currentProfile !== 'custom') {
            applySelectedExamProfile(currentProfile);
        } else {
            syncSubjectBreakdownToMainInputs();
        }
    } else {
        section.classList.remove('visible');
        dismissVirtualKeyboardPanel();
    }
}

// ============================================================================
// 4. SMART PROFILING ARCHITECTURE WITH TOTAL & SUBJECT LOCK MATRICES
// ============================================================================
function applySelectedExamProfile(profileKey) {
    const profile = EXAM_PROFILES[profileKey];
    if (!profile) return;

    const intelBox = document.getElementById('intelMessage');
    if (intelBox) intelBox.textContent = profile.intel;

    const totalQsInput = document.getElementById('totalQs');
    const maxMarksInput = document.getElementById('maxMarks');
    const subTotalInputs = [document.getElementById('phyA'), document.getElementById('chemA'), document.getElementById('mathBioA')];

    if (profileKey === 'custom') {
        if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
        if (maxMarksInput) maxMarksInput.classList.remove('profile-locked-row');
        subTotalInputs.forEach(input => {
            if (input) input.classList.remove('profile-locked-row');
        });
        return;
    }

    // Apply UI lock pattern structures to Total and Section Base fields
    if (totalQsInput) totalQsInput.classList.add('profile-locked-row');
    if (maxMarksInput) maxMarksInput.classList.add('profile-locked-row');
    subTotalInputs.forEach(input => {
        if (input) input.classList.add('profile-locked-row');
    });

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
    const maxMarksInput = document.getElementById('maxMarks');
    const subTotalInputs = [document.getElementById('phyA'), document.getElementById('chemA'), document.getElementById('mathBioA')];

    if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
    if (maxMarksInput) maxMarksInput.classList.remove('profile-locked-row');
    subTotalInputs.forEach(input => {
        if (input) input.classList.remove('profile-locked-row');
    });

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
    if (targetNode.id === 'phyA' || targetNode.id === 'chemA' || targetNode.id === 'mathBioA') {
        setProfileToCustomOverride();
    }
    
    const row = targetNode.closest('.subject-grid-row');
    if (row) {
        const subjectKey = row.getAttribute('data-subject');
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
        
        if (structuralMask === 'CW') {
            elNot.value = Math.max(0, tot - cor - wro);
        } else if (structuralMask === 'WN') {
            elCor.value = Math.max(0, tot - wro - not);
        } else if (structuralMask === 'CN') {
            elWro.value = Math.max(0, tot - cor - not);
        }
    }
}

function setupMainFallbackInputObservers() {
    ['studentName', 'testName', 'totalQs', 'maxMarks', 'attempted', 'wrong'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                if(id === 'totalQs' || id === 'maxMarks') {
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

    const currentProfile = document.getElementById('examProfile').value;
    if (currentProfile === 'custom') {
        const totalQsInput = document.getElementById('totalQs');
        if(aggregateTotal > 0 && totalQsInput) {
            totalQsInput.value = aggregateTotal;
        }
    }
    
    let computedAttempts = aggregateCorrect + aggregateWrong;
    document.getElementById('attempted').value = computedAttempts > 0 || aggregateWrong > 0 ? computedAttempts : '';
    document.getElementById('wrong').value = aggregateWrong > 0 ? aggregateWrong : '';
}

// ============================================================================
// 6. GLOSSY TOUCH-OPTIMIZED VIRTUAL KEYPAD CORE SUBSYSTEM
// ============================================================================
function setupPremiumVirtualKeyboardCoreEngine() {
    const targets = document.querySelectorAll('.v-keyboard-target');
    const kbContainer = document.getElementById('glassmorphicKeyboardPanel');
    if (!kbContainer) return;

    targets.forEach(input => {
        if (isTouchFormFactorDevice) {
            input.setAttribute('inputmode', 'none');
        }

        input.addEventListener('click', (e) => {
            if (input.classList.contains('profile-locked-row')) {
                e.preventDefault();
                return;
            }
            
            if (!isTouchFormFactorDevice) return; 
            e.stopPropagation();

            if (currentlyFocusedInputFieldNode) {
                currentlyFocusedInputFieldNode.classList.remove('v-keyboard-focused-node');
            }

            currentlyFocusedInputFieldNode = input;
            input.classList.add('v-keyboard-focused-node');
            
            const kbType = input.getAttribute('data-kb-type') || 'numpad';
            if (kbType === 'qwerty') {
                document.getElementById('numpadMatrixRoot').style.display = 'none';
                document.getElementById('qwertyMatrixRoot').style.display = 'flex';
            } else {
                document.getElementById('numpadMatrixRoot').style.display = 'grid';
                document.getElementById('qwertyMatrixRoot').style.display = 'none';
            }

            kbContainer.classList.add('panel-active');
            adjustViewportPaddingForVirtualKeyboardPanel(true);
        });
    });

    const allKeys = kbContainer.querySelectorAll('.kb-matrix-key, .kb-character-key');
    allKeys.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!currentlyFocusedInputFieldNode) return;

            const commandKeyValue = btn.getAttribute('data-key');
            let baseStringValue = currentlyFocusedInputFieldNode.value;

            btn.style.transform = 'scale(0.92)';
            setTimeout(() => { btn.style.transform = 'none'; }, 80);

            if (commandKeyValue === 'clear') {
                currentlyFocusedInputFieldNode.value = '';
            } else if (commandKeyValue === 'backspace') {
                currentlyFocusedInputFieldNode.value = baseStringValue.slice(0, -1);
            } else {
                const maxLen = currentlyFocusedInputFieldNode.getAttribute('type') === 'number' ? 4 : 32;
                if (baseStringValue.length < maxLen) {
                    currentlyFocusedInputFieldNode.value = baseStringValue + commandKeyValue;
                }
            }

            currentlyFocusedInputFieldNode.dispatchEvent(new Event('input', { bubbles: true }));
            processSubjectRowRecalculationSequence(currentlyFocusedInputFieldNode);
        });
    });

    window.addEventListener('click', (e) => {
        if (kbContainer.classList.contains('panel-active') && !kbContainer.contains(e.target) && !e.target.classList.contains('v-keyboard-target')) {
            dismissVirtualKeyboardPanel();
        }
    });
}

function dismissVirtualKeyboardPanel() {
    const kbContainer = document.getElementById('glassmorphicKeyboardPanel');
    if (kbContainer) {
        kbContainer.classList.remove('panel-active');
    }
    if (currentlyFocusedInputFieldNode) {
        currentlyFocusedInputFieldNode.classList.remove('v-keyboard-focused-node');
        currentlyFocusedInputFieldNode = null;
    }
    adjustViewportPaddingForVirtualKeyboardPanel(false);
}

function adjustViewportPaddingForVirtualKeyboardPanel(isActiveState) {
    if (isActiveState) {
        const kbHeight = document.getElementById('glassmorphicKeyboardPanel').offsetHeight || 260;
        document.body.style.paddingBottom = `${kbHeight + 24}px`;
    } else {
        document.body.style.paddingBottom = '24px';
    }
}

function clearInputValidationStyles() {
    document.querySelectorAll('.validation-error').forEach(node => node.classList.remove('validation-error'));
}

// ============================================================================
// 7. RIGOROUS METRICS ERROR DISPATCH MATRIX
// ============================================================================
function triggerSystemToastNotification(errorMessageString) {
    const toast = document.getElementById('systemNotification');
    const msgContainer = document.getElementById('notificationMessage');
    if (!toast || !msgContainer) return;

    msgContainer.textContent = errorMessageString;
    toast.classList.add('broadcast-active');

    setTimeout(() => {
        toast.classList.remove('broadcast-active');
    }, 4500);
}

function executeSystemMetricsValidationRules() {
    clearInputValidationStyles();
    
    const sName = document.getElementById('studentName');
    const tName = document.getElementById('testName');
    const totalQs = document.getElementById('totalQs');
    const maxMarks = document.getElementById('maxMarks');
    const attempted = document.getElementById('attempted');
    const wrong = document.getElementById('wrong');
    const reportType = document.getElementById('reportType').value;

    let invalidNodes = [];

    if (!sName.value.trim()) invalidNodes.push(sName);
    if (!tName.value.trim()) invalidNodes.push(tName);
    if (!totalQs.value || parseFloat(totalQs.value) <= 0) invalidNodes.push(totalQs);
    if (!maxMarks.value || parseFloat(maxMarks.value) <= 0) invalidNodes.push(maxMarks);
    if (attempted.value === "" || parseFloat(attempted.value) < 0) invalidNodes.push(attempted);
    if (wrong.value === "" || parseFloat(wrong.value) < 0) invalidNodes.push(wrong);

    if (reportType === 'subjectwise') {
        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const ta = document.getElementById(`${sub}A`);
            const tc = document.getElementById(`${sub}C`);
            const tw = document.getElementById(`${sub}W`);
            const tn = document.getElementById(`${sub}N`);

            if (!ta.value || parseFloat(ta.value) < 0) invalidNodes.push(ta);
            if (tc.value === "" || parseFloat(tc.value) < 0) invalidNodes.push(tc);
            if (tw.value === "" || parseFloat(tw.value) < 0) invalidNodes.push(tw);
            if (tn.value === "" || parseFloat(tn.value) < 0) invalidNodes.push(tn);
        });
    }

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
        triggerSystemToastNotification("Action Blocked: Please populate required fields with valid numerical data.");
        animateContainerShake();
        return false;
    }
    return true;
}

function animateContainerShake() {
    const container = document.getElementById('mainAppContainer');
    if (!container) return;
    container.style.animation = 'none';
    setTimeout(() => {
        container.style.animation = 'fluentPulseAlert 0.4s cubic-bezier(.36,.07,.19,.97) both';
    }, 10);
}

// ============================================================================
// 8. TELEMETRY REPORT COMPILATION EXPORT (PDF ENGINE)
// ============================================================================
function generatePerformanceTelemetryReportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const sName = document.getElementById('studentName').value.toUpperCase();
    const tName = document.getElementById('testName').value.toUpperCase();
    const currentProfile = document.getElementById('examProfile').value.toUpperCase();
    
    const totQ = parseFloat(document.getElementById('totalQs').value);
    const maxM = parseFloat(document.getElementById('maxMarks').value);
    const att = parseFloat(document.getElementById('attempted').value);
    const wrg = parseFloat(document.getElementById('wrong').value);
    const ratio = parseFloat(document.getElementById('markingRatio').value);

    const rgt = att - wrg;
    const una = totQ - att;

    const positiveMarksWeight = maxM / totQ;
    const rawScoreGained = rgt * positiveMarksWeight;
    const penaltyDeduction = wrg * (positiveMarksWeight * ratio);
    const finalNetScore = Math.max(-penaltyDeduction, rawScoreGained - penaltyDeduction);
    const accuracyRate = att > 0 ? (rgt / att) * 100 : 0;

    const telemetryData = {
        totalQuestions: totQ,
        maximumMarks: maxM,
        attempted: att,
        correct: rgt,
        wrong: wrg,
        unattempted: una,
        netScore: finalNetScore,
        totalPenalty: penaltyDeduction,
        accuracy: accuracyRate
    };

    doc.setDrawColor(99, 102, 241); doc.setLineWidth(0.3); doc.rect(8, 8, 194, 281);
    doc.setFillColor(12, 12, 26); doc.rect(10, 10, 190, 32, 'F');
    doc.setDrawColor(6, 182, 212); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 32, 'D');
    
    doc.setFillColor(6, 182, 212); doc.rect(10, 41, 130, 1, 'F');
    doc.setFillColor(99, 102, 241); doc.rect(140, 41, 60, 1, 'F');

    doc.setTextColor(248, 250, 252); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("NEGATIVE MARKING PERFORMANCE REPORT", 16, 21);
    
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(6, 182, 212);
    doc.text(`SYSTEM CORE: METRIC_PROFILE_${currentProfile} // CODE v2.5`, 16, 27);
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
    doc.text("ECLIPSE7 PERFORMANCE MATRIX LABORATORY | FOUNDER: SAIPRASAD BARURE", 16, 35);

    let cardY = 48;
    doc.setFillColor(241, 245, 249); doc.rect(10, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(10, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("METRIC IDENTITY SEGMENT", 14, cardY + 4.5);

    doc.setFillColor(241, 245, 249); doc.rect(108, cardY, 92, 6, 'F');
    doc.rect(108, cardY, 92, 6, 'D');
    doc.text("CURRICULUM PROFILE SPECIFICATION", 112, cardY + 4.5);

    let infoY = cardY + 12;
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("STUDENT NOUN  :", 12, infoY);
    doc.text("TEST TOKEN    :", 12, infoY + 6);
    doc.text("COMPILED DATE :", 12, infoY + 12);

    doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
    doc.text(sName, 40, infoY);
    doc.text(tName, 40, infoY + 6);
    doc.text(new Date().toLocaleString().toUpperCase(), 40, infoY + 12);

    doc.setFont("helvetica", "bold"); doc.setTextColor(51, 65, 85);
    doc.text("PROFILE MODEL :", 110, infoY);
    doc.text("RATIO RULE    :", 110, infoY + 6);
    doc.text("ENGINE CODE   :", 110, infoY + 12);

    doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
    doc.text(currentProfile, 138, infoY);
    doc.text(`1/${Math.round(1/ratio)} (${ratio})`, 138, infoY + 6);
    doc.text("ECLIPSE7_MARKING_v2.5", 138, infoY + 12);

    let tableY = infoY + 18;
    const headerRow = [["EVALUATED METRIC SEGMENT", "VALUE REGISTERED", "PERCENTAGE VALUE / SYSTEM SCALE"]];
    const dataBody = [
        ["TOTAL EVALUATION QUESTIONS BASE", telemetryData.totalQuestions.toString(), "100.00 % TOTAL CAPACITY"],
        ["ABSOLUTE MAXIMUM MARKING WEIGHT", telemetryData.maximumMarks.toString(), `${telemetryData.maximumMarks} POINTS PEAK VALUE`],
        ["REGISTERED ATTEMPTS COUNT", telemetryData.attempted.toString(), `${((telemetryData.attempted/telemetryData.totalQuestions)*100).toFixed(2)} % ENGAGEMENT RATE`],
        ["VALID CORRECT SEGMENTS", telemetryData.correct.toString(), `${((telemetryData.correct/telemetryData.totalQuestions)*100).toFixed(2)} % EFFICIENCY INDEX`],
        ["INCORRECT FRAUDULENT FAULTS", telemetryData.wrong.toString(), `${((telemetryData.wrong/telemetryData.totalQuestions)*100).toFixed(2)} % ERROR DISSIPATION`],
        ["UNATTEMPTED NULL CHANNELS", telemetryData.unattempted.toString(), `${((telemetryData.unattempted/telemetryData.totalQuestions)*100).toFixed(2)} % INERT RESIDUALS`]
    ];

    doc.autoTable({
        startY: tableY, head: headerRow, body: dataBody, theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
        columnStyles: { 0: { cellWidth: 75 }, 1: { cellWidth: 40, halign: 'center' }, 2: { cellWidth: 75 } }
    });

    let secondaryTableY = doc.autoTable.previous.finalY + 6;

    if (document.getElementById('reportType').value === 'subjectwise') {
        const subHeader = [["SUBJECT MODULE", "TOTAL Q", "CORRECT", "WRONG", "UNATTEMPTED", "ACCURACY"]];
        const subBody = [];
        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const labelNode = sub === 'mathBio' ? document.getElementById('mathBioLabel').textContent : sub.toUpperCase();
            const t = document.getElementById(`${sub}A`).value || "0";
            const c = document.getElementById(`${sub}C`).value || "0";
            const w = document.getElementById(`${sub}W`).value || "0";
            const n = document.getElementById(`${sub}N`).value || "0";
            const acc = parseFloat(c) + parseFloat(w) > 0 ? `${((parseFloat(c)/(parseFloat(c)+parseFloat(w)))*100).toFixed(1)}%` : "0.0%";
            subBody.push([labelNode, t, c, w, n, acc]);
        });

        doc.autoTable({
            startY: secondaryTableY, head: subHeader, body: subBody, theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });
        secondaryTableY = doc.autoTable.previous.finalY + 6;
    }

    doc.setFillColor(15, 23, 42); doc.rect(10, secondaryTableY, 190, 24, 'F');
    doc.setDrawColor(6, 182, 212); doc.setLineWidth(0.4); doc.rect(10, secondaryTableY, 190, 24, 'D');

    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
    doc.text(`${telemetryData.netScore.toFixed(2)} / ${telemetryData.maximumMarks.toFixed(2)}`, 16, secondaryTableY + 15);
    
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(6, 182, 212);
    doc.text(">> NET EVALUATION RATIFIED SCORE VALUE", 90, secondaryTableY + 9);
    doc.text(`>> SYSTEM METRIC ACCURACY RATE          : ${telemetryData.accuracy.toFixed(2)} %`, 90, secondaryTableY + 16);

    let tBoxY = secondaryTableY + 30;
    doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240); doc.rect(10, tBoxY, 190, 36, 'DF');
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text("ECLIPSE7 SYSTEM LOGS & RECOMMENDATION ALGORITHM:", 14, tBoxY + 6);

    let systemRecommendationText = "CRITICAL WARNING: ELEVATED PENALTY DETECTED. STABILIZE GUESSWORK PATTERNS IMMEDIATELY.";
    if (telemetryData.accuracy > 85) systemRecommendationText = "PREMIUM PERFORMANCE EFFICIENCY DETECTED. MAINTAIN OPTIMAL MATRIX ACCURACY RATIOS.";
    else if (telemetryData.accuracy >= 65) systemRecommendationText = "STABLE MARGIN. RE-MAP MISCLASSIFIED FAULTS TO PREVENT RESIDUAL GRADE SEEPAGE.";

    doc.text(`>> RECOM_STRATEGY : ${systemRecommendationText}`, 15, tBoxY + 14);
    doc.text(`>> PENALTY_DECAY  : REGISTERED FAULTS SUBTRACTED ${telemetryData.totalPenalty.toFixed(2)} POINTS FROM ABSOLUTE CAPACITY.`, 15, tBoxY + 21);
    doc.text(`>> EFFICIENCY_GAP : ${telemetryData.unattempted} UNATTEMPTED SEGMENTS IDENTIFIED FOR LOW-COST SCORE OPTIMIZATION.`, 15, tBoxY + 28);

    const finalFooterY = 254;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(10, finalFooterY - 4, 200, finalFooterY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("MR. PRASAD REDDY", 14, finalFooterY + 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterY + 9);
    
    doc.setFont("courier", "bold"); doc.setFontSize(7); doc.setTextColor(99, 102, 241);
    doc.text("AUTHENTIC SECURITY VERIFICATION SIGNATURE GENERATED VIA ECLIPSE7 PLATFORM", 14, finalFooterY + 16);

    doc.save(`E7_METRIC_REPORT_${sName.replace(/\s+/g, '_')}.pdf`);
}
