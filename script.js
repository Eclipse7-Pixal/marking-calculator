function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('ratio').value) || 4; // Assuming 4 for 1/4
    
    const correct = attempted - wrong;
    const unattempted = totalQs - attempted;
    
    // Formula Fix: Penalty must be relative to marks per question
    const marksPerCorrect = totalQs > 0 ? (maxMarks / totalQs) : 0;
    const penaltyPerWrong = ratio > 0 ? (marksPerCorrect / ratio) : 0;
    
    const totalPenalty = wrong * penaltyPerWrong;
    const finalScore = (correct * marksPerCorrect) - totalPenalty;
    const percentage = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { totalQs, maxMarks, attempted, wrong, correct, unattempted, finalScore, percentage, marksPerCorrect, totalPenalty };
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = calculateScore();
    const student = document.getElementById('studentName').value || "Candidate";
    const dateStr = new Date().toLocaleString();

    // 1. HEADER
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(26);
    doc.text("Eclipse7 DIGITAL", 105, 25, { align: "center" });

    // 2. DATA TABLE
    doc.autoTable({
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        body: [
            ['Student Name', student],
            ['Total Questions', data.totalQs],
            ['Maximum Marks', data.maxMarks],
            ['Correct Answers', data.correct],
            ['Wrong Answers', data.wrong],
            ['Penalty Marks', data.totalPenalty.toFixed(2)],
            ['Final Score', data.finalScore.toFixed(2)],
            ['Percentage', data.percentage + "%"]
        ],
    });

    // 3. PIE CHART (Multi-segment fix)
    const chartY = doc.lastAutoTable.finalY + 45;
    const centerX = 60;
    const radius = 25;
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("PERFORMANCE ANALYSIS", 20, chartY - 30);

    const total = data.totalQs || 1;
    const slices = [
        { val: data.correct, color: [34, 197, 94] },   // Green
        { val: data.wrong, color: [239, 68, 68] },     // Red
        { val: data.unattempted, color: [200, 200, 200] } // Grey
    ];

    let startAngle = 0;
    slices.forEach(slice => {
        if (slice.val > 0) {
            const angle = (slice.val / total) * (2 * Math.PI);
            doc.setDrawColor(slice.color[0], slice.color[1], slice.color[2]);
            doc.setLineWidth(12);
            doc.arc(centerX, chartY, radius, startAngle, startAngle + angle, false);
            startAngle += angle;
        }
    });

    // 4. PERSONALIZED RECOMMENDATIONS (Dynamic Logic)
    const recY = chartY + 40;
    doc.setFontSize(12);
    doc.text("Recommendations:", 20, recY);
    doc.setFontSize(10);
    
    const unattemptedPct = ((data.unattempted / data.totalQs) * 100).toFixed(2);
    const potentialBoost = ((data.unattempted * data.marksPerCorrect / data.maxMarks) * 100).toFixed(2);

    doc.text(`1. Review Strategy: You left ${data.unattempted} (${unattemptedPct}%) questions unattempted.`, 20, recY + 10);
    doc.text(`2. Focus Area: Solving these correctly could boost your percentage by approx ${potentialBoost}%.`, 20, recY + 18);

    // 5. FOUNDER & CEO SECTION
    const footerY = 245;
    doc.setFontSize(11);
    doc.text("MR. PRASAD REDDY", 20, footerY);
    doc.setFontSize(9);
    doc.text("Founder & CEO, Eclipse7", 20, footerY + 5);
    doc.text("Rule: Strategic Oversight & Operational Integrity", 20, footerY + 10);
    doc.line(20, footerY + 12, 80, footerY + 12);

    // 6. STAMP & FOOTER
    try {
        doc.addImage('stamp.png', 'PNG', 140, footerY - 20, 40, 40);
    } catch (e) {
        doc.setDrawColor(180, 0, 0);
        doc.circle(160, footerY, 15, 'S');
    }

    doc.setTextColor(37, 99, 235);
    doc.text("Visit: https://eclipse7.odoo.com/", 105, 275, { align: "center" });
    doc.setTextColor(150);
    doc.text(`Issued on: ${dateStr}`, 105, 282, { align: "center" });

    doc.save(`${student}_Eclipse7_Report.pdf`);
}
