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

    document.getElementById('evaluateMetricsBtn').addEventListener('click', processMetricsComputationPipeline);
    document.getElementById('resetSystemBtn').addEventListener('click', resetEvaluationEngineFrame);
    document.getElementById('exportPdfBtn').addEventListener('click', generateAuditLedgerDocument);
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
    const sectionWrapper = document.getElementById('subjectSection');

    if (profileKey === 'custom') {
        if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
        if (sectionWrapper) sectionWrapper.classList.remove('section-locked');
        return;
    }

    if (totalQsInput) totalQsInput.classList.add('profile-locked-row');
    if (sectionWrapper) sectionWrapper.classList.add('section-locked');

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
    const sectionWrapper = document.getElementById('subjectSection');
    
    if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
    if (sectionWrapper) sectionWrapper.classList.remove('section-locked');

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
    if(aggregateTotal > 0 && totalQsInput) {
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
    const qwertyRoot = document.getElementById('qwertyMatrixRoot');
    const numpadRoot = document.getElementById('numpadMatrixRoot');
    if (!kbContainer || !qwertyRoot || !numpadRoot) return;

    targets.forEach(input => {
        if (isTouchFormFactorDevice) {
            input.setAttribute('inputmode', 'none');
        }

        input.addEventListener('click', (e) => {
            const isLockedPreset = input.closest('#subjectSection') && 
                                   document.getElementById('subjectSection').classList.contains('section-locked');
            if (input.classList.contains('profile-locked-row') || isLockedPreset) {
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
                qwertyRoot.style.display = 'block';
                numpadRoot.style.display = 'none';
            } else {
                qwertyRoot.style.display = 'none';
                numpadRoot.style.display = 'grid';
            }
            
            kbContainer.classList.add('panel-active');
            adjustViewportPaddingForVirtualKeyboardPanel(true);
        });
    });

    const matrixKeys = kbContainer.querySelectorAll('.kb-matrix-key');
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
                const maxLen = currentlyFocusedInputFieldNode.getAttribute('type') === 'number' ? 4 : 50;
                if (baseStringValue.length < maxLen) {
                    currentlyFocusedInputFieldNode.value = baseStringValue + commandKeyValue;
                }
            }

            currentlyFocusedInputFieldNode.dispatchEvent(new Event('input', { bubbles: true }));
            
            if (currentlyFocusedInputFieldNode.classList.contains('sub-input')) {
                processSubjectRowRecalculationSequence(currentlyFocusedInputFieldNode);
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (kbContainer.classList.contains('panel-active') && 
            !kbContainer.contains(e.target) && 
            !e.target.classList.contains('v-keyboard-target')) {
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

function adjustViewportPaddingForVirtualKeyboardPanel(isOpening) {
    if (isOpening) {
        document.body.style.paddingBottom = "360px";
    } else {
        document.body.style.paddingBottom = "24px";
    }
}

// ============================================================================
// 7. FLUENT NOTIFICATION SYSTEM & UI CRITICAL VALIDATION ENGINE
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
    const studentName = document.getElementById('studentName');
    const testName = document.getElementById('testName');
    const totalQs = document.getElementById('totalQs');
    const maxMarks = document.getElementById('maxMarks');
    const attempted = document.getElementById('attempted');
    const wrong = document.getElementById('wrong');

    if (!studentName.value.trim()) invalidNodes.push(studentName);
    if (!testName.value.trim()) invalidNodes.push(testName);
    if (!totalQs.value || parseFloat(totalQs.value) <= 0) invalidNodes.push(totalQs);
    if (!maxMarks.value || parseFloat(maxMarks.value) <= 0) invalidNodes.push(maxMarks);
    if (attempted.value === "" || parseFloat(attempted.value) < 0) invalidNodes.push(attempted);
    if (wrong.value === "" || parseFloat(wrong.value) < 0) invalidNodes.push(wrong);

    const reportType = document.getElementById('reportType').value;
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

    if (invalidNodes.length > 0) {
        invalidNodes.forEach(node => node.classList.add('validation-error'));
        triggerSystemToastNotification("Required Validation Error: Fix highlighted parameters.");
        animateContainerShake();
        return false;
    }

    if (parseFloat(wrong.value) > parseFloat(attempted.value)) {
        invalidNodes.push(wrong); invalidNodes.push(attempted);
        wrong.classList.add('validation-error'); attempted.classList.add('validation-error');
        triggerSystemToastNotification("Logic Error: Incorrect faults cannot exceed total attempts.");
        animateContainerShake();
        return false;
    }

    if (parseFloat(attempted.value) > parseFloat(totalQs.value)) {
        invalidNodes.push(attempted); invalidNodes.push(totalQs);
        attempted.classList.add('validation-error'); totalQs.classList.add('validation-error');
        triggerSystemToastNotification("Logic Error: Total attempts exceed assessment parameters.");
        animateContainerShake();
        return false;
    }

    return true;
}

function animateContainerShake() {
    const container = document.getElementById('mainAppContainer');
    if (!container) return;
    container.style.animation = 'none';
    setTimeout(() => { container.style.animation = 'fluentShakeAlert 0.45s cubic-bezier(.36,.07,.19,.97) both'; }, 10);
}

// ============================================================================
// 8. QUANTUM CORE EVALUATION ENGINE METRICS COMPUTATION PIPELINE
// ============================================================================
let calculatedTelemetryData = null;

function processMetricsComputationPipeline() {
    if (!scanAndValidateSystemInputs()) return;

    dismissVirtualKeyboardPanel();

    const tQ = parseFloat(document.getElementById('totalQs').value);
    const mM = parseFloat(document.getElementById('maxMarks').value);
    const att = parseFloat(document.getElementById('attempted').value);
    const wr = parseFloat(document.getElementById('wrong').value);
    const ratio = parseFloat(document.getElementById('markingRatio').value);

    const cr = att - wr;
    const unatt = tQ - att;
    const marksPerQ = mM / tQ;

    const positiveYield = cr * marksPerQ;
    const totalPenalty = wr * (marksPerQ * ratio);
    const finalScore = positiveYield - totalPenalty;

    const accuracy = att > 0 ? (cr / att) * 100 : 0;
    const efficiency = mM > 0 ? (finalScore / mM) * 100 : 0;

    calculatedTelemetryData = {
        student: document.getElementById('studentName').value.trim().toUpperCase(),
        test: document.getElementById('testName').value.trim().toUpperCase(),
        profile: document.getElementById('examProfileLabel').textContent,
        totalQs: tQ, maxMarks: mM, attempted: att, wrong: wr, correct: cr, unattempted: unatt,
        finalScore: finalScore, accuracy: accuracy, efficiency: efficiency, totalPenalty: totalPenalty
    };

    document.getElementById('computedScore').textContent = finalScore.toFixed(2).replace(/\.00$/, '');
    document.getElementById('outOfMarks').textContent = mM;
    document.getElementById('accuracyRate').textContent = `${accuracy.toFixed(1)}%`;
    document.getElementById('penaltyImpact').textContent = `-${totalPenalty.toFixed(2).replace(/\.00$/, '')}`;
    document.getElementById('correctCount').textContent = cr;
    document.getElementById('unattemptedCount').textContent = unatt;

    const percentCapsule = document.getElementById('scorePercentCapsule');
    percentCapsule.textContent = `${efficiency.toFixed(1)}% Efficiency`;
    
    if (efficiency >= 75) {
        percentCapsule.style.background = 'rgba(16, 185, 129, 0.15)';
        percentCapsule.style.color = '#34d399';
    } else if (efficiency >= 40) {
        percentCapsule.style.background = 'rgba(245, 158, 11, 0.15)';
        percentCapsule.style.color = '#fbbf24';
    } else {
        percentCapsule.style.background = 'rgba(239, 68, 68, 0.15)';
        percentCapsule.style.color = '#f87171';
    }

    const outputPanel = document.getElementById('telemetryOutputPanel');
    outputPanel.classList.add('panel-visible');

    triggerSystemToastNotification("Computation finalized successfully. Analytics Matrix synchronized.", false);

    setTimeout(() => {
        outputPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

function resetEvaluationEngineFrame() {
    document.getElementById('evaluationForm').reset();
    clearImplicitTransientResiduals();
    clearInputValidationStyles();
    dismissVirtualKeyboardPanel();

    document.getElementById('examProfile').value = 'custom';
    document.getElementById('examProfileLabel').textContent = 'SELECT EXAM PROFILE';
    document.getElementById('ratioLabel').textContent = 'Ratio: 1/4';
    document.getElementById('markingRatio').value = '0.25';
    document.getElementById('reportType').value = 'overall';
    document.getElementById('selectedLabel').textContent = 'OVERALL MODE';

    const totalQsInput = document.getElementById('totalQs');
    if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
    const sectionWrapper = document.getElementById('subjectSection');
    if (sectionWrapper) sectionWrapper.classList.remove('section-locked');

    document.getElementById('intelMessage').textContent = EXAM_PROFILES.custom.intel;

    toggleSubjectSectionDisplay();

    document.getElementById('telemetryOutputPanel').classList.remove('panel-visible');
    calculatedTelemetryData = null;

    triggerSystemToastNotification("System core framework reset to defaults.", false);
}

// ============================================================================
// 9. RE-ENGINEERED HIGH-FIDELITY PDF REPORT GENERATOR LEDGER
// ============================================================================
function generateAuditLedgerDocument() {
    if (!calculatedTelemetryData) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Background Canvas
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, 210, 297, "F");

    // Header Branding Frame
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 38, "F");
    
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text("ECLIPSE7 PERFORMANCE ANALYTICS", 14, 16);
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(56, 189, 248);
    doc.text(">> ENGINE SYSTEM DISPATCH: METRICS AUDIT REPORT CORE_GEN_V2.5", 14, 22);

    // Decorative Header Accent Block
    doc.setFillColor(124, 58, 237); doc.rect(0, 35, 210, 3, "F");

    // Metadata Container Block
    let metaY = 48;
    doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.4);
    doc.rect(12, metaY, 186, 30, "FD");

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("STUDENT IDENTITY AUTHENTICATION", 16, metaY + 7);
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(calculatedTelemetryData.student, 16, metaY + 13);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("ASSESSMENT TOKEN SPECIFICATION", 16, metaY + 22);
    doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(calculatedTelemetryData.test, 16, metaY + 27);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("CURRICULUM SCHEME", 125, metaY + 7);
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(calculatedTelemetryData.profile, 125, metaY + 13);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("TEMPORAL STAMP LOG", 125, metaY + 22);
    doc.setTextColor(30, 41, 59); doc.setFont("courier", "bold"); doc.setFontSize(9);
    doc.text(new Date().toLocaleString(), 125, metaY + 27);

    // Telemetry Structural Table Array Mapping
    const rows = [
        ["Total Assessment Capacity Pool", `${calculatedTelemetryData.totalQs} Rows/Questions`, `Absolute Score Limit Cap`, `${calculatedTelemetryData.maxMarks} Points`],
        ["Registered Attempts Count", `${calculatedTelemetryData.attempted} Units`, `Absolute Accurate Matches`, `${calculatedTelemetryData.correct} Units`],
        ["Incorrect Fault Disruptions", `${calculatedTelemetryData.wrong} Units`, `Unattempted Void Margins`, `${calculatedTelemetryData.unattempted} Units`],
        ["Computed Performance Efficiency", `${calculatedTelemetryData.efficiency.toFixed(1)}%`, `Accuracy Frequency Factor`, `${calculatedTelemetryData.accuracy.toFixed(1)}%`]
    ];

    doc.autoTable({
        startY: metaY + 36, head: [["METRIC VARIABLE", "QUANTUM VALUES", "CORE PARAMETER", "SCORE VALUES"]], body: rows,
        theme: "plain", headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
        bodyStyles: { font: "helvetica", fontSize: 9, textColor: [51, 65, 85], cellPadding: 4 },
        columnStyles: { 0: { fontStyle: "bold", textColor: [15, 23, 42] }, 2: { fontStyle: "bold", textColor: [15, 23, 42] } },
        styles: { lineSplitting: "wrap" }, drawBorder: true,
        didDrawPage: function(data) {
            doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4);
            doc.rect(data.settings.margin.left, data.cursor.startY, 182, data.cursor.y - data.cursor.startY);
        }
    });

    let currentPdfY = doc.previousAutoTable.finalY + 8;

    // Subjective Breakdowns Conditional Matrix Section Block
    const reportType = document.getElementById('reportType').value;
    if (reportType === 'subjectwise') {
        const subRows = [];
        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const rowLabel = sub === 'mathBio' ? document.getElementById('mathBioLabel').textContent : sub.toUpperCase();
            const t = document.getElementById(`${sub}A`).value || '0';
            const c = document.getElementById(`${sub}C`).value || '0';
            const w = document.getElementById(`${sub}W`).value || '0';
            const n = document.getElementById(`${sub}N`).value || '0';
            subRows.push([rowLabel, t, c, w, n]);
        });

        doc.autoTable({
            startY: currentPdfY, head: [["SUBJECT COMPARTMENT Matrix", "TOTAL Q.", "CORRECT", "WRONG", "NOT ATTEMPTED"]], body: subRows,
            theme: "striped", headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
            bodyStyles: { fontSize: 8.5, cellPadding: 3.5 },
            columnStyles: { 0: { fontStyle: "bold", textColor: [15, 23, 42] } }
        });
        currentPdfY = doc.previousAutoTable.finalY + 8;
    }

    // Performance Summary Highlight Callout Dashboard Section
    doc.setFillColor(241, 245, 249); doc.setDrawColor(226, 232, 240); doc.rect(12, currentPdfY, 186, 22, "FD");
    
    doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("CRITICAL EVALUATION SCORE LEDGER RESULT", 16, currentPdfY + 6);
    
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
    doc.text(`${calculatedTelemetryData.finalScore.toFixed(2).replace(/\.00$/, '')} NET MARKS`, 16, currentPdfY + 15);
    
    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    doc.text(`Identified penalty deduction drains substracted ${calculatedTelemetryData.totalPenalty.toFixed(2)} total points from capability.`, 74, currentPdfY + 14);

    // AI Algorithmic Telemetry Advisory Section Box
    let tBoxY = currentPdfY + 28;
    doc.setFillColor(15, 23, 42); doc.rect(12, tBoxY, 186, 36, "F");
    doc.setFillColor(2, 132, 199); doc.rect(12, tBoxY, 2, 36, "F");

    doc.setTextColor(14, 165, 233); doc.setFont("courier", "bold"); doc.setFontSize(8.5);
    doc.text(">> CORE STRATEGIC INTELLIGENCE INTERPRETER LOG", 18, tBoxY + 7);
    
    doc.setTextColor(241, 245, 249); doc.setFont("helvetica", "normal"); doc.setFontSize(8);

    let systemRecommendationText = "PERFORMANCE OPTIMAL. RETAIN METHODOLOGY SCHEDULING PLANS.";
    if (calculatedTelemetryData.accuracy < 70) systemRecommendationText = "CRITICAL PENALTY DANGER: ACCURACY CRITICAL GAP DETECTED. HALT GUESSWORK PATTERNS IMMEDIATELY TO REMOVE PENALTY DRAINS.";
    else if (calculatedTelemetryData.unattempted > calculatedTelemetryData.totalQs * 0.3) systemRecommendationText = "ATTEMPT GAP IDENTIFIED: AGGRESSIVE ATTACK METRICS STRATEGY NEEDED ON BUFFER TOPICS TO OVERCOME OUTPUT CAPACITY BLOCKS.";

    doc.text(`>> RECOM_STRATEGY : ${systemRecommendationText}`, 18, tBoxY + 14);
    doc.text(`>> PENALTY_DECAY  : THE REGISTERED PENALTY INFLICTED SUBTRACTS ${calculatedTelemetryData.totalPenalty.toFixed(2)} POINTS FROM ABSOLUTE CAPACITY.`, 18, tBoxY + 21);
    doc.text(`>> EFFICIENCY_GAP : ${calculatedTelemetryData.unattempted} UNATTEMPTED SEGMENTS IDENTIFIED FOR LOW-COST SCORE OPTIMIZATION.`, 18, tBoxY + 28);

    // Footer Attribution Seal Line Frame Block
    const finalFooterY = 274;
    doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.4); doc.line(12, finalFooterY - 4, 198, finalFooterY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("MR. PRASAD REDDY", 14, finalFooterY + 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterY + 9);
    
    doc.setFont("courier", "bold"); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
    doc.text("https://eclipse7.odoo.com/", 198, finalFooterY + 5, { align: "right" });

    doc.save(`E7_LEDGER_${calculatedTelemetryData.student}_${calculatedTelemetryData.test}.pdf`);
}

// ============================================================================
// ECLIPSE7 PLATFORM LINKER - TRANSMIT SCORING DATA TO BACKEND LOGS
// ============================================================================
async function transmitTelemetryToServer(telemetryData) {
    try {
        const payload = {
            studentName: document.getElementById('studentName').value,
            testName: document.getElementById('testName').value,
            examProfile: document.getElementById('examProfile').value,
            totalQs: document.getElementById('totalQs').value,
            maxMarks: document.getElementById('maxMarks').value,
            attempted: document.getElementById('attempted').value,
            wrong: document.getElementById('wrong').value,
            scoreMetrics: {
                finalScore: telemetryData.netScore,
                accuracyPercentage: telemetryData.accuracy,
                totalPenalty: telemetryData.totalPenalty,
                unattemptedCount: telemetryData.unattempted
            }
        };

        const response = await fetch('/api/telemetry/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if(data.success) {
            console.log(">> SYSTEM TELEMETRY INDEX SECURED SUCCESSFULLY. ID: " + data.recordId);
        }
    } catch (error) {
        console.warn(">> Server backend unreachable. Evaluation running in stand-alone localized state.");
    }
}
