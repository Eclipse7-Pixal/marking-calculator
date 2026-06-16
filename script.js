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
        dismissVirtualKeyboardPanel();
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
    const maxMarksInput = document.getElementById('maxMarks');
    const subInputsTotal = [document.getElementById('phyA'), document.getElementById('chemA'), document.getElementById('mathBioA')];

    if (profileKey === 'custom') {
        if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
        if (maxMarksInput) maxMarksInput.classList.remove('profile-locked-row');
        subInputsTotal.forEach(inp => { if(inp) inp.classList.remove('profile-locked-row'); });
        return;
    }

    // Apply UI lock pattern to elements across presets instead of standard HTML readonly attribute
    if (totalQsInput) totalQsInput.classList.add('profile-locked-row');
    if (maxMarksInput) maxMarksInput.classList.add('profile-locked-row');
    subInputsTotal.forEach(inp => { if(inp) inp.classList.add('profile-locked-row'); });

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
    const subInputsTotal = [document.getElementById('phyA'), document.getElementById('chemA'), document.getElementById('mathBioA')];
    
    if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
    if (maxMarksInput) maxMarksInput.classList.remove('profile-locked-row');
    subInputsTotal.forEach(inp => { if(inp) inp.classList.remove('profile-locked-row'); });

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
            // Processing allocation pipelines smoothly
        }
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
                if(id !== 'studentName' && id !== 'testName' && id !== 'totalQs' && id !== 'maxMarks') {
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
    if(aggregateTotal > 0 && totalQsInput && !totalQsInput.classList.contains('profile-locked-row')) {
        totalQsInput.value = aggregateTotal;
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
            // Guard against choosing elements locked by current preset profile selection state
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
            
            const layoutType = input.getAttribute('data-kb-type') || 'numpad';
            const displayLabel = document.getElementById('keyboardCurrentTargetMetadata');
            if(displayLabel) {
                displayLabel.textContent = `TARGET: ${input.placeholder || 'NUMERICAL DATA MODULE'}`;
            }

            if (layoutType === 'qwerty') {
                document.getElementById('numpadMatrixRoot').style.display = 'none';
                document.getElementById('qwertyMatrixRoot').style.display = 'flex';
            } else {
                document.getElementById('qwertyMatrixRoot').style.display = 'none';
                document.getElementById('numpadMatrixRoot').style.display = 'grid';
            }

            kbContainer.classList.add('panel-active');
            adjustViewportPaddingForVirtualKeyboardPanel(true);
        });
    });

    const matrixKeys = kbContainer.querySelectorAll('.kb-matrix-key, .kb-character-key');
    matrixKeys.forEach(btn => {
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
                const maxLen = currentlyFocusedInputFieldNode.getAttribute('data-kb-type') === 'qwerty' ? 32 : 4;
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
    if (!isTouchFormFactorDevice) return;
    if (isActiveState) {
        const panelHeight = document.getElementById('glassmorphicKeyboardPanel').offsetHeight || 280;
        document.body.style.paddingBottom = `${panelHeight + 20}px`;
    } else {
        document.body.style.paddingBottom = '24px';
    }
}

function clearInputValidationStyles() {
    const targets = document.querySelectorAll('.v-keyboard-target');
    targets.forEach(node => node.classList.remove('validation-error'));
}

// ============================================================================
// 7. HIGH-PRECISION SCORE ENGINE MATHEMATICAL CALCULATIONS
// ============================================================================
function runTelemetryEvaluationPipeline() {
    clearInputValidationStyles();
    if (!validateFormStructuralIntegrity()) return;

    const profileKey = document.getElementById('examProfile').value;
    const studentIdent = document.getElementById('studentName').value;
    const tokenIdent = document.getElementById('testName').value;
    const totQs = parseFloat(document.getElementById('totalQs').value);
    const maxMks = parseFloat(document.getElementById('maxMarks').value);
    const attQs = parseFloat(document.getElementById('attempted').value);
    const wrgQs = parseFloat(document.getElementById('wrong').value);
    const penRatio = parseFloat(document.getElementById('markingRatio').value);

    const corQs = attQs - wrgQs;
    const unattQs = totQs - attQs;
    
    const valuePerQuestion = maxMks / totQs;
    const penaltyPerQuestion = valuePerQuestion * penRatio;

    const absoluteScore = (corQs * valuePerQuestion) - (wrgQs * penaltyPerQuestion);
    const totalPenaltyIncurred = wrgQs * (valuePerQuestion + penaltyPerQuestion);
    const accuracyPercent = attQs > 0 ? (corQs / attQs) * 100 : 0;

    const analyticsDataDump = {
        profile: profileKey,
        student: studentIdent,
        test: tokenIdent,
        totalQuestions: totQs,
        maximumMarks: maxMks,
        attempts: attQs,
        correct: corQs,
        incorrect: wrgQs,
        unattempted: unattQs,
        score: absoluteScore,
        totalPenalty: totalPenaltyIncurred,
        accuracy: accuracyPercent
    };

    triggerTelemetryReportGeneration(analyticsDataDump);
}

function validateFormStructuralIntegrity() {
    const reportType = document.getElementById('reportType').value;
    const studentName = document.getElementById('studentName');
    const testName = document.getElementById('testName');
    const totalQs = document.getElementById('totalQs');
    const maxMarks = document.getElementById('maxMarks');
    const attempted = document.getElementById('attempted');
    const wrong = document.getElementById('wrong');

    let invalidNodes = [];

    if (!studentName.value.trim()) invalidNodes.push(studentName);
    if (!testName.value.trim()) invalidNodes.push(testName);
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
            invalidNodes.push(wrong); invalidNodes.push(attempted);
            triggerSystemToastNotification("Logic Error: Incorrect faults cannot exceed total attempts.");
            animateContainerShake(); return false;
        }
        if (parseFloat(attempted.value) > parseFloat(totalQs.value)) {
            invalidNodes.push(attempted); invalidNodes.push(totalQs);
            triggerSystemToastNotification("Logic Error: Total attempts cannot exceed total questions.");
            animateContainerShake(); return false;
        }
    }

    if (invalidNodes.length > 0) {
        invalidNodes.forEach(node => node.classList.add('validation-error'));
        triggerSystemToastNotification("Action Blocked: Please populate required fields with valid numerical data.");
        animateContainerShake(); return false;
    }
    return true;
}

function triggerSystemToastNotification(msg) {
    const toast = document.getElementById('systemNotification');
    const label = document.getElementById('notificationMessage');
    if (!toast || !label) return;

    label.textContent = msg;
    toast.classList.add('toast-active');

    setTimeout(() => { toast.classList.remove('toast-active'); }, 4000);
}

function animateContainerShake() {
    const container = document.getElementById('mainAppContainer');
    if (!container) return;
    container.style.animation = 'none';
    setTimeout(() => { container.style.animation = 'fluentContainerShakeAlert 0.4s cubic-bezier(.36,.07,.19,.97) both'; }, 10);
}

// ============================================================================
// 8. AUTONOMOUS SEAMLESS PDF TRANSCRIPT COMPILATION PIPELINE
// ============================================================================
function triggerTelemetryReportGeneration(telemetryData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const currentProfile = telemetryData.profile.toUpperCase();

    doc.setDrawColor(148, 163, 184); doc.setLineWidth(0.3); doc.rect(8, 8, 194, 281);
    doc.setFillColor(248, 250, 252); doc.rect(10, 10, 190, 32, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 32, 'D');

    doc.setFillColor(14, 165, 233); doc.rect(10, 41, 130, 1, 'F');
    doc.setFillColor(168, 85, 247); doc.rect(140, 41, 60, 1, 'F');

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("NEGATIVE MARKING PERFORMANCE REPORT", 16, 21);
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(14, 165, 233);
    doc.text(`SYSTEM CORE: METRIC_PROFILE_${currentProfile} // CODE v5.5`, 16, 27);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text("ECLIPSE7 PERFORMANCE MATRIX LABORATORY | FOUNDER: SAIPRASAD BARURE", 16, 35);

    let cardY = 48;
    doc.setFillColor(241, 245, 249); doc.rect(10, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(10, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" METRIC PROFILE SUMMARY LABELS", 12, cardY + 4.5);

    doc.setFillColor(241, 245, 249); doc.rect(108, cardY, 92, 6, 'F');
    doc.rect(108, cardY, 92, 6, 'D');
    doc.text(" ASSESSMENT METADATA TRACK", 110, cardY + 4.5);

    let infoBoxY = cardY + 6;
    doc.rect(10, infoBoxY, 92, 26);
    doc.rect(108, infoBoxY, 92, 26);

    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold"); doc.text("STUDENT IDENTITY :", 14, infoBoxY + 7);
    doc.setFont("helvetica", "normal"); doc.text(telemetryData.student.toUpperCase(), 47, infoBoxY + 7);
    doc.setFont("helvetica", "bold"); doc.text("EVALUATION DATE :", 14, infoBoxY + 14);
    doc.setFont("helvetica", "normal"); doc.text(new Date().toLocaleString(), 47, infoBoxY + 14);
    doc.setFont("helvetica", "bold"); doc.text("CURRICULUM BASE :", 14, infoBoxY + 21);
    doc.setFont("helvetica", "normal"); doc.text(currentProfile, 47, infoBoxY + 21);

    doc.setFont("helvetica", "bold"); doc.text("ASSESSMENT TOKEN :", 112, infoBoxY + 7);
    doc.setFont("helvetica", "normal"); doc.text(telemetryData.test.toUpperCase(), 148, infoBoxY + 7);
    doc.setFont("helvetica", "bold"); doc.text("TOTAL QUESTIONS  :", 112, infoBoxY + 14);
    doc.setFont("helvetica", "normal"); doc.text(`${telemetryData.totalQuestions} UNITS`, 148, infoBoxY + 14);
    doc.setFont("helvetica", "bold"); doc.text("MAX ASSIGNED MKS :", 112, infoBoxY + 21);
    doc.setFont("helvetica", "normal"); doc.text(`${telemetryData.maximumMarks} POINTS`, 148, infoBoxY + 14 + 7);

    let tableY = infoBoxY + 32;
    doc.autoTable({
        startY: tableY,
        margin: { left: 10, right: 10 },
        head: [['PERFORMANCE EVALUATION METRIC SEGMENT', 'QUANTITATIVE COMPUTATION VALUE']],
        body: [
            ['TOTAL EVALUATION ATTEMPTS RECORDED', `${telemetryData.attempts} / ${telemetryData.totalQuestions}`],
            ['SUCCESSFUL CORRECT VALIDATIONS (+)', `${telemetryData.correct} SEGMENTS`],
            ['INCORRECT NEGATIVE FAULTS INFLICTED (-)', `${telemetryData.incorrect} SEGMENTS`],
            ['UNATTEMPTED TRANSIENT VACANCIES (0)', `${telemetryData.unattempted} UNITS`],
            ['NET ACCURACY RATIO FACTOR', `${telemetryData.accuracy.toFixed(2)} %`],
            ['TOTAL PENALTY SCORE CAPACITY DRAIN', `${telemetryData.totalPenalty.toFixed(2)} MARK POINTS`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
        bodyStyles: { fontSize: 8.5, font: 'helvetica', textColor: [30, 41, 59] },
        columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 60, halign: 'center', fontStyle: 'bold' } }
    });

    let scoreHeroY = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(15, 23, 42); doc.rect(10, scoreHeroY, 190, 24, 'F');
    doc.setDrawColor(14, 165, 233); doc.setLineWidth(1); doc.line(10, scoreHeroY, 10, scoreHeroY + 24);

    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("ABSOLUTE CAPACITY SCORE QUANTIFIED", 16, scoreHeroY + 9);
    
    doc.setFontSize(20); doc.setTextColor(14, 165, 233);
    doc.text(`${telemetryData.score.toFixed(2)}`, 16, scoreHeroY + 19);
    doc.setFontSize(10); doc.setTextColor(148, 163, 184);
    doc.text(`/ ${telemetryData.maximumMarks}.00 NET MARK MATRIX POINTS`, 60, scoreHeroY + 18);

    let tBoxY = scoreHeroY + 30;
    doc.setFillColor(248, 250, 252); doc.rect(10, tBoxY, 190, 35, 'F');
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.rect(10, tBoxY, 190, 35, 'D');

    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(30, 41, 59);
    doc.text(">> ANALYTICAL TELEMETRY RECOMMENDATIONS:", 14, tBoxY + 6);

    let systemRecommendationText = "";
    if (telemetryData.accuracy >= 90) systemRecommendationText = "CRITICAL ACCURACY STABLE. MAINTAIN PACE RATIO CONSTRAINTS.";
    else if (telemetryData.accuracy >= 75) systemRecommendationText = "ACCURACY OPTIMAL. TARGET ELIMINATION OF IMPLICIT FAULTS.";
    else systemRecommendationText = "CRITICAL PENALTY INFLICTED. MINIMIZE GUESSWORK PATTERNS IMMEDIATELY TO REMOVE PENALTY DRAINS.";

    doc.text(`>> RECOM_STRATEGY : ${systemRecommendationText}`, 15, tBoxY + 14);
    doc.text(`>> PENALTY_DECAY  : THE REGISTERED PENALTY INFLICTED SUBTRACTS ${telemetryData.totalPenalty.toFixed(2)} POINTS FROM ABSOLUTE CAPACITY.`, 15, tBoxY + 21);
    doc.text(`>> EFFICIENCY_GAP : ${telemetryData.unattempted} UNATTEMPTED SEGMENTS IDENTIFIED FOR LOW-COST SCORE OPTIMIZATION.`, 15, tBoxY + 28);

    const finalFooterY = 254;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(10, finalFooterY - 4, 200, finalFooterY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("MR. PRASAD BARURE", 14, finalFooterY + 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterY + 9);
    doc.setFont("courier", "bold"); doc.setFontSize(7); doc.setTextColor(14, 165, 233);
    doc.text("// TRANSACTION VERIFIED BY TELEMETRY ENGINE CORE SYSTEM GATEWAY", 14, finalFooterY + 15);

    doc.save(`E7_METRIC_REPORT_${telemetryData.student.replace(/\s+/g, '_')}.pdf`);
}
