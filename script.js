function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('ratio').value) || 0;
    
    const correct = attempted - wrong;
    const penalty = ratio > 0 ? (wrong / ratio) : 0;
    const finalScore = correct - penalty;
    const unattempted = totalQs - attempted;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { totalQs, attempted, wrong, correct, finalScore, unattempted };
}

async function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = calculateScore();
        
        // 1. BRANDED HEADER
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(56, 189, 248);
        doc.setFontSize(26);
        doc.text("Eclipse7 DIGITAL", 105, 25, { align: "center" });

        // 2. REPORT INFO
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text(`CANDIDATE: ${document.getElementById('studentName').value || "N/A"}`, 20, 55);
        doc.text(`DATE: ${new Date().toLocaleDateString()}`, 150, 55);

        // 3. PERFORMANCE TABLE
        doc.autoTable({
            startY: 65,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            body: [
                ['Total Questions', data.totalQs],
                ['Attempted', data.attempted],
                ['Correct', data.correct],
                ['Wrong', data.wrong],
                ['Unattempted', data.unattempted],
                ['FINAL SCORE', data.finalScore.toFixed(2)]
            ],
        });

        // 4. PERFORMANCE VISUALIZATION (Safe Linear Progress Bars)
        const chartY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.text("PERFORMANCE ANALYSIS", 20, chartY);
        
        const barWidth = 150;
        const correctWidth = (data.correct / data.totalQs) * barWidth;
        const wrongWidth = (data.wrong / data.totalQs) * barWidth;

        // Correct Bar
        doc.setFillColor(34, 197, 94);
        doc.rect(20, chartY + 5, correctWidth, 8, 'F');
        doc.setFontSize(8);
        doc.text(`Correct Rate: ${((data.correct/data.totalQs)*100).toFixed(1)}%`, 20, chartY + 18);

        // Wrong Bar
        doc.setFillColor(239, 68, 68);
        doc.rect(20, chartY + 25, wrongWidth, 8, 'F');
        doc.text(`Error Rate: ${((data.wrong/data.totalQs)*100).toFixed(1)}%`, 20, chartY + 38);

        // 5. CEO FOUNDER SECTION
        const footerY = 240;
        doc.setFontSize(11);
        doc.text("MR. PRASAD REDDY", 20, footerY);
        doc.setFontSize(9);
        doc.text("Founder & CEO, Eclipse7", 20, footerY + 5);
        doc.line(20, footerY + 8, 80, footerY + 8);

        // 6. OFFICIAL RED STAMP (Custom Design)
        doc.setDrawColor(180, 0, 0);
        doc.setLineWidth(1);
        doc.circle(160, footerY, 20, 'S');
        doc.circle(160, footerY, 18, 'S');
        doc.setTextColor(180, 0, 0);
        doc.setFontSize(7);
        doc.text("ECLIPSE7", 160, footerY - 2, { align: "center" });
        doc.text("CEO & FOUNDER", 160, footerY + 3, { align: "center" });
        doc.text("PRASAD REDDY", 160, footerY + 8, { align: "center" });

        // 7. FOOTER CTA
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(10);
        doc.text("YOU SHOULD VISIT OUR SITE, IT WAS SPECIALLY MADE FOR YOU.", 105, 280, { align: "center" });

        doc.save("Eclipse7_Verified_Report.pdf");
    } catch (e) {
        alert("Error: " + e.message);
    }
}
