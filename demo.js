// demo.js
import { 
    caesarEncrypt, 
    caesarDecrypt, 
    vigenereEncrypt, 
    vigenereDecrypt, 
    reverseText, 
    swapCase, 
    enigmaProcess 
} from './ciphers.js';

// Sound controller powered by Web Audio API
class SoundController {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    playKey() {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700 + Math.random() * 400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }
    
    playDial() {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.setValueAtTime(300, this.ctx.currentTime + 0.02);
        
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }
    
    playCompile() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.5);
        
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.start();
        osc.stop(now + 0.5);
    }

    playSuccess() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C major arpeggio
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0.08, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);
        });
    }
}

const sounds = new SoundController();

// Levels Data
const LEVELS = [
    {
        id: 1,
        title: "OPERATION TURING_BEGIN",
        story: "We have intercepted a basic transmission from a scout ship near Bletchley. They appear to be using a simple Caesar cipher. Decode the intercept to uncover Alan Turing's message.",
        objective: "Shift the ciphertext backward by 3 characters to decrypt.",
        ciphertext: "L ORYH DODQ WXULQJ",
        expected: "I LOVE ALAN TURING",
        defaultRotors: ["A", "A"],
        commandText: "shift left by 3"
    },
    {
        id: 2,
        title: "OPERATION SOLSTICE_SHADOW",
        story: "The German Navy has double-encrypted a weather report. The signal has been reversed, then shifted forward by 3. You must reverse the process to read it.",
        objective: "Reverse the text, then shift characters backward by 3.",
        ciphertext: "HFLWVORV",
        expected: "SOLSTICE",
        defaultRotors: ["A", "A"],
        commandText: "reverse the text, then shift left by 3"
    },
    {
        id: 3,
        title: "OPERATION PRIDE_KEY",
        story: "Enigma logs show agents are using a Vigenère Cipher. Our double-agents report they used the keyword 'PRIDE' to encrypt this intercept.",
        objective: "Decrypt the ciphertext using Vigenère with keyword 'PRIDE'.",
        ciphertext: "HFTVXXTM",
        expected: "SOLSTICE",
        defaultRotors: ["A", "A"],
        commandText: "decrypt using vigenere with key PRIDE"
    },
    {
        id: 4,
        title: "OPERATION ENIGMA_ROTOR",
        story: "A high-priority dispatch has been sent using a full two-rotor Enigma configuration. We suspect the starting rotor positions are set to the initials of the June Solstice: Rotor I starting at J (position 9) and Rotor II starting at S (position 18). Set the dials and process the text.",
        objective: "Set Rotor I to 'J', Rotor II to 'S', and decode using the Enigma processor.",
        ciphertext: "BGFASB OUEF",
        expected: "TURING TEST",
        defaultRotors: ["J", "S"],
        commandText: "set rotor 1 to J, rotor 2 to S, then decode using enigma"
    }
];

// Demo Automation Steps
let currentLevelIdx = 0;
let rotor1Val = 0;
let rotor2Val = 0;
let completedLevels = new Set();
let timerId = null;

// DOM Elements
const levelStoryEl = document.getElementById('level-story');
const levelObjectiveEl = document.getElementById('level-objective');
const levelSelectorEl = document.getElementById('level-selector');
const ciphertextDisplay = document.getElementById('ciphertext-display');
const plaintextDisplay = document.getElementById('plaintext-display');
const rotor1ValEl = document.getElementById('rotor-1-val');
const rotor2ValEl = document.getElementById('rotor-2-val');
const terminalLogEl = document.getElementById('terminal-log');
const consoleInput = document.getElementById('console-input');
const submitBtn = document.getElementById('submit-btn');
const soundToggleBtn = document.getElementById('sound-toggle');
const victoryModal = document.getElementById('victory-modal');
const nextLevelBtn = document.getElementById('next-level-btn');
const victoryTextEl = document.getElementById('victory-text');

// Initialize Demo Mode
function initDemo() {
    renderLevelSelector();
    loadLevel(currentLevelIdx);
    
    // Toggle Sound Listener
    soundToggleBtn.addEventListener('click', () => {
        sounds.enabled = !sounds.enabled;
        soundToggleBtn.innerText = sounds.enabled ? "🔊 SOUND ON" : "🔇 SOUND OFF";
        if (sounds.enabled) sounds.playDial();
    });

    // Start automated sequence
    logToTerminal("[DEMO] Starting Bletchley Hut 8 Co-Processor Automation.", "hint-msg");
    scheduleNextStep(2000);
}

// Render selector tabs
function renderLevelSelector() {
    levelSelectorEl.innerHTML = '';
    LEVELS.forEach((level, idx) => {
        const btn = document.createElement('button');
        btn.className = `level-btn ${idx === currentLevelIdx ? 'active' : ''} ${completedLevels.has(level.id) ? 'completed' : ''}`;
        
        const name = document.createElement('span');
        name.innerText = level.title;
        btn.appendChild(name);
        
        const status = document.createElement('span');
        status.className = 'level-status-tag';
        status.innerText = completedLevels.has(level.id) ? '● RESOLVED' : '○ QUEUED';
        btn.appendChild(status);
        
        levelSelectorEl.appendChild(btn);
    });
}

// Load Level Data
function loadLevel(idx) {
    const level = LEVELS[idx];
    levelStoryEl.innerText = level.story;
    levelObjectiveEl.innerText = level.objective;
    ciphertextDisplay.innerText = level.ciphertext;
    plaintextDisplay.innerText = "...";
    plaintextDisplay.classList.remove('success-text');

    // Set default rotor positions
    rotor1Val = level.defaultRotors[0].charCodeAt(0) - 65;
    rotor2Val = level.defaultRotors[1].charCodeAt(0) - 65;
    updateRotorUI();

    logToTerminal(`[SYSTEM] Loaded Operation ${level.title}.`, "system-msg");
}

function updateRotorUI() {
    rotor1ValEl.innerText = String.fromCharCode(65 + rotor1Val);
    rotor2ValEl.innerText = String.fromCharCode(65 + rotor2Val);
}

function logToTerminal(message, className) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    entry.innerText = message;
    terminalLogEl.appendChild(entry);
    terminalLogEl.scrollTop = terminalLogEl.scrollHeight;
}

// Schedule the automated typing and executing sequence
function scheduleNextStep(delay) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(runAutomatedLevel, delay);
}

// Automated execution run
function runAutomatedLevel() {
    const level = LEVELS[currentLevelIdx];
    const textToType = level.commandText;

    // 1. Simulate typing letter by letter
    simulateTypewriter(textToType, () => {
        // 2. Play compile sound
        sounds.playCompile();
        logToTerminal(`CO-PROCESSOR> ${textToType}`, "player-msg");
        consoleInput.value = '';

        plaintextDisplay.innerText = "COMPILING LOGIC...";
        
        // 3. Compile local simulation commands
        setTimeout(() => {
            const operations = runSimulatedCompiler(textToType);
            logToTerminal(`[COMPILER] Operations compiled: ${JSON.stringify(operations)}`, "compiler-msg");
            
            // 4. Animate Decryption
            animateDecryptionPipeline(operations);
        }, 1000);
    });
}

// Typewriter visual typing animation
function simulateTypewriter(text, callback) {
    let charIndex = 0;
    consoleInput.value = '';
    
    function typeNextChar() {
        if (charIndex < text.length) {
            consoleInput.value += text[charIndex];
            sounds.playKey();
            charIndex++;
            setTimeout(typeNextChar, 70 + Math.random() * 60);
        } else {
            setTimeout(callback, 800);
        }
    }
    typeNextChar();
}

// Parse simulator commands
function runSimulatedCompiler(input) {
    const ops = [];
    const text = input.toLowerCase();

    if (text.includes("shift") || text.includes("caesar")) {
        const matches = text.match(/-?\d+/);
        let shift = matches ? parseInt(matches[0]) : 0;
        if (text.includes("back") || text.includes("left") || text.includes("backward")) {
            if (shift > 0) shift = -shift;
            else if (shift === 0) shift = -3;
        } else if (shift === 0) {
            shift = 3;
        }
        ops.push({ type: "caesar", shift });
    }

    if (text.includes("reverse") || text.includes("invert")) {
        ops.push({ type: "reverse" });
    }

    if (text.includes("vigenere") || text.includes("key")) {
        const keyMatch = input.match(/key\s+([A-Za-z]+)/i) || input.match(/vigenere\s+([A-Za-z]+)/i);
        const key = keyMatch ? keyMatch[1].toUpperCase() : "PRIDE";
        ops.push({ type: "vigenere", key });
    }

    if (text.includes("swap") || text.includes("case")) {
        ops.push({ type: "swapcase" });
    }

    if (text.includes("enigma") || text.includes("rotor")) {
        const letters = input.match(/\b([A-Z])\b/g);
        let r1 = rotor1Val;
        let r2 = rotor2Val;
        if (letters && letters.length >= 2) {
            r1 = letters[0].charCodeAt(0) - 65;
            r2 = letters[1].charCodeAt(0) - 65;
        }
        ops.push({ type: "enigma", rotor1: r1, rotor2: r2 });
    }

    return ops;
}

// Animate dials during decrypt
function animateDecryptionPipeline(operations) {
    let result = LEVELS[currentLevelIdx].ciphertext;
    let step = 0;

    function executeNextStep() {
        if (step >= operations.length) {
            // Done
            plaintextDisplay.innerText = result;
            plaintextDisplay.classList.add('success-text');
            checkVictory(result);
            return;
        }

        const op = operations[step];
        logToTerminal(`[RUNNING] Step ${step + 1}: ${op.type.toUpperCase()}...`, "system-msg");

        switch (op.type) {
            case "caesar":
                result = caesarEncrypt(result, op.shift);
                break;
            case "vigenere":
                result = vigenereDecrypt(result, op.key);
                break;
            case "reverse":
                result = reverseText(result);
                break;
            case "swapcase":
                result = swapCase(result);
                break;
            case "enigma":
                if (op.rotor1 !== undefined) rotor1Val = op.rotor1 % 26;
                if (op.rotor2 !== undefined) rotor2Val = op.rotor2 % 26;
                updateRotorUI();
                result = enigmaProcess(result, rotor1Val, rotor2Val);
                break;
        }

        // Mechanical Dial Spinning Animation
        let rotateCount = 0;
        const interval = setInterval(() => {
            sounds.playDial();
            rotor1Val = (rotor1Val + 1) % 26;
            rotor2Val = (rotor2Val + 3) % 26;
            updateRotorUI();
            rotateCount++;
            
            if (rotateCount > 6) {
                clearInterval(interval);
                if (op.type === "enigma") {
                    rotor1Val = op.rotor1 % 26;
                    rotor2Val = op.rotor2 % 26;
                } else {
                    rotor1Val = (rotor1Val + (step * 2)) % 26;
                }
                updateRotorUI();
                step++;
                executeNextStep();
            }
        }, 60);
    }

    executeNextStep();
}

function checkVictory(text) {
    const expected = LEVELS[currentLevelIdx].expected;
    if (text.trim().toUpperCase() === expected.toUpperCase()) {
        sounds.playSuccess();
        completedLevels.add(LEVELS[currentLevelIdx].id);
        renderLevelSelector();
        
        victoryTextEl.innerText = `Decryption Verified: "${expected}". Proceeding to next intercept in 3 seconds...`;
        victoryModal.classList.add('show');
        
        setTimeout(() => {
            victoryModal.classList.remove('show');
            
            // Advance level
            if (currentLevelIdx < LEVELS.length - 1) {
                currentLevelIdx++;
                loadLevel(currentLevelIdx);
                renderLevelSelector();
                scheduleNextStep(2000);
            } else {
                // Restart demo
                logToTerminal("[DEMO COMPLETE] All intercepts decoded successfully. Restarting simulation...", "hint-msg");
                currentLevelIdx = 0;
                completedLevels.clear();
                setTimeout(() => {
                    loadLevel(currentLevelIdx);
                    renderLevelSelector();
                    scheduleNextStep(2000);
                }, 3000);
            }
        }, 3000);
    } else {
        logToTerminal("[SYSTEM] Simulated validation mismatch. Restarting level.", "error-msg");
        scheduleNextStep(3000);
    }
}

window.addEventListener('DOMContentLoaded', initDemo);
