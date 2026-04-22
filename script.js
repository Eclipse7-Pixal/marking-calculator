function toggleSubjectInputs() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    section.style.display = type === 'subjectwise' ? 'block' : 'none';
}

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
    return { totalQs, maxMarks, attempted, wrong, correct, unattempted, finalScore, percentage, totalPenalty };
}

async function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = calculateScore();
        const reportType = document.getElementById('reportType').value;
        const student = (document.getElementById('studentName').value || "Candidate").toUpperCase();
        const test = document.getElementById('testName').value || "Assessment";
        const reportID = "E7-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        // --- BRANDED HEADER ---
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text("Negative Marking Calculator", 105, 15, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(56, 189, 248);
        doc.text(`Performance Report | Powered by ECLIPSE7`, 105, 25, { align: "center" });
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(`REPORT ID: ${reportID}`, 190, 35, { align: "right" });

        // --- DATA TABLE ---
        doc.autoTable({
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [15, 23, 42] },
            body: [
                ['Student Name', student],
                ['Test Name', test],
                ['Total Questions', data.totalQs],
                ['Maximum Marks', data.maxMarks],
                ['Correct Answers', data.correct],
                ['Wrong Answers', data.wrong],
                ['Penalty Marks', `- ${data.totalPenalty.toFixed(2)}`],
                ['Final Score', data.finalScore.toFixed(2)],
                ['Percentage', data.percentage + "%"]
            ],
        });

        let currentY = doc.lastAutoTable.finalY + 15;

        // --- OVERALL GRAPH ---
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("PERFORMANCE OVERVIEW", 20, currentY);
        
        const graphW = 100;
        const total = data.totalQs || 1;
        
        drawBar(doc, 20, currentY + 8, (data.correct / total) * graphW, [34, 197, 94], `Correct (${data.correct})`);
        drawBar(doc, 20, currentY + 16, (data.wrong / total) * graphW, [239, 68, 68], `Wrong (${data.wrong})`);
        drawBar(doc, 20, currentY + 24, (data.unattempted / total) * graphW, [148, 163, 184], `Skipped (${data.unattempted})`);

        currentY += 40;

        // --- SUBJECT-WISE GRAPH (Same Page) ---
        if (reportType === 'subjectwise') {
            doc.setDrawColor(200);
            doc.line(20, currentY - 5, 190, currentY - 5);
            doc.text("SUBJECT-WISE ANALYSIS", 20, currentY);
            
            const subjects = [
                { n: "Physics", t: parseInt(document.getElementById('phyT').value) || 0, c: parseInt(document.getElementById('phyC').value) || 0, w: parseInt(document.getElementById('phyW').value) || 0 },
                { n: "Chemistry", t: parseInt(document.getElementById('chemT').value) || 0, c: parseInt(document.getElementById('chemC').value) || 0, w: parseInt(document.getElementById('chemW').value) || 0 },
                { n: "Math/Bio", t: parseInt(document.getElementById('mathBioT').value) || 0, c: parseInt(document.getElementById('mathBioC').value) || 0, w: parseInt(document.getElementById('mathBioW').value) || 0 }
            ];

            subjects.forEach(s => {
                if(s.t > 0) {
                    doc.setFontSize(9);
                    doc.text(`${s.n}: ${s.c}/${s.t} Correct`, 20, currentY + 8);
                    const barScale = 120;
                    doc.setFillColor(34, 197, 94);
                    doc.rect(70, currentY + 5, (s.c / s.t) * barScale, 3, 'F');
                    doc.setFillColor(239, 68, 68);
                    doc.rect(70 + (s.c / s.t) * barScale, currentY + 5, (s.w / s.t) * barScale, 3, 'F');
                    currentY += 12;
                }
            });
        }

        // --- FOOTER & STAMP ---
        const footerY = 265;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("MR. PRASAD REDDY", 20, footerY);
        doc.setFontSize(8);
        doc.text("Founder & CEO, ECLIPSE7", 20, footerY + 4);
        doc.setTextColor(100);
        doc.text("Strategic Oversight & Operational Integrity", 20, footerY + 8);
        doc.line(20, footerY + 10, 80, footerY + 10);
        
        try {
            // Using stamp.png from your repository
            doc.addImage('stamp.png', 'PNG', 150, footerY - 15, 35, 35);
        } catch (e) {
            doc.setDrawColor(200, 0, 0);
            doc.circle(165, footerY, 12, 'S');
        }

        doc.save(`${student.replace(/\s+/g, '_')}_Result.pdf`);
    } catch (err) { console.error(err); }
}

function drawBar(doc, x, y, w, color, label) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x + 50, y - 4, w, 4, 'F');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(label, x, y);
}
