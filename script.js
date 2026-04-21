<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Negative Marking Calculator | Eclipse7</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
</head>
<body>
    <div class="calculator-card">
        <div class="brand-header">
            <h1>Negative Marking Calculator</h1>
            <p>Powered by ECLIPSE7</p>
        </div>
        <div class="input-container">
            <input type="text" id="studentName" placeholder="Student Full Name">
            <input type="text" id="testName" placeholder="Test Name/Series">
            
            <div class="field-row">
                <div>
                    <div class="field-label">Total Questions</div>
                    <input type="number" id="totalQs" placeholder="75">
                </div>
                <div>
                    <div class="field-label">Max Marks</div>
                    <input type="number" id="maxMarks" placeholder="300">
                </div>
            </div>

            <div class="field-label">Questions Attempted</div>
            <input type="number" id="attempted" placeholder="0">
            <div class="field-label">Wrong Answers</div>
            <input type="number" id="wrong" placeholder="0">
            <div class="field-label">Negative Ratio (e.g. 4 for 1/4)</div>
            <input type="number" id="ratio" value="4">
        </div>
        <button class="btn-calc" onclick="calculateScore()">Calculate Final Score</button>
        <div class="result-box">
            <small>FINAL SCORE</small>
            <div id="score">0.00</div>
        </div>
        <button class="btn-pdf" onclick="downloadPDF()">Download Verified Report</button>
    </div>
    <script src="script.js"></script>
</body>
</html>
