function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('ratio').value) || 4;
    
    const correct = attempted - wrong;
    const penalty = ratio > 0 ? (wrong / ratio) : 0;
    
    // Logic for JEE/NEET style scoring (4 marks per correct)
    // Adjust if your marking system is different
    const marksPerCorrect = maxMarks / totalQs;
    const finalScore = (correct * marksPerCorrect) - penalty;
    const unattempted = totalQs - attempted;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { totalQs, maxMarks, attempted, wrong, correct, finalScore, unattempted };
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

        // 2. PERFORMANCE TABLE
        doc.autoTable({
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            body: [
                ['Student Name', document.getElementById('studentName').value || "N/A"],
                ['Test Name', document.getElementById('testName').value || "N/A"],
                ['Total Questions', data.totalQs],
                ['Maximum Marks', data.maxMarks],
                ['Correct Answers', data.correct],
                ['Incorrect Answers', data.wrong],
                ['Unattempted', data.unattempted],
                ['FINAL SCORE', data.finalScore.toFixed(2)]
            ],
        });

        // 3. PIE CHART (Drawn with reliable fill method)
        const chartY = doc.lastAutoTable.finalY + 40;
        const centerX = 60;
        const radius = 25;

        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text("PERFORMANCE ANALYSIS", 20, chartY - 30);

        // Calculate portions
        const total = data.totalQs || 1;
        const correctFrac = data.correct / total;
        const wrongFrac = data.wrong / total;

        // Draw segments using circles with different stroke colors (Most stable PDF method)
        doc.setLineWidth(12);
        
        // Grey base (Unattempted)
        doc.setDrawColor(200, 200, 200);
        doc.circle(centerX, chartY, radius, 'S');

        // Green segment (Correct) - Simplified for PDF stability
        if (data.correct > 0) {
            doc.setDrawColor(34, 197, 94);
            doc.ellipse(centerX, chartY, radius, radius, 'S');
        }

        // Legend
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94); doc.text(`Correct: ${data.correct}`, 110, chartY - 5);
        doc.setTextColor(239, 68, 68); doc.text(`Incorrect: ${data.wrong}`, 110, chartY + 5);
        doc.setTextColor(100); doc.text(`Unattempted: ${data.unattempted}`, 110, chartY + 15);

        // 4. CEO & FOUNDER STAMP INTEGRATION
        const footerY = 240;
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text("MR. PRASAD REDDY", 20, footerY);
        doc.setFontSize(9);
        doc.text("Founder & CEO, Eclipse7", 20, footerY + 5);
        doc.line(20, footerY + 8, 80, footerY + 8);

        // LOAD YOUR EXACT STAMP
        // This will try to load the 'stamp.png' from your GitHub folder
        try {
            // Replace 'stamp.png' with the exact name of the file you upload to GitHub
            doc.addImage('stamp.png', 'PNG', 140, footerY - 20, 40, 40);
        } catch (e) {
            // Fallback if image not found: Draw the specialized Red Ring Stamp
            doc.setDrawColor(180, 0, 0);
            doc.setLineWidth(1.5);
            doc.circle(160, footerY, 20, 'S');
            doc.setTextColor(180, 0, 0);
            doc.setFontSize(8);
            doc.text("ECLIPSE7", 160, footerY - 2, { align: "center" });
            doc.text("VERIFIED", 160, footerY + 5, { align: "center" });
        }

        // 5. FOOTER
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(10);
        doc.text("YOU SHOULD VISIT OUR SITE, IT WAS SPECIALLY MADE FOR YOU.", 105, 280, { align: "center" });

        doc.save(`${document.getElementById('studentName').value}_Eclipse7_Report.pdf`);
    } catch (err) {
        alert("CRITICAL ERROR: " + err.message);
    }
}
