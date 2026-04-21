function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('ratio').value) || 4;
    
    const correct = attempted - wrong;
    const penalty = ratio > 0 ? (wrong / ratio) : 0;
    
    // Calculate marks based on Max Marks provided
    const marksPerCorrect = totalQs > 0 ? (maxMarks / totalQs) : 0;
    const finalScore = (correct * marksPerCorrect) - penalty;
    const percentage = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;
    const unattempted = totalQs - attempted;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { totalQs, maxMarks, attempted, wrong, correct, finalScore, unattempted, percentage };
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = calculateScore();
    const student = document.getElementById('studentName').value || "Candidate";

    // 1. BRANDED HEADER (AI Dark Style)
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(26);
    doc.text("Eclipse7 DIGITAL", 105, 25, { align: "center" });

    // 2. DATA TABLE (Matching your sample)
    doc.autoTable({
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        body: [
            ['Student Name', student],
            ['Total Questions', data.totalQs],
            ['Maximum Marks', data.maxMarks],
            ['Total Attempted', data.attempted],
            ['Correct Answers', data.correct],
            ['Wrong Answers', data.wrong],
            ['Final Score', data.finalScore.toFixed(2)],
            ['Percentage', data.percentage + "%"]
        ],
    });

    // 3. PIE CHART (Stable Rendering)
    const chartY = doc.lastAutoTable.finalY + 40;
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("PERFORMANCE PIE CHART", 20, chartY - 25);
    
    // Draw Legend
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94); doc.text(`Correct: ${data.correct}`, 120, chartY - 5);
    doc.setTextColor(239, 68, 68); doc.text(`Incorrect: ${data.wrong}`, 120, chartY + 5);
    doc.setTextColor(100); doc.text(`Unattempted: ${data.unattempted}`, 120, chartY + 15);

    // Drawing the Circle segments
    doc.setLineWidth(12);
    doc.setDrawColor(230, 230, 230); // Grey Base
    doc.circle(70, chartY, 20, 'S');
    
    if(data.correct > 0) {
        doc.setDrawColor(34, 197, 94); // Green for Correct
        doc.ellipse(70, chartY, 20, 20, 'S');
    }

    // 4. CEO STAMP INTEGRATION
    const footerY = 240;
    doc.setTextColor(0);
    doc.text("MR. PRASAD REDDY", 20, footerY);
    doc.setFontSize(9);
    doc.text("Founder & CEO, Eclipse7", 20, footerY + 5);
    doc.line(20, footerY + 8, 80, footerY + 8);

    // This handles the stamp you renamed on Windows
    try {
        doc.addImage('stamp.png', 'PNG', 140, footerY - 20, 40, 40);
    } catch (e) {
        // Red circle fallback if upload fails
        doc.setDrawColor(180, 0, 0);
        doc.setLineWidth(1);
        doc.circle(160, footerY, 20, 'S');
        doc.setTextColor(180, 0, 0);
        doc.text("ECLIPSE7", 160, footerY, { align: "center" });
    }

    doc.save(`${student}_Eclipse7_Report.pdf`);
}
