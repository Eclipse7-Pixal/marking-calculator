/* global Chart, html2canvas */
// ============================================================================
// ECLIPSE7 ARCHITECTURAL CORE ENGINE v9.0  (+ UI EXPERIENCE LAYER at end of file)
// ============================================================================

const EXAM_PROFILES = {
    jeemain: {
        label: "JEE MAIN PRESET",
        totalQs: 75,
        maxMarks: 300,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4 (-25%)",
        subjects: {
            phy: { qs: 25, maxMarks: 100 },
            chem: { qs: 25, maxMarks: 100 },
            mathBio: { qs: 25, maxMarks: 100 }
        },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Main preset active [25 Q / 100 Marks per Domain]. Matrix +4 / -1."
    },
    jeeadv: {
        label: "JEE ADVANCED CONFIGURABLE",
        totalQs: 54,
        maxMarks: 180,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4 (-25%)",
        subjects: {
            phy: { qs: 18, maxMarks: 60 },
            chem: { qs: 18, maxMarks: 60 },
            mathBio: { qs: 18, maxMarks: 60 }
        },
        labelMathBio: "MATHEMATICS",
        intel: "Curriculum: JEE Advanced layout generated. Standard pattern 18 Q / 60 Marks per domain."
    },
    neet: {
        label: "NEET UG PRESET",
        totalQs: 180,
        maxMarks: 720,
        ratio: "0.25",
        labelRatio: "Ratio: 1/4 (-25%)",
        subjects: {
            phy: { qs: 45, maxMarks: 180 },
            chem: { qs: 45, maxMarks: 180 },
            mathBio: { qs: 90, maxMarks: 360 }
        },
        labelMathBio: "BIOLOGY",
        intel: "Curriculum: NEET UG preset active [Phy: 180, Chem: 180, Bio: 360]. Matrix +4 / -1."
    },
    custom: {
        label: "CUSTOM MODE (MANUAL OVERRIDE)",
        intel: "Manual Override active. Enter parameters freely across form inputs."
    }
};

const E7_HISTORY_KEY = 'e7_assessment_history_v3';

// Global Instances & Active States
let breakdownChartInstance = null;
let subjectChartInstance = null;
let activeCanonicalResult = null;

let subjectScores = {
    phy: { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxMarks: 100 },
    chem: { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxMarks: 100 },
    mathBio: { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxMarks: 100 }
};

// ============================================================================
// AMBIENT FIELD ENGINE (replaces Cosmic Bubble canvas)
// Dark: twinkling star-dust with gentle pointer parallax.
// Light: soft floating light motes. Pauses when the tab is hidden.
// ============================================================================
class AmbientFieldEngine {
    constructor() {
        this.canvas = document.getElementById('cosmicBubbleCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        this.raf = null;
        this.theme = document.documentElement.getAttribute('data-theme') || 'dark';
        this.sprites = [this.makeSprite('125,195,255'), this.makeSprite('255,196,120')];
        this.resize();
        this.seed();
        this.bindEvents();
        this.start();
    }

    makeSprite(rgb) {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, `rgba(${rgb},0.9)`);
        grad.addColorStop(0.4, `rgba(${rgb},0.35)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        return c;
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = Math.round(this.w * dpr);
        this.canvas.height = Math.round(this.h * dpr);
        this.canvas.style.width = this.w + 'px';
        this.canvas.style.height = this.h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    seed() {
        const area = this.w * this.h;
        const starCount = Math.min(170, Math.round(area / 8500));
        this.stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            r: Math.random() * 1.1 + 0.25,
            z: Math.random() * 0.9 + 0.1,
            tw: Math.random() * Math.PI * 2,
            sp: 0.5 + Math.random() * 1.5,
            violet: Math.random() < 0.18
        }));
        const moteCount = Math.min(24, Math.round(area / 60000) + 8);
        this.motes = Array.from({ length: moteCount }, () => ({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            r: 20 + Math.random() * 70,
            z: Math.random() * 0.8 + 0.2,
            vy: -(0.06 + Math.random() * 0.16),
            ph: Math.random() * Math.PI * 2,
            a: 0.18 + Math.random() * 0.3,
            c: Math.random() < 0.55 ? 0 : 1
        }));
    }

    bindEvents() {
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { this.resize(); this.seed(); if (this.reduced) this.draw(0); }, 150);
        });
        window.addEventListener('pointermove', (e) => {
            this.pointer.tx = e.clientX / this.w - 0.5;
            this.pointer.ty = e.clientY / this.h - 0.5;
        }, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.stop(); else this.start();
        });
        new MutationObserver(() => {
            this.theme = document.documentElement.getAttribute('data-theme') || 'dark';
            if (this.reduced) this.draw(0);
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    start() {
        if (this.reduced) { this.draw(0); return; }
        if (this.raf) return;
        const loop = (t) => { this.draw(t); this.raf = requestAnimationFrame(loop); };
        this.raf = requestAnimationFrame(loop);
    }

    stop() {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = null;
    }

    draw(t) {
        const ctx = this.ctx;
        const p = this.pointer;
        p.x += (p.tx - p.x) * 0.04;
        p.y += (p.ty - p.y) * 0.04;
        ctx.clearRect(0, 0, this.w, this.h);
        if (this.theme === 'light') this.drawMotes(t); else this.drawStars(t);
        ctx.globalAlpha = 1;
    }

    drawStars(t) {
        const ctx = this.ctx;
        for (const s of this.stars) {
            if (!this.reduced) s.x -= 0.015 * s.z;
            if (s.x < -4) s.x = this.w + 4;
            const px = s.x + this.pointer.x * 36 * s.z;
            const py = s.y + this.pointer.y * 36 * s.z;
            const tw = 0.5 + 0.5 * Math.sin(s.tw + t * 0.0012 * s.sp);
            ctx.globalAlpha = (0.25 + 0.75 * tw) * (0.35 + s.z * 0.65);
            ctx.fillStyle = s.violet ? '#c4b5fd' : '#e6f6ff';
            if (s.r > 0.95) {
                ctx.beginPath();
                ctx.arc(px, py, s.r, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(px, py, s.r * 1.6, s.r * 1.6);
            }
        }
    }

    drawMotes(t) {
        const ctx = this.ctx;
        for (const m of this.motes) {
            if (!this.reduced) {
                m.y += m.vy;
                m.x += Math.sin(t * 0.0003 + m.ph) * 0.12;
            }
            if (m.y < -m.r * 2) { m.y = this.h + m.r; m.x = Math.random() * this.w; }
            const px = m.x + this.pointer.x * 50 * m.z;
            const py = m.y + this.pointer.y * 50 * m.z;
            ctx.globalAlpha = m.a * (0.75 + 0.25 * Math.sin(t * 0.0008 + m.ph));
            ctx.drawImage(this.sprites[m.c], px - m.r, py - m.r, m.r * 2, m.r * 2);
        }
    }
}

// ============================================================================
// SECURITY & SANITIZATION UTILITIES
// ============================================================================
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function generateUniqueID() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `E7-${dateStr}-${timeStr}-${rand}`;
}

// ============================================================================
// DROPDOWNS, THEMES & NAVIGATION SYSTEM
// ============================================================================
function handleProfileTap() {
    if (window.getCurrentUser && window.getCurrentUser()) {
        if (confirm("Sign out of your ECLIPSE7 Cloud account?")) {
            window.logout();
        }
    } else {
        if (window.loginWithGoogle) {
            window.loginWithGoogle();
        }
    }
}

function closeTooltip(e) {
    if (e) e.stopPropagation();
    const tooltip = document.getElementById('signin-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
}

function toggleThemeMode() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('e7_theme_preference', newTheme);

    if (themeIcon) {
        if (newTheme === 'light') {
            themeIcon.className = 'fa-solid fa-moon';
        } else {
            themeIcon.className = 'fa-solid fa-sun';
        }
    }

    if (activeCanonicalResult) {
        renderCurrentDashboardCharts(activeCanonicalResult);
    }
}

function applySavedTheme() {
    const saved = localStorage.getItem('e7_theme_preference') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', saved);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = saved === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
}

function initDropdownSystem(containerId, triggerId, panelId, hiddenInputId, callback) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const panel = document.getElementById(panelId);
    const hidden = document.getElementById(hiddenInputId);
    if (!container || !trigger || !panel) return;

    const options = panel.querySelectorAll('.select-box-option');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.select-box-dropdown').forEach(p => {
            if (p !== panel) p.classList.remove('show');
        });
        document.querySelectorAll('.custom-select-box').forEach(c => {
            if (c !== container) c.classList.remove('active');
        });
        panel.classList.toggle('show');
        container.classList.toggle('active');
    });

    options.forEach(item => {
        item.addEventListener('click', () => {
            const chosenVal = item.getAttribute('data-value');
            hidden.value = chosenVal;
            trigger.textContent = item.textContent;

            panel.classList.remove('show');
            container.classList.remove('active');
            if (callback) callback(chosenVal);
        });
    });

    window.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            panel.classList.remove('show');
            container.classList.remove('active');
        }
    });
}

// ============================================================================
// EVENT BINDINGS & SYSTEM INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    new AmbientFieldEngine();
    applySavedTheme();

    initDropdownSystem('customSelect', 'selectedLabel', 'selectOptions', 'reportType', toggleSubjectSectionDisplay);
    initDropdownSystem('ratioSelectContainer', 'ratioLabel', 'ratioOptions', 'markingRatio', () => { 
        setProfileToCustomOverride(); 
        recalculateSubjectScores();
    });
    initDropdownSystem('examProfileSelectContainer', 'examProfileLabel', 'examProfileOptions', 'examProfile', applySelectedExamProfile);
    
    setupReactiveSubjectSyncObservers();
    setupMainFallbackInputObservers();
    setupEventListeners();
    setupSimulatorObservers();
    
    toggleSubjectSectionDisplay();
    renderHistoryVault();
});

function setupEventListeners() {
    document.getElementById('auth-container')?.addEventListener('click', handleProfileTap);
    document.getElementById('closeTooltipBtn')?.addEventListener('click', closeTooltip);
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleThemeWithReveal);
    document.getElementById('btnCalculate')?.addEventListener('click', executeCalculationSequence);

    // Export Action Handlers
    document.getElementById('btnExportPDF')?.addEventListener('click', downloadPDFReportSequence);
    document.getElementById('btnExportPNG')?.addEventListener('click', exportCurrentPNG);
    document.getElementById('btnExportJSON')?.addEventListener('click', exportCurrentJSON);
    document.getElementById('btnShareResult')?.addEventListener('click', triggerShareMenu);

    // History Vault & Drawer Controls
    document.getElementById('menu-toggle-btn')?.addEventListener('click', () => toggleHistoryDrawer(true));
    document.getElementById('closeHistoryBtn')?.addEventListener('click', () => toggleHistoryDrawer(false));
    document.getElementById('drawerOverlay')?.addEventListener('click', () => toggleHistoryDrawer(false));
    
    document.getElementById('historySearchInput')?.addEventListener('input', filterHistoryList);
    document.getElementById('btnGenerateFullReport')?.addEventListener('click', generateAndShowFullHistoryReport);
    document.getElementById('btnHistoryPDF')?.addEventListener('click', downloadCompleteHistoryPDF);
    document.getElementById('btnHistoryJSON')?.addEventListener('click', exportHistoryJSON);
    document.getElementById('btnHistoryCSV')?.addEventListener('click', exportHistoryCSV);
    document.getElementById('btnHistoryCompare')?.addEventListener('click', openCompareModalLauncher);
    document.getElementById('btnClearHistory')?.addEventListener('click', clearAssessmentHistory);

    // Modals
    document.getElementById('closeCompareBtn')?.addEventListener('click', () => toggleCompareModal(false));
    document.getElementById('compareModalOverlay')?.addEventListener('click', () => toggleCompareModal(false));
    document.getElementById('closeFullReportBtn')?.addEventListener('click', () => toggleFullReportModal(false));
    document.getElementById('fullReportOverlay')?.addEventListener('click', () => toggleFullReportModal(false));

    // Comparison Selectors
    document.getElementById('compareSelect1')?.addEventListener('change', renderComparisonView);
    document.getElementById('compareSelect2')?.addEventListener('change', renderComparisonView);
}

function toggleSubjectSectionDisplay() {
    const type = document.getElementById('reportType').value;
    const section = document.getElementById('subjectSection');
    const subjCard = document.getElementById('subjectChartCard');
    if (!section) return;

    if (type === 'subjectwise') {
        section.classList.add('visible');
        if (subjCard) subjCard.classList.remove('hidden');
        syncSubjectBreakdownToMainInputs();
    } else {
        section.classList.remove('visible');
        if (subjCard) subjCard.classList.add('hidden');
    }
}

// ============================================================================
// CURRICULUM PROFILES & INPUT ALGEBRA
// ============================================================================
function applySelectedExamProfile(profileKey) {
    const profile = EXAM_PROFILES[profileKey];
    if (!profile) return;

    const intelBox = document.getElementById('intelMessage');
    if (intelBox) intelBox.textContent = profile.intel;

    const totalQsInput = document.getElementById('totalQs');

    if (profileKey === 'custom') {
        if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');
        return;
    }

    if (totalQsInput) totalQsInput.classList.add('profile-locked-row');

    document.getElementById('totalQs').value = profile.totalQs;
    document.getElementById('maxMarks').value = profile.maxMarks;
    document.getElementById('markingRatio').value = profile.ratio;
    document.getElementById('ratioLabel').textContent = profile.labelRatio;

    const mbLabel = document.getElementById('mathBioLabel');
    if (mbLabel && profile.labelMathBio) {
        mbLabel.innerHTML = profile.labelMathBio === 'BIOLOGY' ? 
            `<i class="fa-solid fa-dna"></i> BIOLOGY` : 
            `<i class="fa-solid fa-calculator"></i> MATHEMATICS`;
    }

    document.getElementById('phyA').value = profile.subjects.phy.qs;
    document.getElementById('chemA').value = profile.subjects.chem.qs;
    document.getElementById('mathBioA').value = profile.subjects.mathBio.qs;

    subjectScores.phy.maxMarks = profile.subjects.phy.maxMarks;
    subjectScores.chem.maxMarks = profile.subjects.chem.maxMarks;
    subjectScores.mathBio.maxMarks = profile.subjects.mathBio.maxMarks;

    clearImplicitTransientResiduals();
    clearInputValidationStyles();
    
    ['phy', 'chem', 'mathBio'].forEach(sub => executeRowAlgebraSolver(sub));
    recalculateSubjectScores();
    syncSubjectBreakdownToMainInputs();
}

function setProfileToCustomOverride() {
    const hiddenProf = document.getElementById('examProfile');
    const triggerProf = document.getElementById('examProfileLabel');
    const totalQsInput = document.getElementById('totalQs');

    if (totalQsInput) totalQsInput.classList.remove('profile-locked-row');

    if (hiddenProf && hiddenProf.value !== 'custom') {
        hiddenProf.value = 'custom';
        if (triggerProf) triggerProf.textContent = EXAM_PROFILES.custom.label;
        const intelBox = document.getElementById('intelMessage');
        if (intelBox) intelBox.textContent = EXAM_PROFILES.custom.intel;
    }
}

function clearImplicitTransientResiduals() {
    ['phy', 'chem', 'mathBio'].forEach(sub => {
        document.getElementById(`${sub}C`).value = '';
        document.getElementById(`${sub}W`).value = '';
        document.getElementById(`${sub}N`).value = '';
    });
    document.getElementById('attempted').value = '';
    document.getElementById('wrong').value = '';
}

function setupReactiveSubjectSyncObservers() {
    const subPanel = document.getElementById('subjectSection');
    if (!subPanel) return;

    subPanel.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            processSubjectRowRecalculationSequence(e.target);
        }
    });
}

function processSubjectRowRecalculationSequence(targetNode) {
    const row = targetNode.closest('.subject-grid-row');
    if (row) {
        const subjectKey = row.getAttribute('data-subject');
        executeRowAlgebraSolver(subjectKey, targetNode);
    }
    recalculateSubjectScores();
    syncSubjectBreakdownToMainInputs();
}

function executeRowAlgebraSolver(sub, activeElement = null) {
    const elTot = document.getElementById(`${sub}A`);
    const elCor = document.getElementById(`${sub}C`);
    const elWro = document.getElementById(`${sub}W`);
    const elNot = document.getElementById(`${sub}N`);

    const tot = elTot.value !== "" ? parseFloat(elTot.value) : null;
    const cor = elCor.value !== "" ? parseFloat(elCor.value) : null;
    const wro = elWro.value !== "" ? parseFloat(elWro.value) : null;
    const not = elNot.value !== "" ? parseFloat(elNot.value) : null;

    if (tot === null) return; 

    let filledFields = [];
    if (cor !== null) filledFields.push({ id: 'C', val: cor, el: elCor });
    if (wro !== null) filledFields.push({ id: 'W', val: wro, el: elWro });
    if (not !== null) filledFields.push({ id: 'N', val: not, el: elNot });

    if (filledFields.length === 3) {
        if (activeElement === elNot) {
            let updatedCor = Math.max(0, tot - not - wro);
            elCor.value = updatedCor === 0 && not === 0 && wro === 0 ? "" : updatedCor;
        } else if (activeElement === elWro) {
            let updatedCor = Math.max(0, tot - wro - not);
            elCor.value = updatedCor === 0 && wro === 0 && not === 0 ? "" : updatedCor;
        } else {
            let updatedNot = Math.max(0, tot - cor - wro);
            elNot.value = updatedNot === 0 && cor === 0 && wro === 0 ? "" : updatedNot;
        }
        return;
    }

    if (filledFields.length === 2) {
        const structuralMask = filledFields.map(f => f.id).join('');
        if (structuralMask === 'CW') elNot.value = Math.max(0, tot - cor - wro);
        else if (structuralMask === 'WN') elCor.value = Math.max(0, tot - wro - not);
        else if (structuralMask === 'CN') elWro.value = Math.max(0, tot - cor - not);
    }
}

function recalculateSubjectScores() {
    const ratio = parseFloat(document.getElementById('markingRatio').value) || 0.25;
    const subjects = ['phy', 'chem', 'mathBio'];

    subjects.forEach(sub => {
        const total = parseFloat(document.getElementById(`${sub}A`).value) || 0;
        const correct = parseFloat(document.getElementById(`${sub}C`).value) || 0;
        const wrong = parseFloat(document.getElementById(`${sub}W`).value) || 0;
        const skipped = parseFloat(document.getElementById(`${sub}N`).value) || 0;

        let maxMarks = subjectScores[sub].maxMarks;
        if (document.getElementById('examProfile').value === 'custom') {
            const globalTotalQs = parseFloat(document.getElementById('totalQs').value) || 1;
            const globalMaxMarks = parseFloat(document.getElementById('maxMarks').value) || 0;
            maxMarks = total > 0 ? (total / globalTotalQs) * globalMaxMarks : 100;
        }

        const marksPerQ = total > 0 ? maxMarks / total : 4; 
        const score = (correct * marksPerQ) - (wrong * marksPerQ * ratio);

        subjectScores[sub] = { correct, wrong, skipped, total, score, maxMarks };

        const chip = document.getElementById(`${sub}ScoreChip`);
        if (chip) {
            chip.textContent = `Score: ${score.toFixed(2)} / ${maxMarks.toFixed(0)}`;
        }
    });
}

function setupMainFallbackInputObservers() {
    ['studentName', 'testName', 'totalQs', 'maxMarks', 'attempted', 'wrong'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (id !== 'studentName' && id !== 'testName' && id !== 'totalQs') {
                    setProfileToCustomOverride();
                }
                el.classList.remove('validation-error');
            });
        }
    });
}

function syncSubjectBreakdownToMainInputs() {
    const reportType = document.getElementById('reportType').value;
    if (reportType !== 'subjectwise') return;

    let aggregateTotal = 0;
    let aggregateCorrect = 0;
    let aggregateWrong = 0;

    ['phy', 'chem', 'mathBio'].forEach(sub => {
        const t = parseFloat(document.getElementById(`${sub}A`).value) || 0;
        const c = parseFloat(document.getElementById(`${sub}C`).value) || 0;
        const w = parseFloat(document.getElementById(`${sub}W`).value) || 0;

        aggregateTotal += t;
        aggregateCorrect += c;
        aggregateWrong += w;
    });

    const totalQsInput = document.getElementById('totalQs');
    if (aggregateTotal > 0 && totalQsInput) totalQsInput.value = aggregateTotal;
    
    let computedAttempts = aggregateCorrect + aggregateWrong;
    document.getElementById('attempted').value = computedAttempts > 0 || aggregateWrong > 0 ? computedAttempts : '';
    document.getElementById('wrong').value = aggregateWrong > 0 ? aggregateWrong : '';
}

// ============================================================================
// VALIDATION ENGINE
// ============================================================================
function triggerSystemToastNotification(message, isError = true) {
    const toast = document.getElementById('systemNotification');
    const msgSpan = document.getElementById('notificationMessage');
    const icon = document.getElementById('toastIcon');
    if (!toast || !msgSpan) return;

    msgSpan.textContent = message;
    if (isError) {
        toast.style.background = "rgba(244, 63, 94, 0.25)";
        toast.style.borderColor = "rgba(244, 63, 94, 0.4)";
        toast.style.color = "#fecdd3";
        if (icon) icon.className = "fa-solid fa-triangle-exclamation text-rose";
    } else {
        toast.style.background = "rgba(16, 185, 129, 0.25)";
        toast.style.borderColor = "rgba(16, 185, 129, 0.4)";
        toast.style.color = "#a7f3d0";
        if (icon) icon.className = "fa-solid fa-circle-check text-emerald";
    }

    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

function clearInputValidationStyles() {
    document.querySelectorAll('input').forEach(input => input.classList.remove('validation-error'));
}

function validateInput() {
    clearInputValidationStyles();
    let invalidNodes = [];

    const studentName = document.getElementById('studentName');
    const testName = document.getElementById('testName');
    
    if (!studentName.value.trim()) invalidNodes.push(studentName);
    if (!testName.value.trim()) invalidNodes.push(testName);

    const totalQs = document.getElementById('totalQs');
    const maxMarks = document.getElementById('maxMarks');
    const attempted = document.getElementById('attempted');
    const wrong = document.getElementById('wrong');

    const tVal = parseFloat(totalQs.value);
    const mVal = parseFloat(maxMarks.value);
    const aVal = parseFloat(attempted.value);
    const wVal = parseFloat(wrong.value);

    if (!totalQs.value || tVal <= 0) invalidNodes.push(totalQs);
    if (!maxMarks.value || mVal <= 0) invalidNodes.push(maxMarks);
    if (attempted.value === "" || aVal < 0) invalidNodes.push(attempted);
    if (wrong.value === "" || wVal < 0) invalidNodes.push(wrong);

    if (invalidNodes.length === 0) {
        if (wVal > aVal) {
            invalidNodes.push(wrong, attempted);
            triggerSystemToastNotification("Validation Error: Incorrect attempts cannot exceed total attempts.");
            return false;
        }
        if (aVal > tVal) {
            invalidNodes.push(attempted, totalQs);
            triggerSystemToastNotification("Validation Error: Total attempts cannot exceed total questions.");
            return false;
        }
    }

    if (document.getElementById('reportType').value === 'subjectwise') {
        let subSumQs = 0;
        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const tot = parseFloat(document.getElementById(`${sub}A`).value) || 0;
            const cor = parseFloat(document.getElementById(`${sub}C`).value) || 0;
            const wro = parseFloat(document.getElementById(`${sub}W`).value) || 0;
            const skp = parseFloat(document.getElementById(`${sub}N`).value) || 0;
            subSumQs += tot;
            if (cor + wro + skp !== tot) {
                invalidNodes.push(document.getElementById(`${sub}A`));
                triggerSystemToastNotification(`Subject Matrix Mismatch: ${sub.toUpperCase()} sum (C+W+Skipped) must equal total.`);
            }
        });
        if (subSumQs !== tVal) {
            invalidNodes.push(totalQs);
            triggerSystemToastNotification("Subject Matrix Mismatch: Sum of subject totals does not match overall total.");
            return false;
        }
    }

    if (invalidNodes.length > 0) {
        invalidNodes.forEach(node => node.classList.add('validation-error'));
        triggerSystemToastNotification("Action Blocked: Complete required fields highlighted.");
        return false;
    }

    return true;
}

// ============================================================================
// CANONICAL CALCULATION ENGINE
// ============================================================================
function collectInput() {
    return {
        studentName: document.getElementById('studentName').value.trim(),
        testName: document.getElementById('testName').value.trim(),
        examProfile: document.getElementById('examProfile').value,
        totalQs: parseFloat(document.getElementById('totalQs').value) || 0,
        maxMarks: parseFloat(document.getElementById('maxMarks').value) || 0,
        attempted: parseFloat(document.getElementById('attempted').value) || 0,
        wrong: parseFloat(document.getElementById('wrong').value) || 0,
        markingRatio: parseFloat(document.getElementById('markingRatio').value) || 0.25,
        reportType: document.getElementById('reportType').value,
        subjectScores: JSON.parse(JSON.stringify(subjectScores))
    };
}

function calculateScore(inputData) {
    const correct = inputData.attempted - inputData.wrong;
    const skipped = Math.max(0, inputData.totalQs - inputData.attempted);
    const marksPerCorrect = inputData.totalQs > 0 ? (inputData.maxMarks / inputData.totalQs) : 0;
    const penaltyMarks = inputData.wrong * (marksPerCorrect * inputData.markingRatio); 
    const finalScore = (correct * marksPerCorrect) - penaltyMarks;
    
    const efficiency = inputData.maxMarks > 0 ? ((finalScore / inputData.maxMarks) * 100) : 0;
    const accuracy = inputData.attempted > 0 ? ((correct / inputData.attempted) * 100) : 0;
    const attemptRate = inputData.totalQs > 0 ? ((inputData.attempted / inputData.totalQs) * 100) : 0;

    return {
        correct,
        skipped,
        marksPerCorrect,
        penaltyMarks,
        finalScore,
        efficiency,
        accuracy,
        attemptRate
    };
}

function calculateAnalytics(inputData, scoreResult) {
    let performanceLevel = "Developing";
    let color = "#3b82f6";
    const pct = scoreResult.efficiency;

    if (pct >= 90) { performanceLevel = "Exceptional"; color = "#10b981"; }
    else if (pct >= 80) { performanceLevel = "Excellent"; color = "#00d2ff"; }
    else if (pct >= 70) { performanceLevel = "Strong"; color = "#2563eb"; }
    else if (pct >= 60) { performanceLevel = "Good"; color = "#3b82f6"; }
    else if (pct >= 50) { performanceLevel = "Developing"; color = "#8b5cf6"; }
    else { performanceLevel = "Needs Review"; color = "#f43f5e"; }

    let wrongRatio = inputData.attempted > 0 ? (inputData.wrong / inputData.attempted) : 0;
    let riskIndex = "Low Risk";
    if (wrongRatio > 0.4) riskIndex = "High Volatility";
    else if (wrongRatio > 0.2) riskIndex = "Moderate Risk";

    let recommendations = [];
    if (scoreResult.accuracy < 75) recommendations.push("Reduce speculative attempts to limit penalty drag on total score.");
    if (scoreResult.skipped > inputData.totalQs * 0.3) recommendations.push("Optimize question selection strategy to address unanswered items.");
    if (recommendations.length === 0) recommendations.push("Maintain balanced time management and current selection precision.");

    return {
        performanceLevel,
        color,
        riskIndex,
        recommendations
    };
}

function predictRankAndPercentile(inputData, scoreResult) {
    let scorePct = Math.max(0, Math.min(100, (scoreResult.finalScore / inputData.maxMarks) * 100));
    let percentileMin = 0, percentileMax = 0;
    let rankMin = 0, rankMax = 0;

    if (inputData.examProfile === 'jeemain') {
        percentileMin = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 2) * 100);
        percentileMax = Math.min(99.99, percentileMin + 0.5);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 12000));
        rankMax = Math.round((100 - percentileMin) * 12000);
    } else if (inputData.examProfile === 'jeeadv') {
        percentileMin = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 1.8) * 100);
        percentileMax = Math.min(99.99, percentileMin + 0.6);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 2500));
        rankMax = Math.round((100 - percentileMin) * 2500);
    } else if (inputData.examProfile === 'neet') {
        percentileMin = Math.max(0, 100 - Math.pow((100 - scorePct) / 100, 2.2) * 100);
        percentileMax = Math.min(99.99, percentileMin + 0.4);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 20000));
        rankMax = Math.round((100 - percentileMin) * 20000);
    } else {
        percentileMin = scorePct;
        percentileMax = Math.min(100, scorePct + 1.0);
        rankMin = Math.max(1, Math.round((100 - percentileMax) * 1000));
        rankMax = Math.round((100 - percentileMin) * 1000);
    }

    return {
        percentileRange: `${percentileMin.toFixed(1)}% - ${percentileMax.toFixed(1)}%`,
        rankRange: `${rankMin.toLocaleString()} - ${rankMax.toLocaleString()}`,
        confidence: "High (Statistical Normalized Model)",
        methodology: "ECLIPSE7 Score Distribution Matrix"
    };
}

function buildAssessmentResult(existingID = null) {
    const rawInput = collectInput();
    const scoreRes = calculateScore(rawInput);
    const analyticsRes = calculateAnalytics(rawInput, scoreRes);
    const predRes = predictRankAndPercentile(rawInput, scoreRes);

    return {
        id: existingID || generateUniqueID(),
        schemaVersion: "9.0",
        createdAt: Date.now(),
        timestamp: new Date().toLocaleString(),

        student: { name: rawInput.studentName },
        assessment: { testName: rawInput.testName, examProfile: rawInput.examProfile },
        
        scoring: {
            totalQuestions: rawInput.totalQs,
            attempted: rawInput.attempted,
            correct: scoreRes.correct,
            wrong: rawInput.wrong,
            skipped: scoreRes.skipped,
            maxMarks: rawInput.maxMarks,
            marksPerCorrect: scoreRes.marksPerCorrect,
            negativeMarkingRatio: rawInput.markingRatio
        },

        subjects: {
            enabled: rawInput.reportType === 'subjectwise',
            data: rawInput.subjectScores
        },

        result: {
            finalScore: scoreRes.finalScore,
            scorePercentage: scoreRes.efficiency.toFixed(2),
            accuracy: scoreRes.accuracy.toFixed(2),
            attemptRate: scoreRes.attemptRate.toFixed(2),
            penaltyMarks: scoreRes.penaltyMarks
        },

        analytics: analyticsRes,
        prediction: predRes
    };
}

function renderResult(canonicalObj) {
    activeCanonicalResult = canonicalObj;

    animateNumberCounter('score', canonicalObj.result.finalScore, 2);
    document.getElementById('heroMaxSub').textContent = `/ ${canonicalObj.scoring.maxMarks} Marks`;

    const gradeEl = document.getElementById('dashGrade');
    if (gradeEl) {
        gradeEl.innerText = canonicalObj.analytics.performanceLevel;
        gradeEl.style.backgroundColor = canonicalObj.analytics.color + "22";
        gradeEl.style.color = canonicalObj.analytics.color;
        gradeEl.style.border = `1px solid ${canonicalObj.analytics.color}55`;
    }

    animateNumberCounter('dashAccuracy', parseFloat(canonicalObj.result.accuracy), 1, '', '%');
    animateNumberCounter('dashEfficiency', parseFloat(canonicalObj.result.scorePercentage), 1, '', '%');
    animateNumberCounter('dashPenalty', canonicalObj.result.penaltyMarks, 2);

    // Mini Progress Bars
    const accBar = document.getElementById('accuracyProgress');
    const effBar = document.getElementById('efficiencyProgress');
    if (accBar) accBar.style.width = `${Math.min(100, Math.max(0, canonicalObj.result.accuracy))}%`;
    if (effBar) effBar.style.width = `${Math.min(100, Math.max(0, canonicalObj.result.scorePercentage))}%`;

    document.getElementById('dashCorrect').innerText = canonicalObj.scoring.correct;
    document.getElementById('dashWrong').innerText = canonicalObj.scoring.wrong;
    document.getElementById('dashSkipped').innerText = canonicalObj.scoring.skipped;
    document.getElementById('dashPenaltyMeta').innerText = `${canonicalObj.scoring.wrong} Incorrect Attempts`;

    let unattemptedPct = ((canonicalObj.scoring.skipped / canonicalObj.scoring.totalQuestions) * 100).toFixed(1);
    document.getElementById('dashUnattemptedPct').innerText = `${unattemptedPct}% Unattempted`;

    document.getElementById('predPercentile').innerText = canonicalObj.prediction.percentileRange;
    document.getElementById('predRank').innerText = canonicalObj.prediction.rankRange;
    document.getElementById('predConfidence').innerText = canonicalObj.prediction.confidence;
    document.getElementById('predMethodology').innerText = canonicalObj.prediction.methodology;

    // Diagnostic Text
    let diagText = `ECLIPSE7 Quantitative Diagnostic Report:\n`;
    diagText += `• Accuracy Rate: ${canonicalObj.result.accuracy}%\n`;
    diagText += `• Penalty Loss: ${canonicalObj.result.penaltyMarks.toFixed(2)} marks lost to wrong attempts.\n`;
    diagText += `• Coverage: ${canonicalObj.result.attemptRate}% total assessment completion.\n\n`;
    diagText += `Strategic Directives:\n` + canonicalObj.analytics.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');

    document.getElementById('aiReportContent').innerText = diagText;

    // Insights List
    const insightList = document.getElementById('insightList');
    if (insightList) {
        insightList.innerHTML = '';
        canonicalObj.analytics.recommendations.forEach(r => {
            let li = document.createElement('li');
            li.textContent = r;
            insightList.appendChild(li);
        });
    }

    renderCurrentDashboardCharts(canonicalObj);
    initSimulatorValues(canonicalObj);

    document.getElementById('analyticsDashboardContainer').classList.remove('hidden');
}

function executeCalculationSequence() {
    if (!validateInput()) return null;
    const resultObj = buildAssessmentResult();
    renderResult(resultObj);
    saveAssessment(resultObj);
    return resultObj;
}

// ============================================================================
// SIMULATOR ("WHAT IF?")
// ============================================================================
function setupSimulatorObservers() {
    const s1 = document.getElementById('simWrongToCorrect');
    const s2 = document.getElementById('simSkipToCorrect');

    if (s1 && s2) {
        s1.addEventListener('input', updateSimulatorOutcome);
        s2.addEventListener('input', updateSimulatorOutcome);
    }
}

function initSimulatorValues(canonicalObj) {
    const s1 = document.getElementById('simWrongToCorrect');
    const s2 = document.getElementById('simSkipToCorrect');
    if (!s1 || !s2) return;

    s1.max = Math.min(15, canonicalObj.scoring.wrong);
    s1.value = 0;
    s2.max = Math.min(15, canonicalObj.scoring.skipped);
    s2.value = 0;

    document.getElementById('simValWrongToCorrect').textContent = "0";
    document.getElementById('simValSkipToCorrect').textContent = "0";
    document.getElementById('simProjectedScore').textContent = canonicalObj.result.finalScore.toFixed(2);
    document.getElementById('simScoreDelta').textContent = "+0.00";
}

function updateSimulatorOutcome() {
    if (!activeCanonicalResult) return;

    const wToC = parseInt(document.getElementById('simWrongToCorrect').value) || 0;
    const sToC = parseInt(document.getElementById('simSkipToCorrect').value) || 0;

    document.getElementById('simValWrongToCorrect').textContent = wToC;
    document.getElementById('simValSkipToCorrect').textContent = sToC;

    const mpc = activeCanonicalResult.scoring.marksPerCorrect;
    const ratio = activeCanonicalResult.scoring.negativeMarkingRatio;

    const recoveredPenalty = wToC * (mpc * ratio);
    const addedScoreWrong = wToC * mpc;
    const addedScoreSkip = sToC * mpc;

    const delta = recoveredPenalty + addedScoreWrong + addedScoreSkip;
    const projected = activeCanonicalResult.result.finalScore + delta;

    document.getElementById('simProjectedScore').textContent = projected.toFixed(2);
    document.getElementById('simScoreDelta').textContent = `+${delta.toFixed(2)}`;
}

// ============================================================================
// ANIMATIONS & CHARTS
// ============================================================================
function animateNumberCounter(elementId, targetValue, decimals = 0, prefix = '', suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    let start = 0;
    let duration = 600;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = Math.min((timestamp - startTime) / duration, 1);
        let curr = start + progress * (targetValue - start);
        el.innerText = `${prefix}${curr.toFixed(decimals)}${suffix}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}

function renderCurrentDashboardCharts(canonicalObj) {
    if (breakdownChartInstance) breakdownChartInstance.destroy();
    if (subjectChartInstance) subjectChartInstance.destroy();

    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    const ctxPie = document.getElementById('currentBreakdownChart').getContext('2d');
    breakdownChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Correct', 'Incorrect', 'Skipped'],
            datasets: [{
                data: [canonicalObj.scoring.correct, canonicalObj.scoring.wrong, canonicalObj.scoring.skipped],
                backgroundColor: ['#10b981', '#f43f5e', '#64748b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } } 
                } 
            }
        }
    });

    const ctxBar = document.getElementById('currentSubjectChart').getContext('2d');
    const dynLabel = canonicalObj.assessment.examProfile === 'neet' ? 'Biology' : 'Mathematics';
    const subData = canonicalObj.subjects.data;
    
    subjectChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Physics', 'Chemistry', dynLabel],
            datasets: [{
                label: 'Domain Score',
                data: [subData.phy.score, subData.chem.score, subData.mathBio.score],
                backgroundColor: ['#00d2ff', '#2563eb', '#3b82f6'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
        }
    });
}

// ============================================================================
// STORAGE & HISTORY VAULT ARCHITECTURE
// ============================================================================
function getStoredHistory() {
    try {
        const raw = localStorage.getItem(E7_HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Local storage error:", e);
        return [];
    }
}

function saveAssessment(canonicalObj) {
    let history = getStoredHistory();
    const existingIndex = history.findIndex(h => h.id === canonicalObj.id);

    if (existingIndex >= 0) {
        history[existingIndex] = canonicalObj;
    } else {
        history.unshift(canonicalObj);
    }

    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(history));
    renderHistoryVault();

    if (window.saveScoreToDatabase) {
        window.saveScoreToDatabase(canonicalObj);
    }
}

function mergeCloudAndLocalHistory(cloudRecords) {
    let localHistory = getStoredHistory();
    let mergedMap = new Map();

    localHistory.forEach(item => mergedMap.set(item.id, item));
    cloudRecords.forEach(item => mergedMap.set(item.id, item));

    let mergedArray = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(mergedArray));
    renderHistoryVault();
}

function renderHistoryVault() {
    const container = document.getElementById('historyListContainer');
    const badge = document.getElementById('navHistoryCounter');
    const totalTxt = document.getElementById('historyTotalText');
    if (!container) return;

    const history = getStoredHistory();
    if (badge) badge.textContent = history.length;
    if (totalTxt) totalTxt.textContent = `${history.length} Records Stored`;

    if (history.length === 0) {
        container.innerHTML = `<div class="empty-history-msg">No stored assessment history found.</div>`;
        return;
    }

    let html = '';
    history.forEach(item => {
        const student = escapeHTML(item.student?.name || item.studentName || 'Candidate');
        const test = escapeHTML(item.assessment?.testName || item.testName || 'Assessment');
        const profile = escapeHTML((item.assessment?.examProfile || item.profile || 'custom').toUpperCase());
        const score = typeof item.result?.finalScore === 'number' ? item.result.finalScore.toFixed(2) : (item.finalScore || '0.00');
        const maxM = item.scoring?.maxMarks || item.maxMarks || 300;
        const eff = item.result?.scorePercentage || item.efficiency || '0.00';

        html += `
        <div class="history-item-card" data-id="${item.id}">
            <div class="item-card-header">
                <span class="item-test-title">${test}</span>
                <span class="item-badge-profile">${profile}</span>
            </div>
            <div class="item-student-name"><i class="fa-solid fa-user-graduate text-cyan"></i> ${student}</div>
            <div class="item-metrics-grid">
                <div>Score: <strong>${score} / ${maxM}</strong></div>
                <div>Accuracy: <strong>${item.result?.accuracy || item.accuracy || 0}%</strong></div>
                <div>Efficiency: <strong>${eff}%</strong></div>
                <div>Date: <strong>${item.timestamp || 'N/A'}</strong></div>
            </div>
            <div class="item-card-actions">
                <button class="item-btn btn-restore bubble-click" onclick="restoreAssessmentState('${item.id}')"><i class="fa-solid fa-rotate-left"></i> Restore</button>
                <button class="item-btn btn-delete bubble-click" onclick="deleteAssessmentItem('${item.id}')"><i class="fa-solid fa-trash-can"></i> Delete</button>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function restoreAssessmentState(id) {
    const history = getStoredHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;

    document.getElementById('studentName').value = item.student?.name || item.studentName || '';
    document.getElementById('testName').value = item.assessment?.testName || item.testName || '';
    
    const profileKey = item.assessment?.examProfile || item.profile || 'custom';
    document.getElementById('examProfile').value = profileKey;
    document.getElementById('examProfileLabel').textContent = EXAM_PROFILES[profileKey]?.label || EXAM_PROFILES.custom.label;

    document.getElementById('totalQs').value = item.scoring?.totalQuestions || item.totalQs || 0;
    document.getElementById('maxMarks').value = item.scoring?.maxMarks || item.maxMarks || 0;
    document.getElementById('attempted').value = item.scoring?.attempted || item.attempted || 0;
    document.getElementById('wrong').value = item.scoring?.wrong || item.wrong || 0;
    document.getElementById('markingRatio').value = item.scoring?.negativeMarkingRatio || item.markingRatio || 0.25;

    if (item.subjects?.data) {
        document.getElementById('reportType').value = 'subjectwise';
        document.getElementById('selectedLabel').textContent = 'SUBJECT BREAKDOWN';
        toggleSubjectSectionDisplay();

        ['phy', 'chem', 'mathBio'].forEach(sub => {
            const sData = item.subjects.data[sub];
            if (sData) {
                document.getElementById(`${sub}A`).value = sData.total || 0;
                document.getElementById(`${sub}C`).value = sData.correct || 0;
                document.getElementById(`${sub}W`).value = sData.wrong || 0;
                document.getElementById(`${sub}N`).value = sData.skipped || 0;
            }
        });
        recalculateSubjectScores();
    } else {
        document.getElementById('reportType').value = 'overall';
        document.getElementById('selectedLabel').textContent = 'OVERALL MODE';
        toggleSubjectSectionDisplay();
    }

    renderResult(item);
    toggleHistoryDrawer(false);
    triggerSystemToastNotification("Assessment state successfully restored.", false);
}

function deleteAssessmentItem(id) {
    let history = getStoredHistory();
    const item = history.find(h => h.id === id);
    history = history.filter(h => h.id !== id);
    localStorage.setItem(E7_HISTORY_KEY, JSON.stringify(history));
    renderHistoryVault();

    if (item && item.firebaseKey && window.deleteScoreFromDatabase) {
        window.deleteScoreFromDatabase(item.firebaseKey);
    }
    triggerSystemToastNotification("Record removed from vault.", false);
}

function clearAssessmentHistory() {
    if (!confirm("Purge all stored assessments from memory?")) return;
    localStorage.removeItem(E7_HISTORY_KEY);
    renderHistoryVault();
    if (window.clearAllDatabaseScores) {
        window.clearAllDatabaseScores();
    }
    triggerSystemToastNotification("Vault purged completely.", false);
}

function filterHistoryList() {
    const q = document.getElementById('historySearchInput').value.toLowerCase();
    const items = document.querySelectorAll('.history-item-card');
    items.forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = text.includes(q) ? 'block' : 'none';
    });
}

function toggleHistoryDrawer(show) {
    const drawer = document.getElementById('historyDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (!drawer || !overlay) return;

    if (show) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        renderHistoryVault();
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// ============================================================================
// COMPARISON ENGINE & FULL REPORT MODALS
// ============================================================================
function openCompareModalLauncher() {
    const history = getStoredHistory();
    if (history.length < 2) {
        triggerSystemToastNotification("At least 2 records are required for comparison.");
        return;
    }

    const s1 = document.getElementById('compareSelect1');
    const s2 = document.getElementById('compareSelect2');
    s1.innerHTML = ''; s2.innerHTML = '';

    history.forEach((h, idx) => {
        const opt1 = document.createElement('option');
        opt1.value = h.id; opt1.textContent = `${h.assessment?.testName || h.testName} (${h.result?.scorePercentage || h.efficiency}%)`;
        s1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = h.id; opt2.textContent = `${h.assessment?.testName || h.testName} (${h.result?.scorePercentage || h.efficiency}%)`;
        s2.appendChild(opt2);
    });

    s2.selectedIndex = 1;
    toggleCompareModal(true);
    renderComparisonView();
}

function toggleCompareModal(show) {
    const modal = document.getElementById('compareModal');
    const overlay = document.getElementById('compareModalOverlay');
    if (show) {
        modal?.classList.add('active');
        overlay?.classList.add('active');
    } else {
        modal?.classList.remove('active');
        overlay?.classList.remove('active');
    }
}

function renderComparisonView() {
    const id1 = document.getElementById('compareSelect1').value;
    const id2 = document.getElementById('compareSelect2').value;
    const history = getStoredHistory();
    const t1 = history.find(h => h.id === id1);
    const t2 = history.find(h => h.id === id2);
    const container = document.getElementById('comparisonGrid');

    if (!t1 || !t2) return;

    const eff1 = parseFloat(t1.result?.scorePercentage || t1.efficiency);
    const eff2 = parseFloat(t2.result?.scorePercentage || t2.efficiency);
    const diffEff = (eff2 - eff1).toFixed(2);
    const diffPen = ((t2.result?.penaltyMarks || t2.totalPenalty) - (t1.result?.penaltyMarks || t1.totalPenalty)).toFixed(2);

    container.innerHTML = `
        <div class="cmp-card">
            <h4>${escapeHTML(t1.assessment?.testName || t1.testName)}</h4>
            <p>Score: <strong>${t1.result?.finalScore || t1.finalScore} / ${t1.scoring?.maxMarks || t1.maxMarks}</strong></p>
            <p>Efficiency: <strong>${eff1}%</strong></p>
            <p>Accuracy: <strong>${t1.result?.accuracy || t1.accuracy}%</strong></p>
            <p>Penalty: <strong>${t1.result?.penaltyMarks || t1.totalPenalty}</strong></p>
        </div>
        <div class="cmp-card">
            <h4>${escapeHTML(t2.assessment?.testName || t2.testName)}</h4>
            <p>Score: <strong>${t2.result?.finalScore || t2.finalScore} / ${t2.scoring?.maxMarks || t2.maxMarks}</strong></p>
            <p>Efficiency: <strong>${eff2}%</strong></p>
            <p>Accuracy: <strong>${t2.result?.accuracy || t2.accuracy}%</strong></p>
            <p>Penalty: <strong>${t2.result?.penaltyMarks || t2.totalPenalty}</strong></p>
        </div>
        <div class="cmp-summary-box">
            <strong>Comparative Analysis:</strong> ${diffEff >= 0 ? `+${diffEff}% Efficiency gain` : `${diffEff}% Efficiency shift`}.
            Penalty difference: ${diffPen} marks.
        </div>
    `;
}

function generateAndShowFullHistoryReport() {
    const history = getStoredHistory();
    if (history.length === 0) {
        triggerSystemToastNotification("No history available to generate full report.");
        return;
    }

    const container = document.getElementById('fullReportContent');
    let avgScorePct = (history.reduce((a, b) => a + parseFloat(b.result?.scorePercentage || b.efficiency), 0) / history.length).toFixed(2);
    let avgAcc = (history.reduce((a, b) => a + parseFloat(b.result?.accuracy || b.accuracy), 0) / history.length).toFixed(2);

    container.innerHTML = `
        <div class="full-report-section">
            <h4>Executive Analytics Summary</h4>
            <p>Evaluated <strong>${history.length}</strong> total assessments. Average Efficiency: <strong>${avgScorePct}%</strong> | Average Accuracy: <strong>${avgAcc}%</strong>.</p>
        </div>
        <div class="full-report-section">
            <h4>Assessment Progression Timeline</h4>
            <ul class="timeline-list">
                ${history.map(h => `
                    <li>
                        <strong>${escapeHTML(h.assessment?.testName || h.testName)}</strong> — Score: ${h.result?.finalScore || h.finalScore} (${h.result?.scorePercentage || h.efficiency}%) on ${h.timestamp}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    toggleFullReportModal(true);
}

function toggleFullReportModal(show) {
    const modal = document.getElementById('fullReportModal');
    const overlay = document.getElementById('fullReportOverlay');
    if (show) {
        modal?.classList.add('active');
        overlay?.classList.add('active');
    } else {
        modal?.classList.remove('active');
        overlay?.classList.remove('active');
    }
}

// ============================================================================
// PDF EXPORT ENGINE WITH SUBJECT BREAKDOWN & VERIFICATION PANEL STAMP
// ============================================================================
function createPDFDocumentObject(canonicalObj) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const profile = (canonicalObj.assessment.examProfile).toUpperCase();
    const student = canonicalObj.student.name.toUpperCase();
    const test = canonicalObj.assessment.testName.toUpperCase();
    const timestamp = canonicalObj.timestamp;

    // Background Canvas Frame
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Subtle Grid Blueprint Lines
    doc.setDrawColor(235, 242, 250); doc.setLineWidth(0.2);
    for (let i = 10; i < 210; i += 15) doc.line(i, 0, i, 297);
    for (let j = 10; j < 297; j += 15) doc.line(0, j, 210, j);

    // Main Page Border
    doc.setDrawColor(37, 99, 235); doc.setLineWidth(0.4);
    doc.rect(8, 8, 194, 281);

    // Header Branding Banner
    doc.setFillColor(15, 23, 42); doc.rect(10, 10, 190, 32, 'F');
    doc.setDrawColor(0, 210, 255); doc.setLineWidth(0.6); doc.rect(10, 10, 190, 32, 'D');

    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("EXAMINATION PERFORMANCE & METRIC ANALYTICS REPORT", 14, 20);
    
    doc.setFont("courier", "bold"); doc.setFontSize(8); doc.setTextColor(0, 210, 255);
    doc.text(`ECLIPSE7 ENGINE // PROFILE: ${profile} // ID: ${canonicalObj.id}`, 14, 26);
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
    doc.text("AUTHOR: SAIPRASAD BARURE / PRASAD REDDY | OFFICIAL REPORT GENERATOR", 14, 34);

    // Candidate Identity & Metric Summary Panel
    let cardY = 46;
    doc.setFillColor(241, 245, 249); doc.rect(10, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(10, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" CANDIDATE PROFILE MATRIX", 12, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255); doc.setDrawColor(203, 213, 225);
    doc.rect(10, cardY + 6, 92, 26, 'DF');
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("CANDIDATE NAME    :", 14, cardY + 14);
    doc.text("TARGET ASSESSMENT  :", 14, cardY + 20);
    doc.text("TIMESTAMP           :", 14, cardY + 26);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(student.length > 20 ? student.substring(0, 20) + "..." : student, 44, cardY + 14);
    doc.text(test.length > 20 ? test.substring(0, 20) + "..." : test, 44, cardY + 20);
    doc.setFont("courier", "bold"); doc.setFontSize(6.5); doc.text(timestamp, 44, cardY + 26);

    doc.setFillColor(241, 245, 249); doc.rect(108, cardY, 92, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(108, cardY, 92, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text(" GLOBAL EVALUATION OVERVIEW", 110, cardY + 4.2);
    
    doc.setFillColor(255, 255, 255); doc.setDrawColor(203, 213, 225);
    doc.rect(108, cardY + 6, 92, 26, 'DF');
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("TOTAL QUESTIONS    :", 112, cardY + 13);
    doc.text("MAX EVAL MARKS      :", 112, cardY + 19);
    doc.text("TOTAL ATTEMPTS      :", 112, cardY + 25);
    doc.text("INCORRECT FAULTS    :", 112, cardY + 31);
    
    doc.setTextColor(15, 23, 42); doc.setFontSize(7.5);
    doc.text(`${canonicalObj.scoring.totalQuestions} ITEMS`, 148, cardY + 13);
    doc.text(`${canonicalObj.scoring.maxMarks} MARKS`, 148, cardY + 19);
    doc.text(`${canonicalObj.scoring.attempted} UNITS`, 148, cardY + 25);
    doc.setTextColor(225, 29, 72); doc.text(`${canonicalObj.scoring.wrong} FAULTS`, 148, cardY + 31);

    // Hero Score Panel
    let scoreY = 82;
    doc.setFillColor(248, 250, 252); doc.setDrawColor(37, 99, 235); doc.setLineWidth(0.5);
    doc.rect(10, scoreY, 190, 22, 'DF');

    doc.setTextColor(37, 99, 235); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("FINAL EVALUATED SCORE", 15, scoreY + 6);
    doc.setFont("courier", "bold"); doc.setFontSize(16); doc.setTextColor(15, 23, 42);
    doc.text(`${canonicalObj.result.finalScore.toFixed(2)} / ${canonicalObj.scoring.maxMarks}`, 15, scoreY + 16);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text("EFFICIENCY %", 100, scoreY + 6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(15, 23, 42);
    doc.text(`${canonicalObj.result.scorePercentage}%`, 100, scoreY + 15);

    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text("ACCURACY", 150, scoreY + 6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(15, 23, 42);
    doc.text(`${canonicalObj.result.accuracy}%`, 150, scoreY + 15);

    let nextY = scoreY + 28;

    // SUBJECT WISE BREAKDOWN ANALYSIS TABLE
    if (canonicalObj.subjects && canonicalObj.subjects.enabled) {
        doc.setFillColor(15, 23, 42); doc.rect(10, nextY, 190, 6, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.text(" SUBJECT-WISE PERFORMANCE ANALYSIS BREAKDOWN", 12, nextY + 4.2);

        const thirdLabel = canonicalObj.assessment.examProfile === 'neet' ? 'BIOLOGY' : 'MATHEMATICS';
        const subData = canonicalObj.subjects.data;

        const tableBody = [
            [
                'PHYSICS', 
                subData.phy.total, 
                subData.phy.correct, 
                subData.phy.wrong, 
                subData.phy.skipped, 
                `${subData.phy.score.toFixed(2)} / ${subData.phy.maxMarks}`
            ],
            [
                'CHEMISTRY', 
                subData.chem.total, 
                subData.chem.correct, 
                subData.chem.wrong, 
                subData.chem.skipped, 
                `${subData.chem.score.toFixed(2)} / ${subData.chem.maxMarks}`
            ],
            [
                thirdLabel, 
                subData.mathBio.total, 
                subData.mathBio.correct, 
                subData.mathBio.wrong, 
                subData.mathBio.skipped, 
                `${subData.mathBio.score.toFixed(2)} / ${subData.mathBio.maxMarks}`
            ]
        ];

        doc.autoTable({
            startY: nextY + 6,
            head: [['Subject', 'Total Qs', 'Correct', 'Wrong', 'Skipped', 'Net Score']],
            body: tableBody,
            margin: { left: 10, right: 10 },
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        nextY = doc.lastAutoTable.finalY + 8;
    }

    // STATISTICAL RANK & PERCENTILE ESTIMATION PANEL
    doc.setFillColor(241, 245, 249); doc.rect(10, nextY, 190, 6, 'F');
    doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.3); doc.rect(10, nextY, 190, 6, 'D');
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text(" STATISTICAL PROJECTION & PERCENTILE ESTIMATION", 12, nextY + 4.2);

    doc.setFillColor(255, 255, 255); doc.rect(10, nextY + 6, 190, 22, 'DF');
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text("ESTIMATED PERCENTILE RANGE :", 14, nextY + 14);
    doc.text("ESTIMATED RANK RANGE       :", 14, nextY + 22);

    doc.setTextColor(37, 99, 235); doc.setFontSize(8);
    doc.text(canonicalObj.prediction.percentileRange, 64, nextY + 14);
    doc.text(canonicalObj.prediction.rankRange, 64, nextY + 22);

    doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text("ESTIMATION MODEL : " + canonicalObj.prediction.methodology, 120, nextY + 14);
    doc.text("CONFIDENCE LEVEL  : " + canonicalObj.prediction.confidence, 120, nextY + 22);

    nextY += 34;

    // FINAL SIGN-OFF & VERIFICATION PANEL WITH STAMP
    const stampPanelY = 220;
    doc.setFillColor(248, 250, 252); doc.setDrawColor(15, 23, 42); doc.setLineWidth(0.4);
    doc.rect(10, stampPanelY, 190, 60, 'DF');

    doc.setFillColor(15, 23, 42); doc.rect(10, stampPanelY, 190, 6, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text(" OFFICIAL VERIFICATION & AUDIT CERTIFICATION", 12, stampPanelY + 4.2);

    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("ECLIPSE7 PERFORMANCE VERIFICATION SEAL", 14, stampPanelY + 14);

    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text(`Document Signature Hash : SHA256-${canonicalObj.id}`, 14, stampPanelY + 22);
    doc.text(`System Generation Time : ${timestamp}`, 14, stampPanelY + 28);
    doc.text(`Lead Platform Engineer : Saiprasad Barure / Prasad Reddy`, 14, stampPanelY + 34);
    doc.text(`Platform Portal         : https://eclipse7.odoo.com/`, 14, stampPanelY + 40);
    doc.text(`Verification Status     : AUTHENTICATED LOCAL EVALUATION`, 14, stampPanelY + 46);

    // Try loading stamp.png image into PDF
    try {
        const stampImg = new Image();
        stampImg.src = 'stamp.png';
        doc.addImage(stampImg, 'PNG', 145, stampPanelY + 8, 48, 48);
    } catch (e) {
        // Fallback Stamp Badge if image loading fails
        doc.setDrawColor(37, 99, 235); doc.setLineWidth(0.8);
        doc.rect(145, stampPanelY + 12, 48, 40);
        doc.setTextColor(37, 99, 235); doc.setFont("helvetica", "bold"); doc.setFontSize(7);
        doc.text("ECLIPSE7 SEAL", 152, stampPanelY + 30);
    }

    return doc;
}

function downloadPDFReportSequence() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Calculate an assessment first.");
        return;
    }

    const doc = createPDFDocumentObject(activeCanonicalResult);
    const fileName = `${activeCanonicalResult.student.name.replace(/ /g, "_")}_ECLIPSE7_Report.pdf`;
    doc.save(fileName);
}

function exportCurrentPNG() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Calculate an assessment first.");
        return;
    }

    document.getElementById('exportStudentName').textContent = activeCanonicalResult.student.name;
    document.getElementById('exportTestName').textContent = activeCanonicalResult.assessment.testName;
    document.getElementById('exportProfileTag').textContent = activeCanonicalResult.assessment.examProfile.toUpperCase();
    document.getElementById('exportScoreVal').textContent = activeCanonicalResult.result.finalScore.toFixed(2);
    document.getElementById('exportScoreSub').textContent = `${activeCanonicalResult.result.scorePercentage}% | Band: ${activeCanonicalResult.analytics.performanceLevel}`;
    document.getElementById('exportAcc').textContent = `${activeCanonicalResult.result.accuracy}%`;
    document.getElementById('exportAtt').textContent = activeCanonicalResult.scoring.attempted;
    document.getElementById('exportPen').textContent = activeCanonicalResult.result.penaltyMarks.toFixed(2);
    document.getElementById('exportDocId').textContent = `ID: ${activeCanonicalResult.id}`;

    const card = document.getElementById('exportReportCard');
    card.style.display = 'block';

    html2canvas(card, { backgroundColor: '#050811' }).then(canvas => {
        card.style.display = 'none';
        let link = document.createElement('a');
        link.download = `${activeCanonicalResult.student.name.replace(/ /g, "_")}_Card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function exportCurrentJSON() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Calculate an assessment first.");
        return;
    }
    let blob = new Blob([JSON.stringify(activeCanonicalResult, null, 2)], { type: 'application/json' });
    let link = document.createElement('a');
    link.download = `${activeCanonicalResult.id}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function downloadCompleteHistoryPDF() {
    const history = getStoredHistory();
    if (history.length === 0) {
        triggerSystemToastNotification("No history records available.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("ECLIPSE7 - Complete Vault Performance Analytics", 14, 20);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()} | Total Assessments: ${history.length}`, 14, 26);

    const tableRows = history.map(h => [
        h.timestamp || 'N/A',
        h.student?.name || h.studentName || 'Candidate',
        h.assessment?.testName || h.testName || 'Assessment',
        (h.assessment?.examProfile || h.profile || 'custom').toUpperCase(),
        `${h.result?.finalScore || h.finalScore} / ${h.scoring?.maxMarks || h.maxMarks}`,
        `${h.result?.scorePercentage || h.efficiency}%`
    ]);

    doc.autoTable({
        startY: 32,
        head: [['Timestamp', 'Student', 'Test', 'Profile', 'Score', 'Efficiency']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save("ECLIPSE7_History_Vault_Report.pdf");
}

function exportHistoryJSON() {
    const history = getStoredHistory();
    let blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    let link = document.createElement('a');
    link.download = 'ECLIPSE7_History_Vault.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function exportHistoryCSV() {
    const history = getStoredHistory();
    if (history.length === 0) return;
    
    let csv = "ID,Timestamp,Student,Test,Profile,Score,MaxMarks,Efficiency,Accuracy\n";
    history.forEach(h => {
        const id = `"${(h.id || '').replace(/"/g, '""')}"`;
        const ts = `"${(h.timestamp || '').replace(/"/g, '""')}"`;
        const st = `"${(h.student?.name || h.studentName || '').replace(/"/g, '""')}"`;
        const tt = `"${(h.assessment?.testName || h.testName || '').replace(/"/g, '""')}"`;
        const pr = `"${(h.assessment?.examProfile || h.profile || '').replace(/"/g, '""')}"`;
        const sc = h.result?.finalScore || h.finalScore || 0;
        const mx = h.scoring?.maxMarks || h.maxMarks || 0;
        const ef = h.result?.scorePercentage || h.efficiency || 0;
        const ac = h.result?.accuracy || h.accuracy || 0;

        csv += `${id},${ts},${st},${tt},${pr},${sc},${mx},${ef},${ac}\n`;
    });

    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement('a');
    link.download = 'ECLIPSE7_History_Vault.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function triggerShareMenu() {
    if (!activeCanonicalResult) {
        triggerSystemToastNotification("Calculate an assessment first.");
        return;
    }

    const shareText = 
`🎓 *ECLIPSE7 ASSESSMENT REPORT*
----------------------------------------
👤 *Student:* ${activeCanonicalResult.student.name}
📝 *Assessment:* ${activeCanonicalResult.assessment.testName}
🎯 *Profile:* ${activeCanonicalResult.assessment.examProfile.toUpperCase()}

📊 *EVALUATION METRICS*
• *Final Score:* ${activeCanonicalResult.result.finalScore.toFixed(2)} / ${activeCanonicalResult.scoring.maxMarks}
• *Efficiency:* ${activeCanonicalResult.result.scorePercentage}%
• *Accuracy:* ${activeCanonicalResult.result.accuracy}%
• *Penalty Lost:* ${activeCanonicalResult.result.penaltyMarks.toFixed(2)} Marks

🚀 *PROJECTION ESTIMATE*
• *Percentile Range:* ${activeCanonicalResult.prediction.percentileRange}
• *Rank Range:* ${activeCanonicalResult.prediction.rankRange}

----------------------------------------
⚡ *ECLIPSE7 Analytics Platform*
🔗 https://eclipse7.odoo.com/`;

    if (navigator.share) {
        navigator.share({
            title: `ECLIPSE7 Report - ${activeCanonicalResult.student.name}`,
            text: shareText
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareText);
        triggerSystemToastNotification("Summary copied to clipboard!", false);
    }
}

// ============================================================================
// ============================================================================
// UI EXPERIENCE LAYER (ECLIPSE7 "Totality")
// Guided step flow, custom controls, reveal sequence, story chapters and
// micro-interactions. Everything here CALLS the existing engine functions
// above; no calculation logic is duplicated or altered.
// ============================================================================
// ============================================================================

const XP = {
    step: 0,
    revealed: false,
    busy: false,
    played: {},
    inView: new Set(),
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    ringC: 326.73
};
const XP_LAST_STEP = 6;
const XP_RATIOS = ['0.25', '0.333333', '0.5', '0'];

function xp$(id) { return document.getElementById(id); }
function xpNum(id) { const el = xp$(id); return el && el.value !== '' ? parseFloat(el.value) : null; }
function xpIsActive() { return document.documentElement.classList.contains('xp'); }

// ---------- THEME: circular reveal from the toggle (View Transitions API) ----------
function toggleThemeWithReveal() {
    const btn = xp$('theme-toggle-btn');
    const rect = btn ? btn.getBoundingClientRect() : { left: innerWidth / 2, top: 0, width: 0, height: 0 };
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    if (!document.startViewTransition || XP.reduced) {
        const html = document.documentElement;
        html.classList.add('xp-theme-fade');
        toggleThemeMode();
        setTimeout(() => html.classList.remove('xp-theme-fade'), 550);
        return;
    }
    const transition = document.startViewTransition(() => toggleThemeMode());
    transition.ready.then(() => {
        document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 750, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
        );
    }).catch(() => {});
}

// ---------- WRAPPERS around existing flows (behaviour preserved, visuals added) ----------
const _xpOrigExecuteCalculation = executeCalculationSequence;
executeCalculationSequence = function () {
    if (!xpIsActive()) return _xpOrigExecuteCalculation();
    if (XP.busy) return null;
    if (!validateInput()) { xpRouteToFirstError(); return null; }
    XP.busy = true;

    const btn = xp$('btnCalculate');
    const r = btn.getBoundingClientRect();
    const veil = xp$('xpVeil');
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const d = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 2 + 80;
    veil.style.setProperty('--x', x + 'px');
    veil.style.setProperty('--y', y + 'px');
    veil.style.setProperty('--d', d + 'px');

    const finish = () => {
        const res = _xpOrigExecuteCalculation();
        XP.busy = false;
        if (res) xpApplyRevealState(res, true);
        return res;
    };

    if (XP.reduced) return finish();

    veil.classList.remove('is-off');
    void veil.offsetWidth;
    veil.classList.add('is-on');
    setTimeout(() => {
        finish();
        veil.classList.add('is-off');
        setTimeout(() => veil.classList.remove('is-on', 'is-off'), 950);
    }, 760);
    return null;
};

const _xpOrigRenderResult = renderResult;
renderResult = function (canonicalObj) {
    _xpOrigRenderResult(canonicalObj);
    xpOnResultRendered(canonicalObj);
};

const _xpOrigRestore = restoreAssessmentState;
restoreAssessmentState = function (id) {
    _xpOrigRestore(id);
    if (!xpIsActive() || !activeCanonicalResult) return;
    xpSyncControls();
    window.scrollTo(0, 0);
    xpGo(6, 1, true);
    xpApplyRevealState(activeCanonicalResult, true);
};

// ---------- STEP NAVIGATION ----------
function xpSteps() { return Array.from(document.querySelectorAll('.xp-step')); }
function xpMode() { return xp$('reportType').value; }

function xpGo(to, dir = 1, keepReveal = false) {
    const steps = xpSteps();
    if (to === XP.step || !steps[to]) return;
    const from = steps[XP.step];
    const next = steps[to];

    if (to === 6 && !keepReveal) xpResetReveal();
    if (XP.step === 6) window.scrollTo({ top: 0, behavior: 'auto' });

    from.classList.remove('is-active');
    from.dataset.dir = dir;
    from.inert = true;
    if (!XP.reduced) {
        from.classList.add('is-leaving');
        setTimeout(() => from.classList.remove('is-leaving'), 540);
    }

    next.dataset.dir = dir;
    next.inert = false;
    next.scrollTop = 0;
    next.classList.add('is-active');
    XP.step = to;
    document.body.dataset.xpStep = to;

    if (to === 6) xpRenderSummary();
    xpUpdateRail();

    setTimeout(() => {
        if (to === 1 && XP.finePointer && !xp$('studentName').value) xp$('studentName').focus({ preventScroll: true });
        else {
            const h = next.querySelector('[tabindex="-1"]');
            if (h) h.focus({ preventScroll: true });
        }
    }, XP.reduced ? 0 : 420);
}

function xpNext() {
    if (XP.step >= XP_LAST_STEP) return;
    const check = xpValidateStep(XP.step);
    if (!check.ok) { xpFail(check); return; }
    let to = XP.step + 1;
    if (to === 5 && xpMode() !== 'subjectwise') to = 6;
    xpGo(to, 1);
}

function xpBack() {
    let to = XP.step - 1;
    if (to === 5 && xpMode() !== 'subjectwise') to = 4;
    if (to < 0) return;
    xpGo(to, -1);
}

function xpJumpTo(target) {
    if (target === 5 && xpMode() !== 'subjectwise') return;
    if (target < XP.step) { xpGo(target, -1); return; }
    for (let s = XP.step; s < target; s++) {
        if (s === 5 && xpMode() !== 'subjectwise') continue;
        const check = xpValidateStep(s);
        if (!check.ok) {
            if (s !== XP.step) xpGo(s, 1);
            setTimeout(() => xpFail(check), s !== XP.step ? 450 : 0);
            return;
        }
    }
    xpGo(target, 1);
}

function xpUpdateRail() {
    const rail = xp$('xpRail');
    if (!rail) return;
    const subjectMode = xpMode() === 'subjectwise';
    document.body.dataset.mode = subjectMode ? 'subjectwise' : 'overall';
    rail.querySelectorAll('.xp-rail-dot').forEach(dot => {
        const n = parseInt(dot.dataset.go, 10);
        dot.classList.toggle('is-done', n < XP.step);
        if (n === XP.step) dot.setAttribute('aria-current', 'step'); else dot.removeAttribute('aria-current');
    });
    const p = XP.step <= 1 ? 0 : (XP.step - 1) / 5;
    rail.style.setProperty('--p', p.toFixed(3));
    const back = xp$('xpBack');
    if (back) back.disabled = XP.step === 0;
}

// ---------- STEP VALIDATION (friendly, inline) ----------
function xpValidateStep(n) {
    const fail = (msg, fields, step = n) => ({ ok: false, msg, fields, step });
    if (n === 1) {
        const name = xp$('studentName'), test = xp$('testName');
        if (!name.value.trim()) return fail("Let's start with your name.", [name]);
        if (!test.value.trim()) return fail('Give this test a name so you can find it in the vault later.', [test]);
    }
    if (n === 3 || n === 4) {
        const t = xpNum('totalQs'), m = xpNum('maxMarks'), a = xpNum('attempted'), w = xpNum('wrong');
        const s = 3;
        if (t === null || t <= 0) return fail('How many questions were on the paper?', [xp$('totalQs')], s);
        if (m === null || m <= 0) return fail('What was the paper out of? Add the max marks.', [xp$('maxMarks')], s);
        if (a !== null && a < 0) return fail("Attempts can't be negative.", [xp$('attempted')], s);
        if (w !== null && w < 0) return fail("Incorrect answers can't be negative.", [xp$('wrong')], s);
        if (a !== null && a > t) return fail(`You can't attempt more than ${t} questions.`, [xp$('attempted'), xp$('totalQs')], s);
        if (a !== null && w !== null && w > a) return fail("Incorrect answers can't exceed your attempts.", [xp$('wrong'), xp$('attempted')], s);
        if (n === 4 && xpMode() !== 'subjectwise') {
            if (a === null) return fail('Overall mode needs your attempts. Add them on the numbers step.', [xp$('attempted')], s);
            if (w === null) return fail('Overall mode needs your incorrect count. Add it on the numbers step.', [xp$('wrong')], s);
        }
    }
    if (n === 5) {
        const labels = { phy: 'Physics', chem: 'Chemistry', mathBio: (xp$('mathBioLabel').textContent || 'Maths').trim() };
        let sum = 0;
        for (const sub of ['phy', 'chem', 'mathBio']) {
            const tot = xpNum(`${sub}A`) || 0, c = xpNum(`${sub}C`) || 0, w = xpNum(`${sub}W`) || 0, k = xpNum(`${sub}N`) || 0;
            sum += tot;
            if (c + w + k !== tot) {
                return fail(`${labels[sub]}: correct + wrong + skipped should add up to ${tot}.`, [xp$(`${sub}C`), xp$(`${sub}W`), xp$(`${sub}N`)]);
            }
        }
        if (sum <= 0) return fail('Add question totals for at least one subject.', [xp$('phyA')]);
    }
    return { ok: true };
}

function xpFail(check) {
    if (check.step !== undefined && check.step !== XP.step) {
        xpGo(check.step, -1);
        setTimeout(() => xpFail({ ...check, step: undefined }), XP.reduced ? 0 : 480);
        return;
    }
    const stepEl = xpSteps()[XP.step];
    const fb = stepEl.querySelector('.xp-feedback');
    if (fb) { fb.textContent = ''; void fb.offsetWidth; fb.textContent = check.msg; }
    (check.fields || []).forEach(f => f && f.classList.add('validation-error'));
    const target = stepEl.querySelector('.xp-shake-target');
    if (target && !XP.reduced) {
        target.classList.remove('xp-shake');
        void target.offsetWidth;
        target.classList.add('xp-shake');
    }
    const first = (check.fields || [])[0];
    if (first) first.focus({ preventScroll: false });
}

function xpClearFeedback(stepEl) {
    const fb = stepEl && stepEl.querySelector('.xp-feedback');
    if (fb) fb.textContent = '';
}

function xpRouteToFirstError() {
    const bad = document.querySelector('.xp-step input.validation-error');
    if (!bad) return;
    const stepEl = bad.closest('.xp-step');
    const n = parseInt(stepEl.dataset.step, 10);
    if (n !== XP.step) xpGo(n, -1);
}

// ---------- CUSTOM CONTROLS -> ORIGINAL HIDDEN INPUTS ----------
function xpPickLegacy(panelId, value) {
    const opt = document.querySelector(`#${panelId} .select-box-option[data-value="${value}"]`);
    if (opt) opt.click();
}

function xpSyncControls() {
    const prof = xp$('examProfile').value;
    document.querySelectorAll('input[name="xpExam"]').forEach(r => { r.checked = r.value === prof; });

    const ratio = parseFloat(xp$('markingRatio').value);
    let idx = 0, best = Infinity;
    XP_RATIOS.forEach((v, i) => { const d = Math.abs(parseFloat(v) - ratio); if (d < best) { best = d; idx = i; } });
    document.querySelectorAll('input[name="xpRatio"]').forEach((r, i) => { r.checked = i === idx; });
    const pills = xp$('xpRatioPills');
    if (pills) pills.style.setProperty('--i', idx);

    const mode = xpMode();
    document.querySelectorAll('input[name="xpMode"]').forEach(r => { r.checked = r.value === mode; });

    const note = xp$('xpExamNote');
    if (note && EXAM_PROFILES[prof]) note.textContent = EXAM_PROFILES[prof].intel;

    xpRenderStrip();
    xpUpdateSubjectBars();
    xpUpdateRail();
}

function xpBindChoiceControls() {
    document.querySelectorAll('input[name="xpExam"]').forEach(r => r.addEventListener('change', () => {
        if (!r.checked) return;
        xpPickLegacy('examProfileOptions', r.value);
        const card = r.closest('.xp-card');
        card.classList.remove('is-locking'); void card.offsetWidth; card.classList.add('is-locking');
        xpSyncControls();
    }));
    document.querySelectorAll('input[name="xpRatio"]').forEach(r => r.addEventListener('change', () => {
        if (!r.checked) return;
        xpPickLegacy('ratioOptions', r.value);
        xpSyncControls();
    }));
    document.querySelectorAll('input[name="xpMode"]').forEach(r => r.addEventListener('change', () => {
        if (!r.checked) return;
        xpPickLegacy('selectOptions', r.value);
        const card = r.closest('.xp-card');
        card.classList.remove('is-locking'); void card.offsetWidth; card.classList.add('is-locking');
        xpClearFeedback(xpSteps()[4]);
        xpSyncControls();
    }));
}

// ---------- NUMBER STEPPERS (+/-, hold to repeat) ----------
function xpStepValue(targetId, delta) {
    const el = xp$(targetId);
    if (!el) return;
    let v = (parseFloat(el.value) || 0) + delta;
    const t = xpNum('totalQs'), a = xpNum('attempted');
    let min = parseFloat(el.min); if (isNaN(min)) min = 0;
    v = Math.max(min, v);
    if (targetId === 'attempted' && t !== null) v = Math.min(v, t);
    if (targetId === 'wrong' && a !== null) v = Math.min(v, a);
    if (String(v) === el.value) return;
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

function xpBindSteppers() {
    document.querySelectorAll('.xp-stepper').forEach(btn => {
        let hold = null, rep = null;
        const stop = () => { clearTimeout(hold); clearInterval(rep); hold = rep = null; };
        const fire = () => xpStepValue(btn.dataset.target, parseFloat(btn.dataset.delta));
        btn.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            fire();
            hold = setTimeout(() => { rep = setInterval(fire, 55); }, 380);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
        btn.addEventListener('click', (e) => { if (e.detail === 0) fire(); });
    });
}

function xpTick(input) {
    const wrap = input.closest('.xp-num');
    if (!wrap || XP.reduced) return;
    wrap.classList.remove('is-tick'); void wrap.offsetWidth; wrap.classList.add('is-tick');
}

// ---------- LIVE QUESTION STRIP ----------
function xpRenderStrip() {
    const strip = xp$('xpStrip');
    if (!strip) return;
    const t = Math.max(0, Math.floor(xpNum('totalQs') || 0));
    const a = Math.max(0, Math.min(t, xpNum('attempted') || 0));
    const w = Math.max(0, Math.min(a, xpNum('wrong') || 0));
    const c = Math.max(0, a - w);
    const skipped = Math.max(0, t - a);

    xp$('xpLegCorrect').textContent = c;
    xp$('xpLegWrong').textContent = w;
    xp$('xpLegSkipped').textContent = skipped;
    const m = xpNum('maxMarks');
    xp$('xpMpq').textContent = t > 0 && m ? (m / t).toFixed(2).replace(/\.00$/, '') : '—';
    strip.setAttribute('aria-label', `Question strip: ${c} correct, ${w} wrong, ${skipped} skipped`);

    const cap = 180;
    const n = Math.min(t, cap);
    if (strip.children.length !== n) {
        strip.textContent = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < n; i++) { const s = document.createElement('i'); s.className = 'xp-seg'; frag.appendChild(s); }
        strip.appendChild(frag);
    }
    if (!n) return;
    const scale = t / n;
    const cSeg = Math.round(c / scale), wSeg = Math.round(w / scale);
    Array.from(strip.children).forEach((seg, i) => {
        const state = i < cSeg ? 'ok' : (i < cSeg + wSeg ? 'bad' : 'skip');
        if (seg.dataset.s !== state) {
            seg.dataset.s = state;
            if (!XP.reduced) { seg.classList.remove('is-pop'); void seg.offsetWidth; seg.classList.add('is-pop'); }
        }
    });
}

// ---------- SUBJECT PANELS ----------
function xpUpdateSubjectBars() {
    ['phy', 'chem', 'mathBio'].forEach(sub => {
        const bar = document.querySelector(`.xp-sub-bar[data-bar="${sub}"]`);
        if (!bar) return;
        const tot = xpNum(`${sub}A`) || 0;
        const vals = [xpNum(`${sub}C`) || 0, xpNum(`${sub}W`) || 0, xpNum(`${sub}N`) || 0];
        bar.querySelectorAll('i').forEach((seg, i) => { seg.style.flexBasis = tot > 0 ? `${Math.min(100, (vals[i] / tot) * 100)}%` : '0%'; });
    });
}

function xpObserveChips() {
    ['phyScoreChip', 'chemScoreChip', 'mathBioScoreChip'].forEach(id => {
        const chip = xp$(id);
        if (!chip) return;
        let last = chip.textContent;
        new MutationObserver(() => {
            if (chip.textContent === last || XP.reduced) return;
            last = chip.textContent;
            chip.classList.remove('is-bump'); void chip.offsetWidth; chip.classList.add('is-bump');
        }).observe(chip, { childList: true, characterData: true, subtree: true });
    });
}

// ---------- REVEAL ----------
function xpRenderSummary() {
    const box = xp$('xpSummary');
    if (!box) return;
    const prof = xp$('examProfile').value;
    const profNames = { custom: 'Custom', jeemain: 'JEE Main', jeeadv: 'JEE Advanced', neet: 'NEET UG' };
    const ratioTxt = { '0.25': '1/4', '0.333333': '1/3', '0.5': '1/2', '0': 'None' };
    const checkedRatio = document.querySelector('input[name="xpRatio"]:checked');
    const chips = [
        ['fa-user-graduate', 'Student', xp$('studentName').value.trim() || '—'],
        ['fa-file-signature', 'Test', xp$('testName').value.trim() || '—'],
        ['fa-atom', 'Exam', profNames[prof] || prof],
        ['fa-list-ol', 'Questions', xp$('totalQs').value || '—'],
        ['fa-check', 'Attempted', xp$('attempted').value || '—'],
        ['fa-circle-minus', 'Penalty', checkedRatio ? ratioTxt[checkedRatio.value] : '—'],
        ['fa-layer-group', 'Mode', xpMode() === 'subjectwise' ? 'Subjects' : 'Overall']
    ];
    box.innerHTML = chips.map(([icon, k, v]) => `<span class="xp-chip"><i class="fa-solid ${icon}" aria-hidden="true"></i>${k} <b>${escapeHTML(String(v))}</b></span>`).join('');
}

function xpResetReveal() {
    XP.revealed = false;
    const step = document.querySelector('.xp-reveal-step');
    step.classList.remove('is-revealed');
    xp$('xpT6').innerHTML = 'Ready for<br>totality?';
    xp$('xpRingFill').style.strokeDashoffset = XP.ringC;
    xp$('score').textContent = '0.00';
    const band = xp$('xpRevealBand');
    band.classList.remove('is-in');
    band.textContent = '';
    xp$('btnCalculate').querySelector('span').textContent = 'Calculate Score & Analytics';
    xp$('analyticsDashboardContainer').classList.add('hidden');
    document.body.classList.remove('xp-in-story');
}

function xpApplyRevealState(res, animate) {
    if (XP.step !== 6) xpGo(6, 1, true);
    XP.revealed = true;
    const step = document.querySelector('.xp-reveal-step');
    step.classList.add('is-revealed');
    step.scrollTop = 0;
    xp$('xpT6').innerHTML = 'Your score,<br>in totality.';
    xp$('btnCalculate').querySelector('span').textContent = 'Recalculate';

    const finalScore = Number(res.result?.finalScore) || 0;
    const pct = Math.max(0, Math.min(100, parseFloat(res.result?.scorePercentage) || 0));
    const ring = xp$('xpRingFill');
    ring.style.strokeDashoffset = XP.ringC;
    void ring.getBoundingClientRect();
    requestAnimationFrame(() => { ring.style.strokeDashoffset = XP.ringC * (1 - pct / 100); });

    const duration = animate ? 1800 : 0;
    xpCountUp(xp$('score'), finalScore, { decimals: 2, duration });

    const band = xp$('xpRevealBand');
    band.textContent = res.analytics?.performanceLevel || '';
    band.style.setProperty('--band', res.analytics?.color || 'var(--accent)');
    band.classList.remove('is-in');
    setTimeout(() => band.classList.add('is-in'), XP.reduced ? 0 : duration * 0.75);

    xp$('xpScoreAnnounce').textContent = `Final score ${finalScore.toFixed(2)} out of ${res.scoring?.maxMarks}. Performance band: ${res.analytics?.performanceLevel || ''}.`;

    if (pct >= 80 && !XP.reduced) {
        setTimeout(() => {
            const r = document.querySelector('.xp-orb').getBoundingClientRect();
            xpBurst(r.left + r.width / 2, r.top + r.height / 2);
        }, duration * 0.85);
    }
}

function xpCountUp(el, to, opts = {}) {
    if (!el) return;
    const { decimals = 0, duration = 1400, suffix = '', from = 0 } = opts;
    const token = Symbol('count');
    el._xpCount = token;
    if (XP.reduced || duration <= 0) { el.textContent = `${to.toFixed(decimals)}${suffix}`; return; }
    const t0 = performance.now();
    const ease = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
    const step = (now) => {
        if (el._xpCount !== token) return;
        const p = Math.min(1, (now - t0) / duration);
        el.textContent = `${(from + (to - from) * ease(p)).toFixed(decimals)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function xpBurst(cx, cy) {
    const canvas = xp$('xpBurstCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const styles = getComputedStyle(document.documentElement);
    const colors = [styles.getPropertyValue('--stop-a').trim(), styles.getPropertyValue('--stop-b').trim(), '#ffffff', styles.getPropertyValue('--ok').trim()];
    const parts = Array.from({ length: 90 }, () => {
        const ang = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6.5;
        return { x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.5, r: 1.2 + Math.random() * 2.6, life: 1, decay: 0.01 + Math.random() * 0.012, c: colors[Math.floor(Math.random() * colors.length)] };
    });
    const tick = () => {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        let alive = 0;
        for (const p of parts) {
            if (p.life <= 0) continue;
            alive++;
            p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.06;
            p.x += p.vx; p.y += p.vy; p.life -= p.decay;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.c;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        if (alive) requestAnimationFrame(tick); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    requestAnimationFrame(tick);
}

// ---------- STORY CHAPTERS ----------
function xpOnResultRendered(res) {
    XP.played = {};
    const grade = xp$('dashGrade');
    if (grade) grade.style.setProperty('--band', res.analytics?.color || '#2563eb');
    xp$('xpStoryMax').textContent = `/ ${res.scoring?.maxMarks ?? 0}`;
    xp$('xpStoryScore').textContent = (Number(res.result?.finalScore) || 0).toFixed(2);
    ['xpAccRing', 'xpEffRing'].forEach(id => { xp$(id).style.strokeDashoffset = XP.ringC; });
    xp$('xpRangeFill').classList.remove('is-on');
    xp$('insightList').classList.remove('is-in');
    xpUpdateSimVisuals();
    requestAnimationFrame(() => XP.inView.forEach(n => xpPlayChapter(n)));
}

function xpPlayChapter(n) {
    const res = activeCanonicalResult;
    if (!res || XP.played[n]) return;
    XP.played[n] = true;
    const acc = parseFloat(res.result?.accuracy) || 0;
    const eff = parseFloat(res.result?.scorePercentage) || 0;

    if (n === 1) {
        xpCountUp(xp$('xpStoryScore'), Number(res.result?.finalScore) || 0, { decimals: 2, duration: 1500 });
        animateNumberCounter('dashAccuracy', acc, 1, '', '%');
        animateNumberCounter('dashEfficiency', eff, 1, '', '%');
        const set = (id, v) => { const el = xp$(id); el.style.strokeDashoffset = XP.ringC; void el.getBoundingClientRect(); requestAnimationFrame(() => { el.style.strokeDashoffset = XP.ringC * (1 - Math.max(0, Math.min(100, v)) / 100); }); };
        set('xpAccRing', acc);
        set('xpEffRing', eff);
    }
    if (n === 2) {
        const c = Number(res.scoring?.correct) || 0, w = Number(res.scoring?.wrong) || 0, s = Number(res.scoring?.skipped) || 0;
        xpCountUp(xp$('dashCorrect'), c, { duration: 1200 });
        xpCountUp(xp$('dashWrong'), w, { duration: 1200 });
        xpCountUp(xp$('dashSkipped'), s, { duration: 1200 });
        xpCountUp(xp$('dashPenalty'), Number(res.result?.penaltyMarks) || 0, { decimals: 2, duration: 1400 });
        const tot = c + w + s || 1;
        const segs = xp$('xpPropBar').querySelectorAll('i');
        [c, w, s].forEach((v, i) => { segs[i].style.flexBasis = '0%'; });
        requestAnimationFrame(() => [c, w, s].forEach((v, i) => { segs[i].style.flexBasis = `${(v / tot) * 100}%`; }));
    }
    if (n === 4) {
        const m = String(res.prediction?.percentileRange || '').match(/([\d.]+)%\s*-\s*([\d.]+)%/);
        const fill = xp$('xpRangeFill');
        if (m) {
            const lo = parseFloat(m[1]), hi = parseFloat(m[2]);
            fill.style.setProperty('--l', `${Math.min(98, lo)}%`);
            fill.style.setProperty('--w', `${Math.max(2, hi - lo)}%`);
        }
        fill.classList.remove('is-on'); void fill.offsetWidth; fill.classList.add('is-on');
    }
    if (n === 5) {
        const box = xp$('aiReportContent');
        const lines = box.innerText.split('\n');
        box.textContent = '';
        lines.forEach((line, i) => {
            const span = document.createElement('span');
            span.className = 'xp-line-reveal';
            span.style.setProperty('--i', i);
            span.textContent = line || '\u00a0';
            box.appendChild(span);
        });
        const list = xp$('insightList');
        list.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', i));
        list.classList.remove('is-in'); void list.offsetWidth; list.classList.add('is-in');
    }
    if (n === 6) {
        renderCurrentDashboardCharts(res);
    }
}

function xpBindStoryObservers() {
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObs.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.xp-reveal').forEach(el => revealObs.observe(el));

    const chapterObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            const n = parseInt(e.target.dataset.chapter, 10);
            if (e.isIntersecting) { XP.inView.add(n); xpPlayChapter(n); } else XP.inView.delete(n);
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.xp-chapter').forEach(el => chapterObs.observe(el));

    const stageObs = new IntersectionObserver(([e]) => {
        document.body.classList.toggle('xp-in-story', XP.step === 6 && e.intersectionRatio < 0.4);
    }, { threshold: [0, 0.4, 0.8] });
    stageObs.observe(xp$('xpStage'));
}

// ---------- SIMULATOR VISUALS ----------
function xpUpdateSimVisuals(morph = false) {
    ['simWrongToCorrect', 'simSkipToCorrect'].forEach(id => {
        const r = xp$(id);
        const max = parseFloat(r.max) || 0;
        r.disabled = max <= 0;
        r.style.setProperty('--fill', max > 0 ? `${(parseFloat(r.value) / max) * 100}%` : '0%');
    });
    const delta = xp$('simScoreDelta');
    const up = parseFloat(delta.textContent) > 0;
    delta.classList.toggle('is-up', up);
    if (morph && !XP.reduced) {
        const s = xp$('simProjectedScore');
        s.classList.remove('is-morph'); void s.offsetWidth; s.classList.add('is-morph');
    }
}

// ---------- MICRO-INTERACTIONS ----------
function xpBindMicroInteractions() {
    document.addEventListener('pointerdown', (e) => {
        const host = e.target.closest('.xp-btn, .fluent-btn, .xp-card, .xp-pill');
        if (!host || XP.reduced) return;
        const r = host.getBoundingClientRect();
        const dot = document.createElement('span');
        dot.className = 'xp-ripple';
        dot.style.left = `${e.clientX - r.left}px`;
        dot.style.top = `${e.clientY - r.top}px`;
        host.appendChild(dot);
        setTimeout(() => dot.remove(), 700);
    });

    if (!XP.finePointer || XP.reduced) return;

    document.querySelectorAll('[data-magnetic]').forEach(btn => {
        btn.addEventListener('pointermove', (e) => {
            const r = btn.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
            btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
        });
        btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    document.querySelectorAll('.xp-card').forEach(card => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--ry', `${(px - 0.5) * 10}deg`);
            card.style.setProperty('--rx', `${(0.5 - py) * 10}deg`);
            card.style.setProperty('--mx', `${px * 100}%`);
            card.style.setProperty('--my', `${py * 100}%`);
        });
        card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
}

// ---------- KEYBOARD, SWIPE, BUTTONS ----------
function xpOverlayOpen() {
    return !!document.querySelector('.history-drawer.active, .compare-modal.active, .full-report-modal.active');
}

function xpBindNavigation() {
    xp$('xpBegin').addEventListener('click', xpNext);
    xp$('xpNext').addEventListener('click', xpNext);
    xp$('xpBack').addEventListener('click', xpBack);
    xp$('xpEditInputs').addEventListener('click', () => xpGo(1, -1));
    xp$('xpReadStory').addEventListener('click', () => {
        xp$('xpChapter1').scrollIntoView({ behavior: XP.reduced ? 'auto' : 'smooth', block: 'start' });
    });
    document.querySelectorAll('.xp-rail-dot').forEach(dot => dot.addEventListener('click', () => xpJumpTo(parseInt(dot.dataset.go, 10))));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (xpOverlayOpen()) { toggleHistoryDrawer(false); toggleCompareModal(false); toggleFullReportModal(false); }
            return;
        }
        if (xpOverlayOpen() || document.body.classList.contains('xp-in-story')) return;
        const t = e.target;
        const tag = t.tagName;
        const inChoice = tag === 'INPUT' && (t.type === 'radio' || t.type === 'range');
        const isTyping = (tag === 'INPUT' && !inChoice) || tag === 'TEXTAREA' || tag === 'SELECT';
        if (t.closest && t.closest('.history-drawer, .compare-modal, .full-report-modal, .top-nav-bar')) return;

        if (e.key === 'Enter') {
            if (tag === 'BUTTON' || tag === 'A' || (t.getAttribute && t.getAttribute('role') === 'button')) return;
            e.preventDefault();
            if (t.id === 'studentName' && t.value.trim()) { xp$('testName').focus(); return; }
            if (XP.step === 6) { if (!XP.revealed) xp$('btnCalculate').click(); return; }
            xpNext();
            return;
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !isTyping && !inChoice) {
            e.preventDefault();
            if (e.key === 'ArrowRight') xpNext(); else xpBack();
        }
    });

    let sx = 0, sy = 0, tracking = false;
    const stage = xp$('xpStage');
    stage.addEventListener('touchstart', (e) => {
        const t = e.target;
        tracking = !(t.closest && t.closest('input[type="range"], .xp-strip'));
        sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
        if (!tracking) return;
        const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            if (dx < 0) { if (XP.step < 6) xpNext(); } else xpBack();
        }
    }, { passive: true });

    xp$('auth-container').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProfileTap(); }
    });
}

function xpBindLiveSync() {
    let queued = false;
    const queue = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; xpSyncControls(); });
    };
    document.addEventListener('input', (e) => {
        const t = e.target;
        if (t.matches && t.matches('.xp-num input')) xpTick(t);
        if (t.classList) t.classList.remove('validation-error');
        const stepEl = t.closest && t.closest('.xp-step');
        if (stepEl) xpClearFeedback(stepEl);
        queue();
    });
    document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.select-box-option')) queue(); });
    ['simWrongToCorrect', 'simSkipToCorrect'].forEach(id => xp$(id).addEventListener('input', () => xpUpdateSimVisuals(true)));
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    try {
        html.classList.add('xp');
        xpSteps().forEach((s, i) => { s.inert = i !== 0; });
        xpBindChoiceControls();
        xpBindSteppers();
        xpObserveChips();
        xpBindStoryObservers();
        xpBindMicroInteractions();
        xpBindNavigation();
        xpBindLiveSync();
        xpSyncControls();
        setTimeout(() => closeTooltip(), 11000);
        if (window.Chart) {
            Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
            if (XP.reduced) Chart.defaults.animation = false;
        }
    } catch (err) {
        console.error('ECLIPSE7 experience layer failed, falling back to classic form:', err);
        html.classList.remove('xp');
        xpSteps().forEach(s => { s.inert = false; });
    }
});
