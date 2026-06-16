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
        intel: "Curriculum: NEET UG matrix structured. Double weight mapped directly to Biology (90 Q)."
    }
};

// Global Performance State Tracker
let activeInputContextField = null;

// ============================================================================
// 2. DOM INITIALIZATION AND ENGINE EVENT BINDINGS
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    setupExamProfileLayout();
    initializeVirtualKeyboardLinkage();
    registerRealtimeInputValidationListeners();

    // Attach Action Control Executions
    document.getElementById("examProfileSelect").addEventListener("change", setupExamProfileLayout);
    document.getElementById("resetEngineFieldsButton").addEventListener("change", performSystemRebootClear);
    document.getElementById("resetEngineFieldsButton").addEventListener("click", performSystemRebootClear);
    document.getElementById("generatePdfButton").addEventListener("click", compileTelemetryReportPDF);
});

// ============================================================================
// 3. CURRICULUM PROFILE GENERATION & DATA LOCKING
// ============================================================================
function setupExamProfileLayout() {
    const chosenProfileKey = document.getElementById("examProfileSelect").value;
    const profile = EXAM_PROFILES[chosenProfileKey];

    if (!profile) return;

    // Update Text Configurations UI
    document.getElementById("intelMetricsText").innerText = profile.intel;
    document.getElementById("mathBioSubjectLabel").innerText = profile.labelMathBio;
    document.getElementById("maxMarksLabel").innerText = profile.maxMarks;
    document.getElementById("totalQuestionsLabel").innerText = profile.totalQs;

    // Update Subject Sections & Hard Lock the Total Question Counts
    for (const [subjKey, targetTotalVal] of Object.entries(profile.subjects)) {
        const rowScope = document.querySelector(`.subject-grid-row[data-subject="${subjKey}"]`);
        if (rowScope) {
            const totalField = rowScope.querySelector(".total-q-field");
            totalField.value = targetTotalVal;
            totalField.setAttribute("readonly", "true"); // Strict lockdown enforcement
        }
    }

    recalculateEngineTelemetryMetrics();
}

// ============================================================================
// 4. REALTIME METRICS COMPUTATION AND ARITHMETIC CORE
// ============================================================================
function registerRealtimeInputValidationListeners() {
    const structuralTargets = document.querySelectorAll(".input-targetable");
    
    structuralTargets.forEach(inputElement => {
        ["input", "change", "blur"].forEach(evtName => {
            inputElement.addEventListener(evtName, (e) => {
                let parsedVal = parseInt(e.target.value) || 0;
                if (parsedVal < 0) parsedVal = 0;
                e.target.value = parsedVal === 0 ? "" : parsedVal;
                
                validateAndClampRowConstraints(e.target);
                recalculateEngineTelemetryMetrics();
            });
        });
    });
}

function validateAndClampRowConstraints(activeInputNode) {
    const rowScope = activeInputNode.closest(".subject-grid-row");
    if (!rowScope) return;

    const totalCapacity = parseInt(rowScope.querySelector(".total-q-field").value) || 0;
    const correctInput = rowScope.querySelector(".correct-q-field");
    const wrongInput = rowScope.querySelector(".wrong-q-field");

    let currentCorrect = parseInt(correctInput.value) || 0;
    let currentWrong = parseInt(wrongInput.value) || 0;

    // Boundary Constraint Rule Check
    if (currentCorrect > totalCapacity) {
        currentCorrect = totalCapacity;
        correctInput.value = currentCorrect;
    }
    if (currentCorrect + currentWrong > totalCapacity) {
        currentWrong = totalCapacity - currentCorrect;
        wrongInput.value = currentWrong === 0 ? "" : currentWrong;
    }
}

function recalculateEngineTelemetryMetrics() {
    let globalGrossCorrect = 0;
    let globalGrossWrong = 0;
    let globalTotalQsInLayout = 0;

    const rowScopes = document.querySelectorAll(".subject-grid-row");
    rowScopes.forEach(row => {
        const totalLayoutQ = parseInt(row.querySelector(".total-q-field").value) || 0;
        const correctCount = parseInt(row.querySelector(".correct-q-field").value) || 0;
        const wrongCount = parseInt(row.querySelector(".wrong-q-field").value) || 0;

        const leftCount = totalLayoutQ - (correctCount + wrongCount);
        row.querySelector(".unattempted-q-field").value = leftCount;

        globalGrossCorrect += correctCount;
        globalGrossWrong += wrongCount;
        globalTotalQsInLayout += totalLayoutQ;
    });

    // Score Calculations Engine
    const positiveMarksYield = globalGrossCorrect * 4;
    const penaltyMarksDrain = globalGrossWrong * 1;
    const totalNetScoreComputed = positiveMarksYield - penaltyMarksDrain;

    // Accuracy Calculation Core
    const totalAttempted = globalGrossCorrect + globalGrossWrong;
    let accuracyRatioPercentage = 0;
    if (totalAttempted > 0) {
        accuracyRatioPercentage = (globalGrossCorrect / totalAttempted) * 100;
    }

    // Reflect Metrics Inside UI Display Panels
    document.getElementById("netScoreDisplay").innerText = totalNetScoreComputed;
    document.getElementById("accuracyDisplay").innerText = accuracyRatioPercentage.toFixed(2) + "%";
    document.getElementById("grossPositiveLabel").innerText = `+${positiveMarksYield}`;
    document.getElementById("penaltyDrainLabel").innerText = `-${penaltyMarksDrain}`;
    document.getElementById("accuracyProgressFill").style.width = `${accuracyRatioPercentage}%`;
}

// ============================================================================
// 5. UPGRADED & LOCKED MOBILE-OPTIMIZED VIRTUAL KEYBOARD ENGINE
// ============================================================================
function initializeVirtualKeyboardLinkage() {
    const targetInputs = document.querySelectorAll(".input-targetable");
    const dockContainer = document.getElementById("virtualKeyboardPanelDock");
    const matrixRoot = document.getElementById("numpadMatrixRoot");
    const dismissBtn = document.getElementById("hideVirtualKeyboardTrigger");
    const contextText = document.getElementById("keyboardContextDescriptor");

    // Nest the layout elements properly inside our glass dock drawer chassis
    if (dockContainer && matrixRoot && !dockContainer.contains(matrixRoot)) {
        dockContainer.appendChild(matrixRoot);
    }

    // Intercept Selection Foci
    targetInputs.forEach(input => {
        input.addEventListener("focus", (e) => {
            e.preventDefault();
            activeInputContextField = e.target;
            
            // Format descriptive meta contextual headings inside the header block
            const rowContext = activeInputContextField.closest(".subject-grid-row").getAttribute("data-subject").toUpperCase();
            const inputTypeLabel = activeInputContextField.getAttribute("data-type").toUpperCase();
            contextText.innerText = `${rowContext} RUNTIME :: DATA FIELD -> ${inputTypeLabel}`;

            // Smooth viewport layout spacer padding alignment updates
            dockContainer.classList.add("active");
            document.body.style.paddingBottom = `${dockContainer.offsetHeight + 20}px`;
            
            // Bring target cleanly into layout viewport viewing zone frames
            setTimeout(() => {
                activeInputContextField.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 180);
        });

        // Block native on-screen mobile visual boards from masking up overlays
        input.addEventListener("mousedown", (e) => {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                input.focus();
            }
        });
    });

    // Handle Matrix Key Typing Sequences natively with robust filtering switches
    matrixRoot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const buttonTarget = e.target.closest(".kb-matrix-key");
        if (!buttonTarget || !activeInputContextField) return;

        const commandKey = buttonTarget.getAttribute("data-key");
        let initialStringValue = activeInputContextField.value.toString();

        if (commandKey === "clear") {
            activeInputContextField.value = "";
        } else if (commandKey === "backspace") {
            if (initialStringValue.length > 0) {
                activeInputContextField.value = initialStringValue.slice(0, -1);
            }
        } else {
            // Append value strings seamlessly
            activeInputContextField.value = initialStringValue + commandKey;
        }

        // Fire input lifecycle change mutations explicitly to maintain metrics accuracy
        activeInputContextField.dispatchEvent(new Event("input", { bubbles: true }));
        validateAndClampRowConstraints(activeInputContextField);
        recalculateEngineTelemetryMetrics();
    });

    // Dismiss Actions Closure Wire-up
    if (dismissBtn) {
        dismissBtn.addEventListener("click", (e) => {
            e.preventDefault();
            dockContainer.classList.remove("active");
            document.body.style.paddingBottom = "40px";
            if (activeInputContextField) {
                activeInputContextField.blur();
                activeInputContextField = null;
            }
        });
    }

    // Close on clicking outside container borders safely 
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 1024 && 
            !e.target.closest(".soft-glass-container") && 
            !e.target.closest("#virtualKeyboardPanelDock")) {
            dockContainer.classList.remove("active");
            document.body.style.paddingBottom = "40px";
            if (activeInputContextField) activeInputContextField.blur();
        }
    });
}

// ============================================================================
// 6. SYSTEM REBOOT COLD PURGE UTILITY
// ============================================================================
function performSystemRebootClear() {
    const inputFields = document.querySelectorAll(".input-targetable");
    inputFields.forEach(cell => {
        cell.value = "";
    });
    
    const dockContainer = document.getElementById("virtualKeyboardPanelDock");
    if(dockContainer) {
        dockContainer.classList.remove("active");
        document.body.style.paddingBottom = "40px";
    }
    
    setupExamProfileLayout();
}

// ============================================================================
// 7. HIGH-FIDELITY AUTOMATED PDF COMPILATION REPORT ENGINE
// ============================================================================
function compileTelemetryReportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const candidateProfileName = document.getElementById("candidateNameInput").value.toUpperCase() || "UNREGISTERED PROFILE ACCESS";
    const selectedProfileKey = document.getElementById("examProfileSelect").value;
    const currentProfileData = EXAM_PROFILES[selectedProfileKey];

    // Collect telemetry variables
    const calculatedScore = document.getElementById("netScoreDisplay").innerText;
    const accuracyPercent = document.getElementById("accuracyDisplay").innerText;
    const maxCapacityScale = document.getElementById("maxMarksLabel").innerText;
    const grossPositivePoints = document.getElementById("grossPositiveLabel").innerText;
    const penaltyDrainPoints = document.getElementById("penaltyDrainLabel").innerText;

    // Secondary processing for sub-table extraction loops
    const telemetryData = {
        phy: { total: 0, correct: 0, wrong: 0, unattempted: 0 },
        chem: { total: 0, correct: 0, wrong: 0, unattempted: 0 },
        mathBio: { total: 0, correct: 0, wrong: 0, unattempted: 0 }
    };

    let totalAttemptedCount = 0;
    for (const contextKey of Object.keys(telemetryData)) {
        const scopeRow = document.querySelector(`.subject-grid-row[data-subject="${contextKey}"]`);
        if (scopeRow) {
            telemetryData[contextKey].total = parseInt(scopeRow.querySelector(".total-q-field").value) || 0;
            telemetryData[contextKey].correct = parseInt(scopeRow.querySelector(".correct-q-field").value) || 0;
            telemetryData[contextKey].wrong = parseInt(scopeRow.querySelector(".wrong-q-field").value) || 0;
            telemetryData[contextKey].unattempted = parseInt(scopeRow.querySelector(".unattempted-q-field").value) || 0;
            totalAttemptedCount += (telemetryData[contextKey].correct + telemetryData[contextKey].wrong);
        }
    }

    // Draw Vector Theme Container Borders
    doc.setDrawColor(124, 58, 237); doc.setLineWidth(1); doc.rect(10, 10, 190, 277);
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.2); doc.rect(11, 11, 188, 275);

    // Header Branding Configuration
    doc.setFillColor(15, 23, 42); doc.rect(12, 12, 186, 24, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
    doc.text("ECLIPSE7 PERFORMANCE MATRIX ANALYTICS ENGINE", 16, 22);
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(139, 92, 246);
    doc.text("CORE PROTOCOL REPORT GENERATED SECURELY", 16, 28);

    // Meta Block
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(`CANDIDATE STAMP : ${candidateProfileName}`, 15, 46);
    doc.text(`TARGET PROFILE  : ${currentProfileData.label}`, 15, 52);
    doc.text(`SYSTEM TIMELINE : ${new Date().toLocaleString().toUpperCase()}`, 15, 58);

    doc.setDrawColor(203, 213, 225); doc.line(15, 63, 195, 63);

    // Primary Summary KPI Grid Blocks
    doc.setFillColor(248, 250, 252); doc.rect(15, 68, 85, 32, "F"); doc.setDrawColor(226, 232, 240); doc.rect(15, 68, 85, 32);
    doc.setFillColor(248, 250, 252); doc.rect(110, 68, 85, 32, "F"); doc.rect(110, 68, 85, 32);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("NET COMPUTED SYSTEM SCORE", 20, 75);
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text(`${calculatedScore} / ${maxCapacityScale}`, 20, 88);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("CURRICULUM ACCURACY RATIO", 115, 75);
    doc.setTextColor(52, 211, 153); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text(accuracyPercent, 115, 88);

    // Secondary Telemetry Matrix Grid Data Block
    doc.setFillColor(250, 250, 250); doc.rect(15, 106, 180, 22, "F"); doc.rect(15, 106, 180, 22);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
    
    doc.text(`Gross Positive Capacity Yield : ${grossPositivePoints} Points`, 20, 113);
    doc.text(`Negative Penalty Mark Drains : ${penaltyDrainPoints} Points`, 20, 121);
    doc.text(`Total Segment Layout Scale    : ${currentProfileData.totalQs} Base Questions`, 112, 113);
    doc.text(`Total Active Matrix Attempts : ${totalAttemptedCount} Registered`, 112, 121);

    // Render Data Breakdown Grid via AutoTable plugin architecture
    const tableSourceBodyData = [
        ["PHYSICS CORE SEGMENT", telemetryData.phy.total, telemetryData.phy.correct, telemetryData.phy.wrong, telemetryData.phy.unattempted],
        ["CHEMISTRY CORE SEGMENT", telemetryData.chem.total, telemetryData.chem.correct, telemetryData.chem.wrong, telemetryData.chem.unattempted],
        [`${currentProfileData.labelMathBio} SEGMENT`, telemetryData.mathBio.total, telemetryData.mathBio.correct, telemetryData.mathBio.wrong, telemetryData.mathBio.unattempted]
    ];

    doc.autoTable({
        startY: 136,
        margin: { left: 15, right: 15 },
        head: [["CURRICULUM METRIC SPECIFICATION", "TOTAL Q", "CORRECT (+4)", "WRONG (-1)", "UNATTEMPTED"]],
        body: tableSourceBodyData,
        theme: "striped",
        headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
        bodyStyles: { font: "helvetica", fontSize: 9, textColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" } }
    });

    // Strategy Optimization Recommendation Blocks
    let finalAutoTableY = doc.lastAutoTable.finalY || 170;
    const tBoxY = finalAutoTableY + 12;
    
    doc.setFillColor(15, 23, 42); doc.rect(15, tBoxY, 180, 36, "F");
    doc.setTextColor(56, 189, 248); doc.setFont("courier", "bold"); doc.setFontSize(8.5);
    doc.text(">> ALGORITHMIC ENGINE INTELLIGENT SYSTEM RECOMMENDATION", 18, tBoxY + 6);

    doc.setTextColor(241, 245, 249); doc.setFont("courier", "normal"); doc.setFontSize(7.5);
    
    let parsedAccuracy = parseFloat(accuracyPercent) || 0;
    let strategyAdviceText = parsedAccuracy >= 80 
        ? "CRITICAL EFFICIENCY MET METRICS PROFILE. KEEP ATTACK VELOCITY STABLE." 
        : "MITIGATE RASH GUESSWORK PATTERNS IMMEDIATELY TO REMOVE PENALTY DRAINS.";

    doc.text(`>> RECOM_STRATEGY : ${strategyAdviceText}`, 18, tBoxY + 14);
    doc.text(`>> PENALTY_DECAY  : REGISTERED DRAINS SUBTRACTED ${penaltyDrainPoints} MARKS FROM CAPACITY ABSOLUTE.`, 18, tBoxY + 22);
    
    let totalUnattempted = telemetryData.phy.unattempted + telemetryData.chem.unattempted + telemetryData.mathBio.unattempted;
    doc.text(`>> EFFICIENCY_GAP : ${totalUnattempted} UNATTEMPTED SECTORS IDENTIFIED IN ACTIVE SELECTION PROFILE.`, 18, tBoxY + 30);

    // Footer Block Signing Verification Section
    const footerY = 265;
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.4); doc.line(15, footerY - 4, 195, footerY - 4);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("MR. PRASAD BARURE", 15, footerY + 3);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder of ECLIPSE7", 15, footerY + 8);
    
    doc.setFont("courier", "bold"); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
    doc.text("VERIFICATION EMBED CODE SHA-256 SYSTEM ACTIVE", 125, footerY + 5);

    // Save File Download Execute
    doc.save(`ECLIPSE7-METRICS-REPORT-${candidateProfileName.replace(/\s+/g, "-")}.pdf`);
}
