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
    const unattempted = totalQs - attempted;
    const marksPerCorrect = totalQs > 0 ? (maxMarks / totalQs) : 0;
    const totalPenalty = wrong * (marksPerCorrect / 4);
    const finalScore = (correct * marksPerCorrect) - totalPenalty;
    const percentage = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { totalQs, maxMarks, attempted, wrong, correct, unattempted, finalScore, percentage, totalPenalty };
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = calculateScore();
    const reportType = document.getElementById('reportType').value;
    const student = (document.getElementById('studentName').value || "CANDIDATE").toUpperCase();
    const test = document.getElementById('testName').value || "ASSESSMENT ALPHA";

    // --- DARK ARCHITECTURE HEADER ---
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("INTELLIGENCE DOSSIER", 105, 25, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(0, 242, 255);
    doc.text("POWERED BY ECLIPSE7 STRATEGIC ENGINE | CEO: PRASAD REDDY", 105, 35, { align: "center" });

    // --- DATA TABLE ---
    doc.autoTable({
        startY: 55, theme: 'grid', styles: { fontSize: 8, cellPadding: 4 }, headStyles: { fillColor: [20, 20, 20] },
        body: [
            ['IDENTITY', student], ['ASSESSMENT', test], ['TOTAL QUESTIONS', data.totalQs],
            ['VERIFIED CORRECT', data.correct], ['INACCURACIES', data.wrong],
            ['PENALTY LOAD', `- ${data.totalPenalty.toFixed(2)}`], ['FINAL SCORE', data.finalScore.toFixed(2)]
        ],
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // --- SUBJECT BREAKDOWN WITH INTEGRATED BAR LOGIC ---
    if (reportType === 'subjectwise') {
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text("SUBJECT-SPECIFIC ANALYTICS", 20, currentY);
        
        const subs = [
            { n: "PHYSICS", t: parseInt(document.getElementById('phyT').value)||0, c: parseInt(document.getElementById('phyC').value)||0, w: parseInt(document.getElementById('phyW').value)||0 },
            { n: "CHEMISTRY", t: parseInt(document.getElementById('chemT').value)||0, c: parseInt(document.getElementById('chemC').value)||0, w: parseInt(document.getElementById('chemW').value)||0 },
            { n: "MATH/BIO", t: parseInt(document.getElementById('mathBioT').value)||0, c: parseInt(document.getElementById('mathBioC').value)||0, w: parseInt(document.getElementById('mathBioW').value)||0 }
        ];

        subs.forEach(s => {
            if (s.t > 0) {
                currentY += 15;
                doc.setFontSize(8); doc.setTextColor(100);
                doc.text(`${s.n}: ${s.c} Correct, ${s.w} Wrong of ${s.t} Total`, 20, currentY);
                
                const barWidth = 100;
                const cW = (s.c / s.t) * barWidth;
                const wW = (s.w / s.t) * barWidth;

                doc.setFillColor(34, 197, 94); doc.rect(80, currentY - 3, cW, 3, 'F'); // Correct
                doc.setFillColor(239, 68, 68); doc.rect(80 + cW, currentY - 3, wW, 3, 'F'); // Wrong
            }
        });
    }

    doc.save(`${student}_Scoring_Report.pdf`);
}
