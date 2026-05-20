// 1. UNIVERSAL DROPDOWN ENGINE WITH SYNC & PREFIX PRESERVATION
function initDropdown(containerId, triggerId, panelId, hiddenInputId, callback) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const panel = document.getElementById(panelId);
    const hidden = document.getElementById(hiddenInputId);
    if (!container || !trigger || !panel) return;

    const options = panel.querySelectorAll('.option-item');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Sweep close competing operational interfaces
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
            
            // Retain original styling context label layout if it demands structure
            if (containerId === 'ratioSelectContainer') {
                trigger.textContent = `Ratio: ${item.textContent.split(' ')[0]}`;
            } else {
                trigger.textContent = item.textContent;
            }

            panel.classList.remove('show');
            container.classList.remove('active');
            if (callback) callback();
        });
    });

    window.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            panel.classList.remove('show');
            container.classList.remove('active');
        }
    });
}

// 2. COMPLETE DOM READY BINDING MATRIX
document.addEventListener('DOMContentLoaded', () => {
    initDropdown('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectInputs);
    initDropdown('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', null);
    
    // Trigger initial structural validation sequence
    toggleSubjectInputs();
});

function toggleSubjectInputs() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    if (!section) return;

    // Fluid integration engine replacement for raw display switches
    if (type === 'subjectwise') {
        section.classList.add('visible');
    } else {
        section.classList.remove('visible');
    }
}

// 3. CORE ANALYTICAL CALCULATION ENGINE (CORE IMMUTED LOGIC)
function calculateScore() {
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
    
    return { 
        totalQs, maxMarks, attempted, wrong, correct, 
        unattempted, finalScore, efficiency, totalPenalty, marksPerCorrect 
    };
}

// 4. ULTRA PRO MAX CINEMATIC PDF GENERATION ENGINE
async function downloadPDF() {
    const data = calculateScore();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Standard A4: 210mm x 297mm
    
    const reportType = document.getElementById('reportType').value;
    const student = (document.getElementById('studentName').value || "CANDIDATE").toUpperCase();
    const test = (document.getElementById('testName').value || "ASSESSMENT").toUpperCase();

    // --- CYBERPUNK HUD EXTERIOR TECH BORDERS ---
    doc.setDrawColor(22, 16, 44); // Deep space purple tint
    doc.setLineWidth(0.5);
    doc.rect(6, 6, 198, 285); // Outer bounding box
    
    doc.setDrawColor(0, 242, 255); // Neon Cyan tech framing anchors
    doc.setLineWidth(1.5);
    // Top-Left corner bracket
    doc.line(5, 5, 15, 5); doc.line(5, 5, 5, 15);
    // Top-Right corner bracket
    doc.line(205, 5, 195, 5); doc.line(205, 5, 205, 15);
    // Bottom-Left corner bracket
    doc.line(5, 292, 15, 292); doc.line(5, 292, 5, 282);
    // Bottom-Right corner bracket
    doc.line(205, 292, 195, 292); doc.line(205, 292, 205, 282);

    // --- OBSIDIAN TECH HEADER PANEL ---
    doc.setFillColor(10, 7, 21); // Deep Matte Obsidian
    doc.rect(10, 10, 190, 36, 'F');
    
    // Bottom border glow layer of header
    doc.setFillColor(0, 242, 255); // Cyan Accent Strip
    doc.rect(10, 45, 190, 1, 'F');

    // Header Typography Core
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("QUANTUM PERFORMANCE DOSSIER", 20, 24);
    
    doc.setFontSize(7);
    doc.setFont("courier", "bold");
    doc.setTextColor(189, 0, 255); // Neon Purple
    doc.text("E7 ENGINE CORE V4.0 // SECURE METRICS VERIFICATION SYSTEM", 20, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Cool grey
    doc.setFontSize(8);
    doc.text("ISSUED BY ECLIPSE7 LABS • BRAND REPRESENTATIVE: SAIPRASAD BARURE", 20, 38);

    // --- META DATA INFORMATION GRIDS ---
    doc.setFillColor(248, 250, 252);
    
    // Render Custom Technical Table Layout
    doc.autoTable({
        startY: 52,
        margin: { left: 10, right: 10 },
        theme: 'plain',
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 5,
            textColor: [30, 41, 59],
            lineColor: [241, 245, 249],
            lineWidth: 0.5
        },
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [0, 242, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        head: [[{ content: 'TECHNICAL METRIC REGISTRY', colSpan: 2 }]],
        body: [
            ['CANDIDATE IDENTITY TOKEN', student],
            ['TARGET EVALUATION MATRIX', test],
            ['TOTAL ASSIGNED ASSESSMENT QUESTIONS', data.totalQs],
            ['MAXIMUM COMPUTED DATA MARKS', data.maxMarks],
            ['VERIFIED ABSOLUTE ACCURACIES', data.correct],
            ['IDENTIFIED ERROR PENALTIES', data.wrong],
            ['NEGATIVE MARKS INFLICTED', `- ${data.totalPenalty.toFixed(2)}`],
            ['QUANTUM INTELLIGENCE SCORE', `${data.finalScore.toFixed(2)} / ${data.maxMarks}`],
            ['SYSTEM ENGINE EFFICIENCY RATING', `${data.efficiency}%`]
        ],
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [71, 85, 105], width: 100 },
            1: { fontStyle: 'bold', textColor: [15, 23, 42], halign: 'right' }
        },
        didParseCell: function(dataCell) {
            // Highlight specific analytical cells for instant premium recognition
            if (dataCell.section === 'body' && dataCell.row.index === 7) {
                dataCell.cell.styles.fillColor = [240, 253, 250]; 
                dataCell.cell.styles.textColor = [13, 148, 136];
            }
            if (dataCell.section === 'body' && dataCell.row.index === 8) {
                dataCell.cell.styles.fillColor = [254, 242, 242]; 
                dataCell.cell.styles.textColor = [220, 38, 38];
            }
        }
    });

    let currentY = doc.lastAutoTable.finalY + 12;

    // --- HARDWARE VISUALIZATION PERFORMANCE METRIC METER TRACKS ---
    doc.setDrawColor(226, 232, 240);
    doc.line(10, currentY - 4, 200, currentY - 4);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ANALYTICAL HUD METERS", 12, currentY);
    currentY += 8;

    const metrics = [
        { label: `ACCURACY VALUE TRACKER (${data.correct} Q)`, val: data.correct, color: [0, 242, 255] }, // Tech Cyan
        { label: `FAULT INCIDENCE TRACKER (${data.wrong} Q)`, val: data.wrong, color: [189, 0, 255] }  // Cyber Purple
    ];

    metrics.forEach(m => {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(m.label, 12, currentY + 3);
        
        // Premium Metric Tunnel Background track container
        doc.setFillColor(241, 245, 249);
        doc.rect(65, currentY, 130, 4, 'F');
        
        // Active data indicator overlay pill
        const barWidth = data.totalQs > 0 ? (m.val / data.totalQs) * 130 : 0;
        if(barWidth > 0) {
            doc.setFillColor(m.color[0], m.color[1], m.color[2]);
            doc.rect(65, currentY, barWidth, 4, 'F');
        }
        currentY += 8;
    });

    // --- SUBJECT BREAKDOWN ADVANCED HUD GRID ---
    if (reportType === 'subjectwise') {
        currentY += 6;
        doc.setDrawColor(226, 232, 240);
        doc.line(10, currentY - 4, 200, currentY - 4);
        
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("CROSS-SUBJECT MODULAR ANALYTICS", 12, currentY);
        currentY += 8;

        const subjects = [
            { id: 'PHYSICS MATRIX', t: 'phyA', c: 'phyC', w: 'phyW' },
            { id: 'CHEMISTRY MATRIX', t: 'chemA', c: 'chemC', w: 'chemW' },
            { id: 'MATH / BIO MATRIX', t: 'mathBioA', c: 'mathBioC', w: 'mathBioW' }
        ];

        subjects.forEach(sub => {
            const total = parseInt(document.getElementById(sub.t).value) || 0;
            const corr = parseInt(document.getElementById(sub.c).value) || 0;
            const wrng = parseInt(document.getElementById(sub.w).value) || 0;

            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(71, 85, 105);
            doc.text(sub.id, 12, currentY + 3);

            // Gray background track
            doc.setFillColor(241, 245, 249);
            doc.rect(65, currentY, 130, 4, 'F');

            if (total > 0) {
                const cWidth = (corr / total) * 130;
                const wWidth = (wrng / total) * 130;
                
                // Stacked visual rendering elements
                doc.setFillColor(16, 185, 129); // Emerald Success
                doc.rect(65, currentY, cWidth, 4, 'F');
                doc.setFillColor(244, 63, 94); // Rose Critical Danger
                doc.rect(65 + cWidth, currentY, wWidth, 4, 'F');
            } else {
                doc.setFont("helvetica", "oblique");
                doc.setFontSize(6.5);
                doc.setTextColor(148, 163, 184);
                doc.text("DATA STREAM UNINITIALIZED / ZERO ATTEMPTS DETECTED", 65, currentY + 3);
                doc.setFont("helvetica", "bold");
            }
            currentY += 7;
        });
    }

    // --- CYBERPUNK STYLED INTEL POD BOX (RECOMMENDATIONS) ---
    currentY += 8;
    doc.setFillColor(10, 7, 21); // Dark Obsidian Pod Background
    doc.rect(10, currentY, 190, 34, 'F');
    
    // Left glowing thick highlight border strip
    doc.setFillColor(189, 0, 255); // Purple Accent Glow
    doc.rect(10, currentY, 2.5, 34, 'F');

    doc.setTextColor(0, 242, 255); // Cyan title text
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("AI AUTOMATED STRATEGY MATRIX RECOMMENDATIONS", 18, currentY + 7);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(226, 232, 240); // Crispy light text

    let advice = "";
    if (data.efficiency > 80) advice = "Excellent performance! Focus on strategic time management to lock in maximum scaling scores.";
    else if (data.efficiency > 50) advice = "Solid foundation. Identify cross-subject failure loops to smash past the 80% boundary line.";
    else advice = "Conceptual core vulnerability found. Cease guessing procedures instantly to eliminate penalties.";

    doc.text(`> CORE OPERATIONAL STRATEGY : ${advice}`, 18, currentY + 15);
    doc.text(`> LOGISTICAL ERROR LOG      : Total computed penalty impact totals ${data.totalPenalty.toFixed(2)} target assessment marks.`, 18, currentY + 21);
    doc.text(`> TARGET SYSTEM OPTIMIZATION : Analyze the ${data.unattempted} skipped structural prompts to find minimal resistance gains.`, 18, currentY + 27);

    // --- SIGNATURE PLATFORM & DEPLOYMENT STAMP SECTOR ---
    const footerY = 254;
    
    doc.setDrawColor(241, 245, 249);
    doc.line(10, footerY - 4, 200, footerY - 4);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("MR. PRASAD REDDY", 14, footerY + 4);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Chief Executive Officer & Founder, ECLIPSE7", 14, footerY + 9);
    doc.text("Verification Status: SECURE SYSTEM INTEGRITY APPROVED", 14, footerY + 14);
    
    const timestamp = new Date().toLocaleString();
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.text(`TRANSACTION LOG BLOCK ID: T_STAMP_${timestamp.toUpperCase().replace(/ /g, "_")}`, 14, footerY + 21);

    // Secure cross-origin image verification stamp parsing engine
    const stampUrl = "https://eclipse7-pixal.github.io/marking-calculator/stamp.png";
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = stampUrl;
    
    img.onload = function() {
        // Embed the stamp cleanly down right framed correctly inside the canvas borders
        doc.addImage(img, 'PNG', 158, 246, 36, 36);
        doc.save(`${student}_E7_PRO_REPORT.pdf`);
    };
    img.onerror = () => {
        // Fallback protection if network channels reject image assets safely
        doc.save(`${student}_E7_PRO_REPORT.pdf`);
    };
}
