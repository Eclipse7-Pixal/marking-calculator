function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('ratio').value) || 4;
    
    const correct = attempted - wrong;
    const unattempted = totalQs - attempted;
    const marksPerCorrect = totalQs > 0 ? (maxMarks / totalQs) : 0;
    const penaltyPerWrong = ratio > 0 ? (marksPerCorrect / ratio) : 0;
    
    const totalPenalty = wrong * penaltyPerWrong;
    const finalScore = (correct * marksPerCorrect) - totalPenalty;
    const percentage = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { totalQs, maxMarks, attempted, wrong, correct, unattempted, finalScore, percentage, marksPerCorrect, totalPenalty };
}

async function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = calculateScore();
        const student = document.getElementById('studentName').value || "Candidate";
        const dateStr = new Date().toLocaleString();

        // 1. BRANDED HEADER
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

        // 3. PIE DIAGRAM (FIXED DRAWING LOGIC)
        const chartY = doc.lastAutoTable.finalY + 45;
        const centerX = 55;
        const radius = 25;
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text("PERFORMANCE PIE CHART", 20, chartY - 30);

        const total = data.totalQs || 1;
        
        // Base: Draw Unattempted first (Grey Circle)
        doc.setFillColor(210, 210, 210);
        doc.circle(centerX, chartY, radius, 'F');

        // Draw Slices using sector (Angles are in degrees)
        let startAngle = 0;

        // Correct Slice (Green)
        if (data.correct > 0) {
            const correctAngle = (data.correct / total) * 360;
            doc.setFillColor(34, 197, 94);
            doc.sector(centerX, chartY, radius, startAngle, startAngle + correctAngle, 'F');
            startAngle += correctAngle;
        }

        // Wrong Slice (Red)
        if (data.wrong > 0) {
            const wrongAngle = (data.wrong / total) * 360;
            doc.setFillColor(239, 68, 68);
            doc.sector(centerX, chartY, radius, startAngle, startAngle + wrongAngle, 'F');
        }

        // Legend
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94); doc.text(`Correct: ${data.correct}`, 110, chartY - 5);
        doc.setTextColor(239, 68, 68); doc.text(`Incorrect: ${data.wrong}`, 110, chartY + 5);
        doc.setTextColor(150); doc.text(`Unattempted: ${data.unattempted}`, 110, chartY + 15);

        // 4. RECOMMENDATIONS (EXACT SENTENCE REPLACEMENT)
        const recY = chartY + 40;
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text("Recommendations:", 20, recY);
        doc.setFontSize(10);
        
        const unP = ((data.unattempted / total) * 100).toFixed(2);
        const boost = ((data.unattempted * data.marksPerCorrect / (data.maxMarks || 1)) * 100).toFixed(2);

        // Exact sentences you requested
        doc.text(`1. Spend more time reviewing: You left ${data.unattempted} (${unP}%) of the questions unattempted.`, 20, recY + 10);
        doc.text(`2. Switch focus to unattempted: Solving ${data.unattempted} more questions correctly could boost your percentage by`, 20, recY + 18);
        doc.text(`approximately ${boost}%.`, 20, recY + 24);

        // 5. CEO FOUNDER & RULE
        const footerY = 245;
        doc.setFontSize(11);
        doc.text("MR. PRASAD REDDY", 20, footerY);
        doc.setFontSize(9);
        doc.text("Founder & CEO, Eclipse7", 20, footerY + 5);
        doc.setTextColor(100);
        doc.text("Rule: Strategic Oversight & Operational Integrity", 20, footerY + 10);
        doc.line(20, footerY + 12, 80, footerY + 12);

        // 6. STAMP & WEBSITE
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

        doc.save(`${student}_Report.pdf`);
    } catch (err) {
        alert("Download failed: " + err.message);
    }
}
