function toggleSubjectInputs() {
    const section = document.getElementById('subjectSection');
    section.style.display = document.getElementById('reportType').value === 'subjectwise' ? 'block' : 'none';
}

function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    
    const correct = attempted - wrong;
    const unattempted = Math.max(0, totalQs - attempted);
    
    // Logic for Marks and Penalty
    const marksPerCorrect = totalQs > 0 ? (maxMarks / totalQs) : 0;
    const totalPenalty = wrong * (marksPerCorrect / 4); // Standard 1/4th negative marking
    const finalScore = (correct * marksPerCorrect) - totalPenalty;
    const efficiency = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    
    return { 
        totalQs, maxMarks, attempted, wrong, correct, 
        unattempted, finalScore, efficiency, totalPenalty, marksPerCorrect 
    };
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = calculateScore();
    const reportType = document.getElementById('reportType').value;
    const student = (document.getElementById('studentName').value || "CANDIDATE").toUpperCase();
    const test = (document.getElementById('testName').value || "ASSESSMENT TAG").toUpperCase();

    // --- 1. DARK HEADER ---
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("STRATEGIC PERFORMANCE E7 Report", 105, 22, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(0, 242, 255);
    doc.text("OFFICIAL REPORT | POWERED BY ECLIPSE7 AI | CEO&FOUNDER OF ECLIPSE7 AI: SAIPRASAD BARURE", 105, 32, { align: "center" });

    // --- 2. FULL DATA TABLE (INCLUDING MISSING SECTIONS) ---
    doc.autoTable({
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        body: [
            ['STUDENT IDENTITY', student],
            ['ASSESSMENT TAG', test],
            ['TOTAL QUESTIONS', data.totalQs],
            ['MAXIMUM MARKS', data.maxMarks],
            ['VERIFIED CORRECT', data.correct],
            ['IDENTIFIED ERRORS', data.wrong],
            ['PENALTY MARKS (NEGATIVE)', `- ${data.totalPenalty.toFixed(2)}`],
            ['FINAL AGGREGATE SCORE', data.finalScore.toFixed(2)],
            ['EFFICIENCY RATING', `${data.efficiency}%`]
        ],
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // --- 3. CORE METRICS BARS ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text("CORE PERFORMANCE SCORE", 20, currentY);
    currentY += 6;

    const metrics = [
        { label: `Accuracy (${data.correct})`, val: data.correct, color: [34, 197, 94] }, 
        { label: `Errors (${data.wrong})`, val: data.wrong, color: [239, 68, 68] },   
        { label: `Unattempted (${data.unattempted})`, val: data.unattempted, color: [148, 163, 184] } 
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

    // --- 4. SUBJECT ANALYSIS (INTEGRATED ON ONE PAGE) ---
    if (reportType === 'subjectwise') {
        currentY += 4;
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text("SUBJECT-WISE ANALYSIS", 20, currentY);
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
                doc.setFillColor(34, 197, 94); doc.rect(60, currentY, cWidth, 3, 'F');
                doc.setFillColor(239, 68, 68); doc.rect(60 + cWidth, currentY, wWidth, 3, 'F');
                currentY += 8;
            }
        });
    }

    // --- 5. STRATEGIC RECOMMENDATIONS (FULL BOX) ---
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
    doc.text(`1. Optimization: You left ${data.unattempted} questions unaddressed. Focus on attempt velocity.`, 20, currentY);
    currentY += 5;
    doc.text(`2. Error Correction: Penalty of ${data.totalPenalty.toFixed(2)} marks was incurred due to inaccuracies.`, 20, currentY);
    currentY += 5;
    doc.text(`3. Insight: Max possible marks for this test was ${data.maxMarks}. Current Efficiency: ${data.efficiency}%.`, 20, currentY);

    // --- 6. SIGNATURE & GITHUB STAMP ---
    const footerY = 270;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text("MR. PRASAD REDDY", 20, footerY);
    doc.setFontSize(7);
    doc.text("Founder & CEO, ECLIPSE7", 20, footerY + 4);
    doc.setTextColor(150);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, footerY + 10);

    // Pulling stamp.png from your repository
    const stampUrl = "https://eclipse7-pixal.github.io/marking-calculator/stamp.png";
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = stampUrl;
    img.onload = function() {
        doc.addImage(img, 'PNG', 155, 252, 38, 38);
        doc.save(`${student}_Official_E7_Report.pdf`);
    };
    img.onerror = function() {
        doc.save(`${student}_Official_E7_Report.pdf`);
    };
}
