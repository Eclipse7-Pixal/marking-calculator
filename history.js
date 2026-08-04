// ============================================================================
// ECLIPSE7 ENGINE - BROWSER STORAGE & HISTORY MANAGEMENT MODULE
// ============================================================================

const E7_HISTORY_KEY = 'e7_assessment_history';

/**
 * Save assessment record to browser localStorage
 */
function saveAssessmentToHistory(record) {
    if (!record || !record.studentName || !record.testName) return;

    let history = getAssessmentHistory();
    
    // Add unique ID and timestamp
    const historyItem = {
        id: 'E7-' + Date.now(),
        date: new Date().toLocaleString(),
        studentName: record.studentName,
        testName: record.testName,
        examProfile: record.examProfile,
        score: record.finalScore.toFixed(2),
        maxMarks: record.maxMarks,
        accuracy: record.efficiency,
        correct: record.correct,
        wrong: record.wrong,
        totalQs: record.totalQs
    };

    history.unshift(historyItem); // Add newest first
    
    // Limit history to 50 items to optimize browser memory
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(history));
    renderHistoryUI();
}

/**
 * Retrieve saved assessment array
 */
function getAssessmentHistory() {
    const rawData = localStorage.getItem(E7_HISTORY_KEY);
    try {
        return rawData ? JSON.parse(rawData) : [];
    } catch (e) {
        console.error("Failed to parse history data", e);
        return [];
    }
}

/**
 * Clear all stored assessment history
 */
function clearAssessmentHistory() {
    if (confirm("Are you sure you want to clear all assessment history?")) {
        localStorage.removeItem(E7_HISTORY_KEY);
        renderHistoryUI();
        if (typeof triggerSystemToastNotification === 'function') {
            triggerSystemToastNotification("History successfully cleared.", false);
        }
    }
}

/**
 * Render history panel dynamically inside the main container or modal
 */
function renderHistoryUI() {
    let historyContainer = document.getElementById('historyContainer');
    
    // Auto-inject history DOM container if not already present
    if (!historyContainer) {
        const appContainer = document.getElementById('mainAppContainer');
        if (!appContainer) return;

        historyContainer = document.createElement('div');
        historyContainer.id = 'historyContainer';
        historyContainer.className = 'history-panel-wrapper';
        appContainer.appendChild(historyContainer);
    }

    const history = getAssessmentHistory();

    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-header">
                <h3><i class="fa-solid fa-clock-rotate-left"></i> Assessment History</h3>
            </div>
            <div class="history-empty">No saved calculations yet.</div>
        `;
        return;
    }

    let itemsHTML = history.map(item => `
        <div class="history-card">
            <div class="history-card-header">
                <span class="history-student">${escapeHtml(item.studentName)}</span>
                <span class="history-score">${item.score} / ${item.maxMarks}</span>
            </div>
            <div class="history-card-sub">
                <span>${escapeHtml(item.testName)} (${item.examProfile.toUpperCase()})</span>
                <span class="history-date">${item.date}</span>
            </div>
            <div class="history-card-stats">
                <span>Acc: ${item.accuracy}%</span>
                <span>Correct: ${item.correct}</span>
                <span>Wrong: ${item.wrong}</span>
            </div>
        </div>
    `).join('');

    historyContainer.innerHTML = `
        <div class="history-header">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Assessment History (${history.length})</h3>
            <button class="history-clear-btn" onclick="clearAssessmentHistory()">Clear All</button>
        </div>
        <div class="history-list">
            ${itemsHTML}
        </div>
    `;
}

/**
 * Helper to prevent XSS in rendered history text
 */
function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Initialize history display on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    renderHistoryUI();
});
