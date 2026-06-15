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
        intel: "Curriculum: NEET UG framework optimized. [Phy: 45, Chem: 45, Bio: 90]. Matrix +4 / -1."
    }
};

let currentActiveProfileKey = "jeemain";
let currentFocusedActiveInput = null;

// ============================================================================
// 2. DOM ELEMENT REGISTRY ARCHITECTURE
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    initializeCoreEngineLayers();
    setupReactiveInputSynchronization();
    initializeVirtualGlassKeyboardSubsystem();
});

function initializeCoreEngineLayers() {
    const examSelectTrigger = document.getElementById("examProfileSelector");
    if (examSelectTrigger) {
        examSelectTrigger.addEventListener("change", (e) => {
            switchPerformanceMatrixProfile(e.target.value);
        });
    }
    switchPerformanceMatrixProfile(currentActiveProfileKey);
}

// ============================================================================
// 3. REACTIVE PROFILE SWITCHER ENGINE
// ============================================================================
function switchPerformanceMatrixProfile(profileKey) {
    if (!EXAM_PROFILES[profileKey]) return;
    currentActiveProfileKey = profileKey;
    const profileData = EXAM_PROFILES[profileKey];

    // Modify DOM Headers & Informational Fields
    document.getElementById("intelMessage").innerText = profileData.intel;
    document.getElementById("mathBioLabel").innerText = profileData.labelMathBio;
    document.getElementById("mathBioWLabel").innerText = profileData.labelMathBio;

    // Reset Input Parameters across the grid layout to prevent legacy traces
    const allNumericInputs = document.querySelectorAll('.sub-input, #totalCorrect, #totalWrong');
    allNumericInputs.forEach(input => {
        input.value = "";
        input.classList.remove("input-error-flash");
    });

    document.getElementById("score").innerText = "0.00";
    console.log(`[CORE] Switched profile topology to: ${profileData.label}`);
}

// ============================================================================
// 4. CROSS-INPUT SYNCHRONIZATION & ALGEBRAIC SOLVER LAYER
// ============================================================================
function setupReactiveInputSynchronization() {
    const subjectPrefixes = ["phy", "chem", "mathBio"];
    
    subjectPrefixes.forEach(prefix => {
        const correctInput = document.getElementById(`${prefix}C`);
        const wrongInput = document.getElementById(`${prefix}W`);

        if (correctInput && wrongInput) {
            correctInput.addEventListener("input", () => evaluateSubjectSegmentAlgebra(prefix, "C"));
            wrongInput.addEventListener("input", () => evaluateSubjectSegmentAlgebra(prefix, "W"));
        }
    });

    const globalCorrect = document.getElementById("totalCorrect");
    const globalWrong = document.getElementById("totalWrong");

    if (globalCorrect && globalWrong) {
        globalCorrect.addEventListener("input", () => distributeGlobalToSubjectTracks("C"));
        globalWrong.addEventListener("input", () => distributeGlobalToSubjectTracks("W"));
    }
}

function evaluateSubjectSegmentAlgebra(subjectPrefix, targetType) {
    const profile = EXAM_PROFILES[currentActiveProfileKey];
    const maxSubjectLimit = profile.subjects[subjectPrefix];

    let cVal = parseInt(document.getElementById(`${subjectPrefix}C`).value) || 0;
    let wVal = parseInt(document.getElementById(`${subjectPrefix}W`).value) || 0;

    // Boundary Enforcement Constraints
    if (cVal < 0) { cVal = 0; document.getElementById(`${subjectPrefix}C`).value = 0; }
    if (wVal < 0) { wVal = 0; document.getElementById(`${subjectPrefix}W`).value = 0; }

    if (cVal + wVal > maxSubjectLimit) {
        triggerValidationWarningEffects(document.getElementById(`${subjectPrefix}${targetType}`));
        if (targetType === "C") {
            cVal = maxSubjectLimit - wVal;
            document.getElementById(`${subjectPrefix}C`).value = cVal > 0 ? cVal : 0;
        } else {
            wVal = maxSubjectLimit - cVal;
            document.getElementById(`${subjectPrefix}W`).value = wVal > 0 ? wVal : 0;
        }
    }

    consolidateSubjectTracksToGlobalHub();
}

function consolidateSubjectTracksToGlobalHub() {
    const prefixes = ["phy", "chem", "mathBio"];
    let totalC = 0;
    let totalW = 0;
    let explicitActiveTracks = false;

    prefixes.forEach(prefix => {
        const c = document.getElementById(`${prefix}C`).value;
        const w = document.getElementById(`${prefix}W`).value;
        if (c !== "" || w !== "") explicitActiveTracks = true;
        totalC += parseInt(c) || 0;
        totalW += parseInt(w) || 0;
    });

    if (explicitActiveTracks) {
        document.getElementById("totalCorrect").value = totalC;
        document.getElementById("totalWrong").value = totalW;
    }
}

function distributeGlobalToSubjectTracks(targetType) {
    const profile = EXAM_PROFILES[currentActiveProfileKey];
    let globalVal = parseInt(document.getElementById(`total${targetType === "C" ? "Correct" : "Wrong"}`).value) || 0;

    if (globalVal < 0) {
        globalVal = 0;
        document.getElementById(`total${targetType === "C" ? "Correct" : "Wrong"}`).value = 0;
    }

    if (globalVal > profile.totalQs) {
        triggerValidationWarningEffects(document.getElementById(`total${targetType === "C" ? "Correct" : "Wrong"}`));
        globalVal = profile.totalQs;
        document.getElementById(`total${targetType === "C" ? "Correct" : "Wrong"}`).value = globalVal;
    }

    // Clear individual segments to prioritize clean linear distribution mapping
    const prefixes = ["phy", "chem", "mathBio"];
    prefixes.forEach(p => {
        document.getElementById(`${p}${targetType}`).value = "";
    });

    let remainingAllocation = globalVal;
    for (let i = 0; i < prefixes.length; i++) {
        const maxSectionLimit = profile.subjects[prefixes[i]];
        if (remainingAllocation <= maxSectionLimit) {
            document.getElementById(`${prefixes[i]}${targetType}`).value = remainingAllocation > 0 ? remainingAllocation : "";
            break;
        } else {
            document.getElementById(`${prefixes[i]}${targetType}`).value = maxSectionLimit;
            remainingAllocation -= maxSectionLimit;
        }
    }
}

function triggerValidationWarningEffects(element) {
    if (!element) return;
    element.classList.add("input-error-flash");
    setTimeout(() => element.classList.remove("input-error-flash"), 500);
}

// ============================================================================
// 5. VIRTUAL GLASSMORPHIC KEYBOARD PANEL SUBSYSTEM
// ============================================================================
function initializeVirtualGlassKeyboardSubsystem() {
    const kbContainer = document.getElementById("glassmorphicKeyboardPanel");
    const numericInputs = document.querySelectorAll('input[type="number"]');
    
    if (!kbContainer) return;

    numericInputs.forEach(input => {
        // Intercept native visual keyboard presentation loops on touch platforms
        input.setAttribute("inputmode", "none");
        
        input.addEventListener("focus", (e) => {
            currentFocusedActiveInput = e.target;
            displayVirtualGlassKeyboard(kbContainer);
            highlightActiveInputNode(e.target);
        });

        input.addEventListener("blur", () => {
            setTimeout(() => {
                if (document.activeElement?.tagName !== "INPUT" && !kbContainer.contains(document.activeElement)) {
                    dismissVirtualGlassKeyboard(kbContainer);
                }
            }, 150);
        });
    });

    // Wire up keys
    const keys = kbContainer.querySelectorAll(".kb-matrix-key");
    keys.forEach(key => {
        key.addEventListener("pointerdown", (e) => {
            e.preventDefault(); // Prevent focus disruption transitions
            const commandValue = key.getAttribute("data-key");
            processKeyboardMatrixSignal(commandValue);
        });
    });

    initializeKeyboardDragPositioningMechanics(kbContainer);
}

function displayVirtualGlassKeyboard(kb) {
    kb.classList.add("visible-active");
    document.body.style.paddingBottom = `${kb.offsetHeight + 20}px`;
}

function dismissVirtualGlassKeyboard(kb) {
    kb.classList.remove("visible-active");
    document.body.style.paddingBottom = "0px";
    if (currentFocusedActiveInput) {
        currentFocusedActiveInput.classList.remove("focused-quantum-node");
    }
}

function highlightActiveInputNode(target) {
    document.querySelectorAll('input[type="number"]').forEach(i => i.classList.remove("focused-quantum-node"));
    target.classList.add("focused-quantum-node");
}

function processKeyboardMatrixSignal(signal) {
    if (!currentFocusedActiveInput) return;

    let systemValueString = currentFocusedActiveInput.value.toString();

    if (signal === "clear") {
        systemValueString = "";
    } else if (signal === "backspace") {
        systemValueString = systemValueString.slice(0, -1);
    } else {
        // Enforce max string length limit constraints
        if (systemValueString.length >= 3) return;
        systemValueString += signal;
    }

    currentFocusedActiveInput.value = systemValueString;
    
    // Bubble artificial input telemetry events to keep calculations accurate
    const syntheticEvent = new Event("input", { bubbles: true });
    currentFocusedActiveInput.dispatchEvent(syntheticEvent);
}

function initializeKeyboardDragPositioningMechanics(kb) {
    const dragNotch = kb.querySelector(".keyboard-drag-notch-handle");
    if (!dragNotch) return;

    let isDragging = false;
    let initialTouchY = 0;
    let currentTransformY = 0;

    dragNotch.addEventListener("pointerdown", (e) => {
        isDragging = true;
        initialTouchY = e.clientY;
        kb.style.transition = "none";
        dragNotch.setPointerCapture(e.pointerId);
    });

    dragNotch.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - initialTouchY;
        if (deltaY > 0) {
            currentTransformY = deltaY;
            kb.style.transform = `translateY(${deltaY}px)`;
        }
    });

    dragNotch.addEventListener("pointerup", (e) => {
        if (!isDragging) return;
        isDragging = false;
        dragNotch.releasePointerCapture(e.pointerId);
        kb.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";

        // If dragged down past 35% thresholds, completely dismiss panel
        if (currentTransformY > kb.offsetHeight * 0.35) {
            dismissVirtualGlassKeyboard(kb);
            kb.blur();
        }
        kb.style.transform = "translateY(0px)";
        currentTransformY = 0;
    });
}

function triggerManualKeyboardDismissal() {
    const kb = document.getElementById("glassmorphicKeyboardPanel");
    if (kb) dismissVirtualGlassKeyboard(kb);
}

// ============================================================================
// 6. METRIC COMPUTATION ENGINE
// ============================================================================
function compileInputDataTelemetry() {
    const profile = EXAM_PROFILES[currentActiveProfileKey];
    
    const data = {
        phyC: parseInt(document.getElementById("phyC").value) || 0,
        phyW: parseInt(document.getElementById("phyW").value) || 0,
        chemC: parseInt(document.getElementById("chemC").value) || 0,
        chemW: parseInt(document.getElementById("chemW").value) || 0,
        mathBioC: parseInt(document.getElementById("mathBioC").value) || 0,
        mathBioW: parseInt(document.getElementById("mathBioW").value) || 0,
        globalC: parseInt(document.getElementById("totalCorrect").value) || 0,
        globalW: parseInt(document.getElementById("totalWrong").value) || 0,
    };

    // Calculate specific cross tracks
    const derivedC = data.phyC + data.chemC + data.mathBioC;
    const derivedW = data.phyW + data.chemW + data.mathBioW;

    const absoluteC = Math.max(data.globalC, derivedC);
    const absoluteW = Math.max(data.globalW, derivedW);

    const totalAttempted = absoluteC + absoluteW;
    const unattempted = Math.max(0, profile.totalQs - totalAttempted);

    const positiveScore = absoluteC * 4;
    const totalPenalty = absoluteW * parseFloat(profile.ratio) * 4; // Ratio scale adjustment
    const finalCalculatedMetricScore = positiveScore - totalPenalty;

    return {
        profile,
        phyC: data.phyC, phyW: data.phyW,
        chemC: data.chemC, chemW: data.chemW,
        mathBioC: data.mathBioC, mathBioW: data.mathBioW,
        totalCorrect: absoluteC,
        totalWrong: absoluteW,
        attempted: totalAttempted,
        unattempted,
        positiveMarks: positiveScore,
        totalPenalty,
        finalScore: finalCalculatedMetricScore
    };
}

function executeCalculationSequence() {
    const telemetry = compileInputDataTelemetry();
    
    // Boundary Enforcement Counterchecks
    if (telemetry.attempted > telemetry.profile.totalQs) {
        alert(`Error: System verification failure. Total questions parsed (${telemetry.attempted}) exceeds profile constraints (${telemetry.profile.totalQs}).`);
        return;
    }

    const scoreDisplay = document.getElementById("score");
    if (scoreDisplay) {
        animateScoreCounterDisplay(scoreDisplay, parseFloat(scoreDisplay.innerText) || 0, telemetry.finalScore, 1000);
    }
}

function animateScoreCounterDisplay(targetElement, startVal, endVal, runtimeDuration) {
    let startTimestamp = null;
    
    function step(currentTimestamp) {
        if (!startTimestamp) startTimestamp = currentTimestamp;
        const progressProgress = Math.min((currentTimestamp - startTimestamp) / runtimeDuration, 1);
        // EaseOut cubic pacing equation
        const easeStep = 1 - Math.pow(1 - progressProgress, 3);
        const currentNumericalVal = startVal + easeStep * (endVal - startVal);
        
        targetElement.innerText = currentNumericalVal.toFixed(2);
        if (progressProgress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// ============================================================================
// 7. MULTI-PAGE EXPORT ENGINE (jsPDF + jsPDF-AutoTable)
// ============================================================================
function downloadPDFReportSequence() {
    const telemetryData = compileInputDataTelemetry();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    // Core System Brand Theming Configuration Parameters
    const PALETTE = {
        primary: [15, 23, 42],      // deep slate text core
        secondary: [124, 58, 237],  // ambient high-tech purple
        accent: [2, 132, 199],      // slate tracking cyan accent
        emerald: [5, 150, 105],    // positive yield tracking green
        rose: [225, 29, 72],        // penalty track crimson red
        bgLight: [248, 250, 252],   // frosted premium structural layer
        border: [226, 232, 240]     // divider grid lines
    };

    // ---------------------------------------------------------
    // PAGE ONE: DOCUMENT HEADER & BRAND ARCHITECTURE
    // ---------------------------------------------------------
    
    // Architectural Tech Grid Accents
    doc.setFillColor(...PALETTE.primary);
    doc.rect(0, 0, 210, 16, "F"); 
    
    doc.setFillColor(...PALETTE.secondary);
    doc.rect(0, 16, 210, 1.5, "F");

    // Top Header Brand System Labels
    doc.setTextColor(255, 255, 255);
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.text("ECLIPSE7 AUTOMATED ASSESSMENT LOG ENGINE [v2.0.4]", 12, 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("SECURITY CLASSIFICATION: CONFIDENTIAL PROTOCOL", 148, 10);

    // Document Title Presentation Hierarchy
    doc.setTextColor(...PALETTE.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("INTELLIGENCE AUDIT REPORT", 12, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SYSTEM LOG RECORD ID:", 12, 38);
    doc.setFont("courier", "bold");
    doc.setTextColor(...PALETTE.secondary);
    doc.text(`E7-METRIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${new Date().getFullYear()}`, 53, 38);

    // Meta Configuration Details Grid Layout Blocks
    doc.setDrawColor(...PALETTE.border);
    doc.setLineWidth(0.4);
    doc.setFillColor(...PALETTE.bgLight);
    doc.rect(10, 43, 190, 22, "FD");

    doc.setTextColor(...PALETTE.primary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("ORGANIZATION ENGINE:", 14, 49);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text("ECLIPSE7 COGNITIVE LABS", 52, 49);

    doc.setFont("helvetica", "bold"); doc.text("COMPILATION TIMESTAMP:", 14, 54);
    doc.setFont("helvetica", "normal"); doc.text(new Date().toLocaleString(), 54, 54);

    doc.setFont("helvetica", "bold"); doc.text("ALGORITHMIC PROFILE:", 14, 59);
    doc.setFont("courier", "bold"); doc.setTextColor(...PALETTE.accent);
    doc.text(telemetryData.profile.label, 52, 59);

    // Right-Aligned High-Yield Metadata Blocks
    doc.setTextColor(...PALETTE.primary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text("HARDWARE TARGET:", 124, 49);
    doc.setFont("helvetica", "normal"); doc.text("BROWSER COMPILER EDGE", 154, 49);
    doc.setFont("helvetica", "bold"); doc.text("DATA PRIVACY BOUNDS:", 124, 54);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...PALETTE.emerald); doc.text("100% LOCAL ZERO-KNOWLEDGE", 158, 54);

    // ---------------------------------------------------------
    // PRIMARY SCORE METRIC HERO CALLOUT GRAPHIC
    // ---------------------------------------------------------
    doc.setFillColor(...PALETTE.primary);
    doc.rect(10, 71, 190, 36, "F");
    
    // Side Border Accents
    doc.setFillColor(...PALETTE.accent);
    doc.rect(10, 71, 2.5, 36, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("AGGREGATED PERFORMANCE MARK COEFFICIENT", 18, 79);

    // Score Render Logic
    doc.setFont("helvetica", "bold"); doc.setFontSize(38);
    const renderedScoreString = telemetryData.finalScore.toFixed(2);
    doc.text(renderedScoreString, 18, 97);

    // Fractional Math Limits Indicators
    const fractionLimitString = `/ ${telemetryData.profile.maxMarks}.00`;
    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.setTextColor(148, 163, 184); // Muted layout gray
    doc.text(fractionLimitString, 18 + doc.getStringWidth(renderedScoreString) + 3, 97);

    // Percentage Accuracy Telemetry Pill Box
    const conceptualAccuracyPercent = telemetryData.totalCorrect > 0 
        ? ((telemetryData.totalCorrect / telemetryData.attempted) * 100).toFixed(1) 
        : "0.0";
    
    doc.setFillColor(30, 41, 59); // Tech dark contrast fill
    doc.rect(136, 78, 56, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
    doc.text("ACCURACY CAPACITY", 141, 84);
    doc.setFont("courier", "bold"); doc.setFontSize(13);
    doc.setTextColor(...PALETTE.accent);
    doc.text(`${conceptualAccuracyPercent}%`, 141, 93);

    // ---------------------------------------------------------
    // DATA MATRIX TABLE: CORE BREAKDOWN DATA STRUCTURE
    // ---------------------------------------------------------
    doc.setTextColor(...PALETTE.primary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("I. SEGMENTED PROFILE ANALYTICS MATRIX", 12, 116);

    // Map rows cleanly based on active profile configurations
    const mathBioRowLabelText = telemetryData.profile.labelMathBio;
    
    const auditTableDataset = [
        ["PHYSICS CORE TRACK", telemetryData.phyC, telemetryData.phyW, (telemetryData.phyC + telemetryData.phyW), (telemetryData.profile.subjects.phy - (telemetryData.phyC + telemetryData.phyW)), `${((telemetryData.phyC * 4) - (telemetryData.phyW * parseFloat(telemetryData.profile.ratio) * 4)).toFixed(1)}`],
        ["CHEMISTRY CORE TRACK", telemetryData.chemC, telemetryData.chemW, (telemetryData.chemC + telemetryData.chemW), (telemetryData.profile.subjects.chem - (telemetryData.chemC + telemetryData.chemW)), `${((telemetryData.chemC * 4) - (telemetryData.chemW * parseFloat(telemetryData.profile.ratio) * 4)).toFixed(1)}`],
        [`${mathBioRowLabelText} CONFIG TRACK`, telemetryData.mathBioC, telemetryData.mathBioW, (telemetryData.mathBioC + telemetryData.mathBioW), (telemetryData.profile.subjects.mathBio - (telemetryData.mathBioC + telemetryData.mathBioW)), `${((telemetryData.mathBioC * 4) - (telemetryData.mathBioW * parseFloat(telemetryData.profile.ratio) * 4)).toFixed(1)}`],
        ["COMBINED AGGREGATE CORE", telemetryData.totalCorrect, telemetryData.totalWrong, telemetryData.attempted, telemetryData.unattempted, telemetryData.finalScore.toFixed(2)]
    ];

    doc.autoTable({
        startY: 121,
        head: [["QUANTUM EVALUATION TRACK", "CORRECT (C)", "WRONG (W)", "ATTEMPTED (A)", "UNATTEMPTED (N)", "TRACK YIELD"]],
        body: auditTableDataset,
        theme: "plain",
        headStyles: {
            fillColor: PALETTE.primary,
            textColor: [255, 255, 255],
            font: "helvetica",
            fontStyle: "bold",
            fontSize: 7.5,
            halign: "center"
        },
        bodyStyles: {
            font: "helvetica",
            fontSize: 8,
            textColor: [30, 41, 59],
            lineWidth: 0.2,
            borderColor: PALETTE.border,
            halign: "center"
        },
        columnStyles: {
            0: { halign: "left", fontStyle: "bold", cellWidth: 50 }
        },
        didParseCell: function(data) {
            // Style summary terminal block row cleanly
            if (data.row.index === 3) {
                data.cell.styles.fillColor = [241, 245, 249];
                data.cell.styles.fontStyle = "bold";
                if(data.column.index === 5) {
                    data.cell.styles.textColor = telemetryData.finalScore >= 0 ? PALETTE.emerald : PALETTE.rose;
                }
            }
        }
    });

    // ---------------------------------------------------------
    // ADVANCED DIAGNOSTIC METRIC LOGS ARCHITECTURE
    // ---------------------------------------------------------
    let currentLayoutY = doc.autoTable.previous.finalY + 12;
    doc.setTextColor(...PALETTE.primary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("II. SYSTEM METRIC TRACKING DIAGNOSTICS", 12, currentLayoutY);

    const diagnosticBoxY = currentLayoutY + 4;
    doc.setFillColor(...PALETTE.bgLight);
    doc.setDrawColor(...PALETTE.border);
    doc.rect(10, diagnosticBoxY, 190, 40, "FD");

    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(71, 85, 105);
    
    // Mathematical Yield Ratios Telemetry Computations
    const calculatedGrossYield = ((telemetryData.positiveMarks / telemetryData.profile.maxMarks) * 100).toFixed(1);
    const calculatedNetLoss = ((telemetryData.totalPenalty / telemetryData.profile.maxMarks) * 100).toFixed(1);

    doc.text(`>> ABSOLUTE_CAPACITY_YIELD  : ${telemetryData.positiveMarks}.00 MARKS GROSS VALUE SECURED [~${calculatedGrossYield}% OF ABSOLUTE TOTAL]`, 15, diagnosticBoxY + 7);
    doc.text(`>> PENALTY_DECAY_DRAIN       : -${telemetryData.totalPenalty}.00 MARKS EXTRACTED VIA WRONG VECTOR STREAKS [~${calculatedNetLoss}% DISSIPATION]`, 15, diagnosticBoxY + 14);
    doc.text(`>> EFFICIENCY_GAP_RATIO      : ${telemetryData.unattempted} NODES UNATTEMPTED [POTENTIAL REACH CAPACITY: +${telemetryData.unattempted * 4} MARKS UPGRADE WINDOW]`, 15, diagnosticBoxY + 21);
    
    // Algorithmic Strategy Evaluation Vectors
    let strategyEvaluationMetricText = "";
    if (parseFloat(conceptualAccuracyPercent) >= 85) {
        strategyEvaluationMetricText = "CRITICAL PRECISION ACCELERATION. ENGINE DETECTS OPTIMAL ACCURACY MATRIX PATTERNS.";
    } else if (parseFloat(conceptualAccuracyPercent) >= 65) {
        strategyEvaluationMetricText = "STABLE MARGIN BALANCED MATRIX. REDUCE CRITICAL WRONG SECTORS TO STABILIZE CURVE.";
    } else {
        strategyEvaluationMetricText = "HIGH PENALTY DECAY DETECTION. RESTRICTION OF SPECULATIVE SECTOR TRACKS ADVISEMENT LEVEL 1.";
    }
    doc.text(`>> COGNITIVE_STRATEGY_LOG    : ${strategyEvaluationMetricText}`, 15, diagnosticBoxY + 28);
    
    // Operational Security Hash Block Footer Trace
    const cryptographicVerificationTokenHex = "E7_CORE_SYS_HASH_" + Math.random().toString(16).substr(2, 16).toUpperCase();
    doc.setTextColor(148, 163, 184); doc.setFontSize(7);
    doc.text(`[ENGINE_DIAG_SIG: ${cryptographicVerificationTokenHex}]`, 15, diagnosticBoxY + 36);

    // ---------------------------------------------------------
    // PAGE TWO: SYSTEM META OVERVIEW & STRATEGIC ADVISEMENT
    // ---------------------------------------------------------
    doc.addPage();
    
    // Top Page Decoration Line Rails
    doc.setFillColor(...PALETTE.primary); doc.rect(0, 0, 210, 3, "F");
    doc.setFillColor(...PALETTE.accent); doc.rect(0, 3, 210, 1, "F");

    doc.setTextColor(...PALETTE.primary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("III. ALGORITHMIC PERFORMANCE PROFILE ADVANCED MATRIX", 12, 16);

    // Structured Analytical Data Rows for Profile Matrix Map
    const matrixProfileDiagnosticDataset = [
        ["TOTAL MATRIX QUESTIONS EVALUATED", `${telemetryData.profile.totalQs} Questions`, "CORE PARAMETER LIMIT CONSTRAINT"],
        ["ABSOLUTE MAXIMUM POINT THRESHOLD", `${telemetryData.profile.maxMarks} Points`, "MAX MARKS CAPACITY REACH"],
        ["PENALTY COEFFICIENT FRACTION", `${telemetryData.profile.ratio} VAL RATIO`, "NEGATIVE SCALE MULTIPLIER MATRIX"],
        ["EVALUATION MATRIX SCORE SCHEME", "+4.00 FOR CORRECT / -1.00 FOR WRONG", "ALGORITHMIC DISCRIMINATOR SCHEDULER"],
        ["TOTAL EVALUATED ANSWER TRACKS", `${telemetryData.attempted} Inputs Processed`, "TELEMETRY DENSITY METRIC VALUE"],
        ["UNATTEMPTED GAP COEFFICIENT", `${telemetryData.unattempted} Remaining Questions`, "NON-OPERATIONAL CAPACITY MARGIN"]
    ];

    doc.autoTable({
        startY: 22,
        head: [["SYSTEM METRIC PROFILE SCHEDULER NODES", "COMPRESSED MATRIX VALUE", "OPERATIONAL TRANSLATION INTEL"]],
        body: matrixProfileDiagnosticDataset,
        theme: "plain",
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], font: "helvetica", fontStyle: "bold", fontSize: 8, halign: "left" },
        bodyStyles: { font: "helvetica", fontSize: 8, textColor: [15, 23, 42], lineWidth: 0.1, borderColor: PALETTE.border, halign: "left" },
        columnStyles: { 
            0: { fontStyle: "bold", cellWidth: 65 },
            1: { fontStyle: "normal", cellWidth: 55 }
        }
    });

    // ---------------------------------------------------------
    // DEEP EVALUATION PARADIGM LOGS
    // ---------------------------------------------------------
    let secondPageLayoutY = doc.autoTable.previous.finalY + 12;
    doc.setTextColor(...PALETTE.primary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("IV. COGNITIVE STRATEGIC FORECAST OPTIMIZATION LABS", 12, secondPageLayoutY);

    const forecastBlockY = secondPageLayoutY + 4;
    doc.setFillColor(...PALETTE.bgLight);
    doc.setDrawColor(...PALETTE.border);
    doc.rect(10, forecastBlockY, 190, 48, "FD");

    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...PALETTE.secondary);
    doc.text("ALGORITHMIC STRATEGY RE-ENGINEERING SIMULATION MATRIX:", 14, forecastBlockY + 6);
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...PALETTE.primary);
    
    // Strategic Advice Generation Logic Loop Blocks
    const correctScaleTargetSimulationValue = Math.ceil(telemetryData.totalWrong * 0.4);
    doc.text(`1. ELIMINATION CHANNELS: Eliminating just ~40% of wrong selection metrics (${correctScaleTargetSimulationValue} questions) moves target to +${(correctScaleTargetSimulationValue * (4 + parseFloat(telemetryData.profile.ratio) * 4)).toFixed(1)} marks.`, 14, forecastBlockY + 14);
    
    const unattemptedTargetConversionSimulationValue = Math.ceil(telemetryData.unattempted * 0.3);
    doc.text(`2. CONVERSION RATIOS: Converting 30% of unattempted segments into stable zones boosts metrics by +${(unattemptedTargetConversionSimulationValue * 4).toFixed(1)} points.`, 14, forecastBlockY + 21);
    
    doc.text(`3. BALANCED SPEED SECTORS: Current track output velocity averages ~${(telemetryData.attempted > 0 ? (180 / telemetryData.attempted).toFixed(1) : "0.0")} mins allocation capacity per item node.`, 14, forecastBlockY + 28);
    
    doc.setFont("helvetica", "oblique"); doc.setTextColor(71, 85, 105);
    doc.text("Strategic Insight: Focus deep study sprints onto target sectors showing a systemic accuracy drop.", 14, forecastBlockY + 36);

    // ---------------------------------------------------------
    // CRITICAL ENGINE DISCLOSURE SUB-TEXT
    // ---------------------------------------------------------
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(148, 163, 184);
    doc.text("LEGAL DISCLAIMER AND SECURITY POLICY PRIVACY CLAUSE: This metric breakdown report is built strictly on local execution protocols.", 12, forecastBlockY + 44);

    // ---------------------------------------------------------
    // FOOTER SIGN-OFF BLOCKS (BOTTOM OF PAGE TWO)
    // ---------------------------------------------------------
    const finalFooterSignOffLayoutY = 254;
    doc.setDrawColor(203, 213, 225); 
    doc.setLineWidth(0.4); 
    doc.line(10, finalFooterSignOffLayoutY - 4, 200, finalFooterSignOffLayoutY - 4);

    // Identity Branding Signatures
    doc.setTextColor(15, 23, 42); 
    doc.setFont("helvetica", "bold"); 
    doc.setFontSize(11);
    doc.text("MR. PRASAD REDDY", 14, finalFooterSignOffLayoutY + 4);
    
    doc.setFont("helvetica", "normal"); 
    doc.setFontSize(7.5); 
    doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 14, finalFooterSignOffLayoutY + 9);
    
    doc.setFont("courier", "bold"); 
    doc.setFontSize(7); 
    doc.setTextColor(...PALETTE.emerald);
    doc.text("STATUS: INTEGRITY MATRIX SECURE // CONFIDENTIAL PASS", 14, finalFooterSignOffLayoutY + 14);

    // Right Edge Engine Page System Traces
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
    doc.text("PAGE 02 OF 02", 176, finalFooterSignOffLayoutY + 4);
    doc.text("SYSTEM CORE ENGINE v2.0", 164, finalFooterSignOffLayoutY + 9);

    // ---------------------------------------------------------
    // TRIGGER DOCUMENT COMPILE DOWNLOAD STREAM
    // ---------------------------------------------------------
    const computedReportOutputFileName = `E7_MARKING_REPORT_${currentActiveProfileKey.toUpperCase()}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(computedReportOutputFileName);
    console.log(`[CORE EXPORT] PDF Generation sequence successfully committed to disk as: ${computedReportOutputFileName}`);
}
