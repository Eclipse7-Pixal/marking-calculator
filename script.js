// --- 1. UI & DROPDOWN LOGIC ---
function initDropdown(containerId, triggerId, panelId, hiddenInputId, callback) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const panel = document.getElementById(panelId);
    const hidden = document.getElementById(hiddenInputId);
    const options = panel.querySelectorAll('.option-item');

    if (!container || !trigger || !panel) return;

    trigger.addEventListener('click', () => {
        panel.classList.toggle('show');
        container.classList.toggle('active');
    });

    options.forEach(item => {
        item.addEventListener('click', () => {
            trigger.textContent = item.textContent;
            hidden.value = item.getAttribute('data-value');
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

// Initialize your specific dropdowns from the HTML
initDropdown('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectInputs);
initDropdown('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', null);

function toggleSubjectInputs() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    if (section) {
        section.style.display = (type === 'subjectwise') ? 'block' : 'none';
    }
}

// --- 2. CALCULATION ENGINE ---
function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('markingRatio').value) || 0;
    
    if (totalQs === 0) return { totalQs: 0, finalScore: 0 };

    const correct = attempted - wrong;
    const unattempted = Math.max(0, totalQs - attempted);
    
    // Logic: Score = (Correct * MarksPerQ) - (Wrong * Penalty)
    const marksPerQ = maxMarks / totalQs;
    const penaltyPerQ = marksPerQ * ratio;
    const totalPenalty = wrong * penaltyPerQ; 
    const finalScore = (correct * marksPerQ) - totalPenalty;
    const efficiency = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;

    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.innerText = finalScore.toFixed(2);
    }
    
    return { 
        totalQs, maxMarks, attempted, wrong, correct, 
        unattempted, finalScore, efficiency, totalPenalty, marksPerQ, ratio 
    };
}

// --- 3. PDF GENERATION (EXACT E7 FORMAT) ---
async function downloadPDF() {
    if (!window.jspdf) {
        alert("Libraries not loaded. Check your internet connection.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = calculateScore();
    const reportType = document.getElementById('reportType').value;
    const student = (document.getElementById('studentName').value || "CANDIDATE").toUpperCase();
    const test = (document.getElementById('testName').value || "ASSESSMENT").toUpperCase();

    // 1. Header
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("STRATEGIC PERFORMANCE E7 Report", 105, 22, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(0, 242, 255);
    doc.text("OFFICIAL REPORT | POWERED BY ECLIPSE7 AI | FOUNDER: SAIPRASAD BARURE", 105, 32, { align: "center" });

    // 2. Data Summary
    doc.autoTable({
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        body: [
            ['STUDENT IDENTITY', student],
            ['ASSESSMENT TAG', test],
            ['NEGATIVE RATIO', document.getElementById('ratioLabel').textContent],
            ['VERIFIED CORRECT', data.correct],
            ['IDENTIFIED ERRORS', data.wrong],
            ['PENALTY INCURRED', `- ${data.totalPenalty.toFixed(2)}`],
            ['FINAL AGGREGATE', data.finalScore.toFixed(2)],
            ['EFFICIENCY', `${data.efficiency}%`]
        ],
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // 3. Visual Performance Bars
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text("CORE METRICS VISUALIZATION", 20, currentY);
    currentY += 6;

    const metrics = [
        { label: `Correct (${data.correct})`, val: data.correct, color: [34, 197, 94] }, 
        { label: `Wrong (${data.wrong})`, val: data.wrong, color: [239, 68, 68] },   
        { label: `Skipped (${data.unattempted})`, val: data.unattempted, color: [148, 163, 184] } 
    ];

    metrics.forEach(m => {
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(m.label, 20, currentY + 3);
        const barWidth = data.totalQs > 0 ? (m.val / data.totalQs) * 100 : 0;
        doc.setFillColor(m.color[0], m.color[1], m.color[2]);
        doc.rect(60, currentY, Math.max(barWidth, 2), 3, 'F');
        currentY += 8;
    });

    // 4. Subject Detail (If enabled)
    if (reportType === 'subjectwise') {
        currentY += 4;
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text("DETAILED SUBJECT BREAKDOWN", 20, currentY);
        currentY += 8;

        const subs = [
            { n: "PHYSICS", t: parseInt(document.getElementById('phyA').value)||0, c: parseInt(document.getElementById('phyC').value)||0, w: parseInt(document.getElementById('phyW').value)||0 },
            { n: "CHEMISTRY", t: parseInt(document.getElementById('chemA').value)||0, c: parseInt(document.getElementById('chemC').value)||0, w: parseInt(document.getElementById('chemW').value)||0 },
            { n: "MATH/BIO", t: parseInt(document.getElementById('mathBioA').value)||0, c: parseInt(document.getElementById('mathBioC').value)||0, w: parseInt(document.getElementById('mathBioW').value)||0 }
        ];

        subs.forEach(s => {
            if (s.t > 0) {
                doc.setFontSize(7);
                doc.setTextColor(80);
                doc.text(`${s.n}: ${s.c}C | ${s.w}W of ${s.t}Q`, 20, currentY + 3);
                const maxWidth = 100;
                const cWidth = (s.c / s.t) * maxWidth;
                const wWidth = (s.w / s.t) * maxWidth;
                doc.setFillColor(34, 197, 94); doc.rect(75, currentY, cWidth, 3, 'F');
                doc.setFillColor(239, 68, 68); doc.rect(75 + cWidth, currentY, wWidth, 3, 'F');
                currentY += 8;
            }
        });
    }

    // 5. Strategic Recommendations
    currentY += 5;
    doc.setDrawColor(220);
    doc.line(20, currentY, 190, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text("STRATEGIC RECOMMENDATIONS:", 20, currentY);
    doc.setFontSize(8);
    doc.setTextColor(80);
    currentY += 6;
    doc.text(`1. Optimization: You skipped ${data.unattempted} questions. Improving attempt speed could boost results.`, 20, currentY);
    currentY += 5;
    doc.text(`2. Error Correction: A penalty of ${data.totalPenalty.toFixed(2)} marks was lost to errors. Target accuracy.`, 20, currentY);
    currentY += 5;
    doc.text(`3. Efficiency: You achieved ${data.efficiency}% of the max ${data.maxMarks} marks.`, 20, currentY);

    // 6. Signature & Stamp
    const footerY = 270;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text("MR. PRASAD REDDY", 20, footerY);
    doc.setFontSize(7);
    doc.text("Founder & CEO, ECLIPSE7", 20, footerY + 4);

    const stampUrl = "https://eclipse7-pixal.github.io/marking-calculator/stamp.png";
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = stampUrl;
    
    img.onload = function() {
        doc.addImage(img, 'PNG', 155, 252, 38, 38);
        doc.save(`${student}_E7_Report.pdf`);
    };
    img.onerror = function() {
        doc.save(`${student}_E7_Report.pdf`);
    };
}
