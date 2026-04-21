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
        
        const student = document.getElementById('studentName').value || "Candidate";
        const test = document.getElementById('testName').value || "Assessment";
        const reportID = "E7-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        const date = new Date().toLocaleString();

        // 1. HEADER
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(56, 189, 248);
        doc.setFontSize(26);
        doc.text("Eclipse7 DIGITAL", 105, 25, { align: "center" });
        doc.setFontSize(10);
        doc.text("VERIFIED ACADEMIC PERFORMANCE ANALYTICS", 105, 33, { align: "center" });

        // 2. DATA
        doc.setTextColor(0);
        doc.text(`REPORT ID: ${reportID}`, 20, 55);
        doc.text(`DATE: ${date}`, 140, 55);
        doc.setFontSize(14);
        doc.text(`CANDIDATE: ${student}`, 20, 70);
        doc.text(`EXAMINATION: ${test}`, 20, 80);

        // 3. TABLE
        doc.autoTable({
            startY: 90,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            body: [
                ['Total Attempted', data.attempted],
                ['Correct Responses', data.correct],
                ['Incorrect Responses', data.wrong],
                ['Negative Ratio', `1/${data.ratio}`],
                ['FINAL SCORE', data.finalScore.toFixed(2)]
            ],
        });

        // 4. CHART (Arc Method)
        const chartY = doc.lastAutoTable.finalY + 35;
        const total = data.attempted || 1;
        const correctAngle = (data.correct / total) * 2 * Math.PI;

        doc.setFontSize(12);
        doc.text("PERFORMANCE VISUALIZATION", 20, chartY - 20);
        
        doc.setLineWidth(10);
        doc.setDrawColor(34, 197, 94); // Green
        doc.arc(50, chartY, 20, 0, correctAngle, true);
        
        doc.setDrawColor(239, 68, 68); // Red
        doc.arc(50, chartY, 20, correctAngle, 2 * Math.PI, true);

        // 5. FOUNDER & CEO INFO
        const execY = chartY + 50;
        doc.setFontSize(11);
        doc.text("MR. PRASAD REDDY", 20, execY);
        doc.setFontSize(9);
        doc.text("Founder & CEO, Eclipse7", 20, execY + 5);
        doc.line(20, execY + 10, 70, execY + 10);
        doc.text("Authorized Digital Signature", 20, execY + 15);

        // 6. STAMP
        doc.setDrawColor(239, 68, 68);
        doc.circle(160, execY + 10, 15);
        doc.setFontSize(7);
        doc.setTextColor(239, 68, 68);
        doc.text("Eclipse7", 160, execY + 8, { align: "center" });
        doc.text("APPROVED", 160, execY + 13, { align: "center" });

        // 7. CALL TO ACTION
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(10);
        doc.text("YOU SHOULD VISIT OUR SITE, IT WAS SPECIALLY MADE FOR YOU.", 105, 270, { align: "center" });

        doc.save(`${student}_Eclipse7_Report.pdf`);
    } catch (err) {
        alert("PDF Error: " + err.message);
        console.error(err);
    }
}
