<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Negative Marking Calculator | ECLIPSE7</title>
    <link rel="icon" type="image/png" href="logo.png">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
</head>
<body>

<div class="calculator-card">
    <h1>Negative Marking Calculator</h1>
    <p class="subtitle">Powered by ECLIPSE7</p>

    <div class="input-group">
        <input type="text" id="studentName" placeholder="Student Name">
        <input type="text" id="testName" placeholder="Test Name (e.g., JEE Mock 1)">
    </div>

    <div class="grid-2">
        <div class="input-group">
            <label>Total Questions</label>
            <input type="number" id="totalQs" value="75">
        </div>
        <div class="input-group">
            <label>Max Marks</label>
            <input type="number" id="maxMarks" value="300">
        </div>
    </div>

    <div class="grid-2">
        <div class="input-group">
            <label>Questions Attempted</label>
            <input type="number" id="attempted">
        </div>
        <div class="input-group">
            <label>Wrong Answers</label>
            <input type="number" id="wrong">
        </div>
    </div>

    <div class="input-group">
        <label>Negative Ratio (e.g., 4 for 1/4th)</label>
        <input type="number" id="ratio" value="4">
    </div>

    <div class="report-settings" style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <label style="color: #38bdf8; display: block; margin-bottom: 10px; font-weight: bold;">Report Analytics Type</label>
        <select id="reportType" onchange="toggleSubjectInputs()" style="width: 100%; padding: 12px; background: #0f172a; color: white; border: 1px solid #334155; border-radius: 6px;">
            <option value="overall">Overall Performance Only</option>
            <option value="subjectwise">Subject-wise Analysis (Detailed)</option>
        </select>

        <div id="subjectSection" style="display: none; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 0.8rem; margin-bottom: 12px; border-bottom: 1px solid #334155; padding-bottom: 5px;">Subject Breakdown (Total | Correct | Wrong):</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 10px;">
                <input type="number" id="phyT" placeholder="Phy Total">
                <input type="number" id="phyC" placeholder="Phy Correct">
                <input type="number" id="phyW" placeholder="Phy Wrong">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 10px;">
                <input type="number" id="chemT" placeholder="Chem Total">
                <input type="number" id="chemC" placeholder="Chem Correct">
                <input type="number" id="chemW" placeholder="Chem Wrong">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 10px;">
                <input type="number" id="mathBioT" placeholder="M/B Total">
                <input type="number" id="mathBioC" placeholder="M/B Correct">
                <input type="number" id="mathBioW" placeholder="M/B Wrong">
            </div>
        </div>
    </div>

    <button onclick="calculateScore()" class="calc-btn">Calculate Final Score</button>

    <div class="result-box">
        <p>FINAL SCORE</p>
        <h2 id="score">0.00</h2>
    </div>

    <button onclick="downloadPDF()" class="download-btn">Download Verified Report</button>
</div>

<script src="script.js"></script>
</body>
</html>
