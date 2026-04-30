// --- 1. UI & DROPDOWN ENGINE ---
/**
 * Ensures the custom dropdowns update hidden inputs and trigger UI changes.
 */
function initDropdown(containerId, triggerId, panelId, hiddenInputId, callback) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const panel = document.getElementById(panelId);
    const hidden = document.getElementById(hiddenInputId);
    
    if (!container || !trigger || !panel || !hidden) return;

    const options = panel.querySelectorAll('.option-item');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('show');
        container.classList.toggle('active');
    });

    options.forEach(item => {
        item.addEventListener('click', () => {
            trigger.textContent = item.textContent;
            hidden.value = item.getAttribute('data-value');
            panel.classList.remove('show');
            container.classList.remove('active');
            
            // Run the calculation immediately when ratio or mode changes
            calculateScore(); 
            if (callback) callback();
        });
    });

    // Close dropdown if clicking outside
    window.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            panel.classList.remove('show');
            container.classList.remove('active');
        }
    });
}

// Initialize the Ratio and Analytics Mode menus
initDropdown('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectInputs);
initDropdown('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', calculateScore);

function toggleSubjectInputs() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    if (section) {
        section.style.display = (type === 'subjectwise') ? 'block' : 'none';
    }
}

// --- 2. THE MATHEMATICAL ENGINE ---
/**
 * Calculates scores based on the dynamic ratio and user inputs.
 */
function calculateScore() {
    const totalQs = parseFloat(document.getElementById('totalQs').value) || 0;
    const maxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
    const attempted = parseFloat(document.getElementById('attempted').value) || 0;
    const wrong = parseFloat(document.getElementById('wrong').value) || 0;
    const ratio = parseFloat(document.getElementById('markingRatio').value) || 0;
    
    if (totalQs === 0) {
        document.getElementById('score').innerText = "0.00";
        return { totalQs: 0, finalScore: 0 };
    }

    const correct = Math.max(0, attempted - wrong);
    const unattempted = Math.max(0, totalQs - attempted);
    
    // Core Logic: Penalty is a fraction of the Marks Per Question
    const marksPerQ = maxMarks / totalQs;
    const penaltyPerQ = marksPerQ * ratio;
    const totalPenalty = wrong * penaltyPerQ; 
    
    const finalScore = (correct * marksPerQ) - totalPenalty;
    const efficiency = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(2) : 0;

    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.innerText = finalScore.toFixed(2);
    }
    
    return { 
        totalQs, maxMarks, attempted, wrong, correct, 
        unattempted, finalScore, efficiency, totalPenalty, marksPerQ, ratio 
    };
}

// --- 3. THE E7 INTELLIGENCE EXPORTER ---
/**
 * Generates the PDF using jsPDF and AutoTable.
 */
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert("Library Error: Ensure jsPDF scripts are in your HTML <head>.");
        return;
    }

    const doc = new jsPDF();
    const data = calculateScore(); // Get latest data
    const student = (document.getElementById('studentName').value || "CANDIDATE").toUpperCase();
    const test = (document.getElementById('testName').value || "ASSESSMENT").toUpperCase();
    const reportType = document.getElementById('reportType').value;

    // --- Header Design ---
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("STRATEGIC PERFORMANCE E7 REPORT", 105, 22, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(0, 242, 255);
    doc.text("OFFICIAL REPORT | POWERED BY ECLIPSE7 AI | FOUNDER: SAIPRASAD BARURE", 105, 32, { align: "center" });

    // --- Performance Table ---
    doc.autoTable({
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
        body: [
            ['STUDENT IDENTITY', student],
            ['ASSESSMENT TAG', test],
            ['VERIFIED CORRECT', data.correct],
            ['IDENTIFIED ERRORS', data.wrong],
            ['FINAL AGGREGATE', data.finalScore.toFixed(2)],
            ['ACCURACY EFFICIENCY', `${data.efficiency}%`]
        ],
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // --- Subject Breakdown (Conditional) ---
    if (reportType === 'subjectwise') {
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text("SUBJECT-LEVEL ANALYTICS", 20, currentY);
        currentY += 10;

        const subjects = [
            { id: 'phy', name: 'PHYSICS' },
            { id: 'chem', name: 'CHEMISTRY' },
            { id: 'mathBio', name: 'MATH/BIO' }
        ];

        subjects.forEach(sub => {
            const t = parseInt(document.getElementById(`${sub.id}A`).value) || 0;
            const c = parseInt(document.getElementById(`${sub.id}C`).value) || 0;
            const w = parseInt(document.getElementById(`${sub.id}W`).value) || 0;

            if (t > 0) {
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`${sub.name}: ${c} Correct, ${w} Wrong out of ${t}`, 20, currentY);
                currentY += 7;
            }
        });
    }

    // --- Signature & Stamp ---
    const footerY = 260;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text("MR. PRASAD REDDY", 20, footerY);
    doc.setFontSize(8);
    doc.text("Founder & CEO, ECLIPSE7", 20, footerY + 5);

    // Handling the stamp image
    const stampUrl = "https://eclipse7-pixal.github.io/marking-calculator/stamp.png";
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = stampUrl;

    img.onload = () => {
        doc.addImage(img, 'PNG', 150, 240, 40, 40);
        doc.save(`${student}_E7_Analytics.pdf`);
    };
    img.onerror = () => {
        doc.save(`${student}_E7_Analytics.pdf`); // Save even if stamp fails
    };
}
