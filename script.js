function calculateScore() {
    const totalInTest = parseFloat(document.getElementById('totalQs').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('ratio').value) || 0;
    
    const correct = attempted - wrong;
    const unattempted = totalInTest - attempted;
    const penalty = ratio > 0 ? (wrong / ratio) : 0;
    const finalScore = correct - penalty;

    document.getElementById('score').innerText = finalScore.toFixed(2);
    return { totalInTest, attempted, wrong, correct, unattempted, finalScore, ratio };
}

async function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = calculateScore();
        
        const student = document.getElementById('studentName').value || "Candidate";
        const test = document.getElementById('testName').value || "Assessment";
        const reportID = "E7-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        // 1. HEADER
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(56, 189, 248);
        doc.setFontSize(26);
        doc.text("Eclipse7 DIGITAL", 105, 25, { align: "center" });
        doc.setFontSize(10);
        doc.text("VERIFIED ACADEMIC PERFORMANCE ANALYTICS", 105, 33, { align: "center" });

        // 2. IDENTITY
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text(`REPORT ID: ${reportID}`, 20, 55);
        doc.text(`DATE: ${new Date().toLocaleString()}`, 140, 55);
        doc.setFontSize(14);
        doc.text(`CANDIDATE: ${student}`, 20, 70);
        doc.text(`EXAMINATION: ${test}`, 20, 80);

        // 3. FULL ANALYTICS TABLE
        doc.autoTable({
            startY: 90,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            body: [
                ['Total Questions in Test', data.totalInTest],
                ['Total Questions Attempted', data.attempted],
                ['Correct Responses', data.correct],
                ['Incorrect Responses', data.wrong],
                ['Unattempted Questions', data.unattempted],
                ['Negative Ratio', `1/${data.ratio}`],
                ['FINAL CALCULATED SCORE', data.finalScore.toFixed(2)]
            ],
        });

        // 4. PIE CHART LOGIC (Fixed)
        const chartY = doc.lastAutoTable.finalY + 45;
        const centerX = 60;
        const radius = 25;
        
        doc.setFontSize(12);
        doc.text("PERFORMANCE DISTRIBUTION", 20, chartY - 30);

        // Calculate Proportions
        const correctP = data.correct / data.totalInTest;
        const wrongP = data.wrong / data.totalInTest;
        const unattemptedP = data.unattempted / data.totalInTest;

        // Draw Base (Unattempted - Grey)
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(10);
        doc.ellipse(centerX, chartY, radius, radius, 'S');

        // Draw Correct Segment (Green)
        if(correctP > 0) {
            doc.setDrawColor(34, 197, 94);
            doc.arc(centerX, chartY, radius, 0, correctP * 2 * Math.PI, true);
        }

        // Draw Wrong Segment (Red)
        if(wrongP > 0) {
            doc.setDrawColor(239, 68, 68);
            const startAngle = correctP * 2 * Math.PI;
            const endAngle = startAngle + (wrongP * 2 * Math.PI);
            doc.arc(centerX, chartY, radius, startAngle, endAngle, true);
        }

        // Legend
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94); doc.text(`Correct: ${data.correct}`, 110, chartY - 5);
        doc.setTextColor(239, 68, 68); doc.text(`Incorrect: ${data.wrong}`, 110, chartY + 5);
        doc.setTextColor(100); doc.text(`Unattempted: ${data.unattempted}`, 110, chartY + 15);

        // 5. CEO ENDORSEMENT & STAMP
        const execY = chartY + 50;
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text("MR. PRASAD REDDY", 20, execY);
        doc.setFontSize(9);
        doc.text("Founder & CEO, Eclipse7", 20, execY + 5);
        doc.line(20, execY + 10, 80, execY + 10);

        // ADDING YOUR CUSTOM STAMP
        // Note: To use your actual image, you should host it (like on GitHub) 
        // and put the URL below. For now, I've created a high-res digital placeholder.
        doc.setDrawColor(180, 0, 0);
        doc.setLineWidth(1.5);
        doc.circle(160, execY + 15, 22, 'S');
        doc.setFontSize(8);
        doc.setTextColor(180, 0, 0);
        doc.text("ECLIPSE7", 160, execY + 10, { align: "center" });
        doc.text("CEO & FOUNDER", 160, execY + 15, { align: "center" });
        doc.setFontSize(9);
        doc.text("PRASAD REDDY", 160, execY + 20, { align: "center" });
        doc.setFontSize(7);
        doc.text("VERIFIED", 160, execY + 25, { align: "center" });

        // 6. FOOTER
        doc.setTextColor(37, 99, 235);
        doc.setFont("helvetica", "bold");
        doc.text("YOU SHOULD VISIT OUR SITE, IT WAS SPECIALLY MADE FOR YOU.", 105, 280, { align: "center" });

        doc.save(`${student}_Eclipse7_Verified_Report.pdf`);
    } catch (err) {
        alert("Report Generation Error: " + err.message);
    }
}
