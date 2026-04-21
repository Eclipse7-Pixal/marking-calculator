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
        const test = document.getElementById('testName').value || "General Assessment";
        const reportID = "E7-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        const date = new Date().toLocaleString();

        // 1. BRANDED HEADER
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(56, 189, 248);
        doc.setFontSize(26);
        doc.text("Eclipse7 DIGITAL", 105, 25, { align: "center" });
        doc.setFontSize(10);
        doc.text("VERIFIED ACADEMIC PERFORMANCE ANALYTICS", 105, 33, { align: "center" });

        // 2. CANDIDATE DATA
        doc.setTextColor(0);
        doc.text(`REPORT ID: ${reportID}`, 20, 55);
        doc.text(`DATE: ${date}`, 140, 55);
        doc.setFontSize(14);
        doc.text(`CANDIDATE: ${student}`, 20, 70);
        doc.text(`EXAMINATION: ${test}`, 20, 80);

        // 3. ANALYTICS TABLE
        doc.autoTable({
            startY: 90,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            body: [
                ['Total Questions Attempted', data.attempted],
                ['Correct Responses', data.correct],
                ['Incorrect Responses', data.wrong],
                ['Negative Marking Ratio', `1 / ${data.ratio}`],
                ['FINAL CALCULATED SCORE', data.finalScore.toFixed(2)]
            ],
        });

        // 4. PERFORMANCE CHART (Using stable Ellipse method)
        const chartY = doc.lastAutoTable.finalY + 35;
        doc.setFontSize(12);
        doc.text("PERFORMANCE OVERVIEW", 20, chartY - 20);
        
        // Draw Chart Base
        doc.setLineWidth(0.5);
        doc.setDrawColor(200);
        doc.ellipse(50, chartY, 20, 20, 'S'); 
        
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.text(`Correct: ${data.correct}`, 85, chartY - 5);
        doc.setTextColor(239, 68, 68);
        doc.text(`Incorrect: ${data.wrong}`, 85, chartY + 5);

        // 5. EXECUTIVE DETAILS
        const execY = chartY + 50;
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text("MR. PRASAD REDDY", 20, execY);
        doc.setFontSize(9);
        doc.text("Founder & CEO, Eclipse7", 20, execY + 5);
        doc.line(20, execY + 10, 80, execY + 10);
        doc.text("Authorized Digital Endorsement", 20, execY + 15);

        // 6. OFFICIAL STAMP
        doc.setDrawColor(239, 68, 68);
        doc.setLineWidth(1);
        doc.ellipse(160, execY + 10, 18, 18, 'S');
        doc.setFontSize(8);
        doc.setTextColor(239, 68, 68);
        doc.text("Eclipse7", 160, execY + 8, { align: "center" });
        doc.text("APPROVED", 160, execY + 13, { align: "center" });

        // 7. CALL TO ACTION
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("YOU SHOULD VISIT OUR SITE, IT WAS SPECIALLY MADE FOR YOU.", 105, 275, { align: "center" });
        
        doc.save(`${student}_Eclipse7_Verified_Report.pdf`);
    } catch (err) {
        alert("System Error: Please ensure all fields are filled. Details: " + err.message);
        console.error(err);
    }
}
