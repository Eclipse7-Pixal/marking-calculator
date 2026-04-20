function calculateScore() {
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('ratio').value) || 0;
    
    const correct = attempted - wrong;
    const penalty = ratio > 0 ? (wrong / ratio) : 0;
    const finalScore = correct - penalty;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { attempted, wrong, correct, finalScore, ratio };
}

async function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = calculateScore();
        
        const student = document.getElementById('studentName').value || "Student";
        const test = document.getElementById('testName').value || "Examination";
        const date = new Date().toLocaleString();
        const reportID = "E7-" + Math.random().toString(36).substr(2, 6).toUpperCase();

        // 1. BRAND HEADER (Capitalized)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("Eclipse7 DIGITAL", 105, 40, { align: "center" });

        // 2. IDENTITY SECTION
        doc.line(20, 45, 190, 45);
        doc.setFontSize(10);
        doc.text(`Student: ${student}`, 20, 55);
        doc.text(`Test: ${test}`, 20, 62);
        doc.text(`ID: ${reportID}`, 150, 55);
        doc.text(`Date: ${date}`, 150, 62);

        // 3. DATA TABLE
        doc.autoTable({
            startY: 70,
            head: [['Metric', 'Value']],
            body: [
                ['Attempted', data.attempted],
                ['Correct', data.correct],
                ['Wrong', data.wrong],
                ['Ratio', `1/${data.ratio}`],
                ['Score', data.finalScore.toFixed(2)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        const finalY = doc.lastAutoTable.finalY + 30;

        // 4. PIE CHART (Simplified for Compatibility)
        doc.setFontSize(12);
        doc.text("Performance Chart", 20, finalY - 10);
        doc.setLineWidth(0.5);
        doc.circle(50, finalY + 20, 20); // The "Pie" base
        doc.setFontSize(9);
        doc.text(`- Correct: ${data.correct}`, 80, finalY + 15);
        doc.text(`- Wrong: ${data.wrong}`, 80, finalY + 25);

        // 5. CIRCULAR STAMP (Red)
        doc.setDrawColor(192, 57, 43);
        doc.setLineWidth(1);
        doc.circle(160, finalY + 20, 20);
        doc.circle(160, finalY + 20, 18);
        doc.setFontSize(8);
        doc.setTextColor(192, 57, 43);
        doc.text("Eclipse7", 160, finalY + 18, { align: "center" });
        doc.text("APPROVED", 160, finalY + 23, { align: "center" });

        // 6. FOOTER
        doc.setTextColor(150);
        doc.setFontSize(8);
        doc.text("Verify at eclipse7.odoo.com", 105, 285, { align: "center" });

        doc.save(`${student}_Eclipse7_Report.pdf`);
    } catch (error) {
        console.error("PDF Error:", error);
        alert("There was an error generating the PDF. Please ensure all fields are filled.");
    }
}
