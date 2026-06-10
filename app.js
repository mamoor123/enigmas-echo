// app.js
import { 
    caesarEncrypt, 
    caesarDecrypt, 
    vigenereEncrypt, 
    vigenereDecrypt, 
    reverseText, 
    swapCase, 
    enigmaProcess 
} from './ciphers.js';

// Sound controller powered by Web Audio API (no external asset dependencies)
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

    playError() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(110, now + 0.1);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        osc.start();
        osc.stop(now + 0.25);
    }
}

const sounds = new SoundController();

// Levels Database
const LEVELS = [
    {
        id: 1,
        title: "OPERATION TURING_BEGIN",
        story: "We have intercepted a basic transmission from a scout ship near Bletchley. They appear to be using a simple Caesar cipher. Decode the intercept to uncover Alan Turing's message.",
        objective: "Shift the ciphertext backward by 3 characters to decrypt.",
        ciphertext: "L ORYH DODQ WXULQJ",
        expected: "I LOVE ALAN TURING",
        hint: "Try typing: 'shift back by 3' or 'shift left 3'",
        defaultRotors: ["A", "A"]
    },
    {
        id: 2,
        title: "OPERATION SOLSTICE_SHADOW",
        story: "The German Navy has double-encrypted a weather report. The signal has been reversed, then shifted forward by 3. You must reverse the process to read it.",
        objective: "Reverse the text, then shift characters backward by 3.",
        ciphertext: "HFLWVORV",
        expected: "SOLSTICE",
        hint: "Try typing: 'reverse the message, then shift by -3'",
        defaultRotors: ["A", "A"]
    },
    {
        id: 3,
        title: "OPERATION PRIDE_KEY",
        story: "Enigma logs show agents are using a Vigenère Cipher. Our double-agents report they used the keyword 'PRIDE' to encrypt this intercept.",
        objective: "Decrypt the ciphertext using Vigenère with keyword 'PRIDE'.",
        ciphertext: "HFTVXXTM",
        expected: "SOLSTICE",
        hint: "Try typing: 'decrypt using vigenere with key PRIDE'",
        defaultRotors: ["A", "A"]
    },
    {
        id: 4,
        title: "OPERATION ENIGMA_ROTOR",
        story: "A high-priority dispatch has been sent using a full two-rotor Enigma configuration. We suspect the starting rotor positions are set to the initials of the June Solstice: Rotor I starting at J (position 9) and Rotor II starting at S (position 18). Set the dials and process the text.",
        objective: "Set Rotor I to 'J', Rotor II to 'S', and decode using the Enigma processor.",
        ciphertext: "BGFASB OUEF",
        expected: "TURING TEST",
        hint: "Try typing: 'set rotor 1 to J, rotor 2 to S, then decode using enigma'",
        defaultRotors: ["J", "S"]
    }
];

// App State
let currentLevelIdx = 0;
let completedLevels = new Set(JSON.parse(localStorage.getItem('completed_levels') || '[]'));
let rotor1Val = 0; // 0 = A, 25 = Z
let rotor2Val = 0;
let geminiApiKey = localStorage.getItem('gemini_api_key') || '';

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
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const apiKeyInput = document.getElementById('api-key-input');
const victoryModal = document.getElementById('victory-modal');
const nextLevelBtn = document.getElementById('next-level-btn');
const victoryTextEl = document.getElementById('victory-text');

// Initialize Game
function init() {
    // Set up settings field
    if (geminiApiKey) {
        apiKeyInput.value = geminiApiKey;
        consoleInput.disabled = false;
        submitBtn.disabled = false;
        consoleInput.placeholder = "Enter instructions for the Bombe (e.g. 'Shift left 3')...";
        logToTerminal("[SYSTEM] Gemini API connected successfully.", "system-msg");
    } else {
        consoleInput.disabled = false;
        submitBtn.disabled = false;
        consoleInput.placeholder = "Enter instructions (Simulated Mode - no API key configured)...";
        logToTerminal("[SYSTEM] Running in local simulation mode. Insert a Gemini key to unlock advanced natural language interpretation.", "hint-msg");
    }

    renderLevelSelector();
    loadLevel(currentLevelIdx);
    setupEventListeners();
}

// Render level list in sidebar
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
        status.innerText = completedLevels.has(level.id) ? '● RESOLVED' : '○ LOCKED';
        btn.appendChild(status);
        
        btn.addEventListener('click', () => {
            sounds.playDial();
            currentLevelIdx = idx;
            loadLevel(currentLevelIdx);
            document.querySelectorAll('.level-btn').forEach((b, i) => {
                b.classList.toggle('active', i === currentLevelIdx);
            });
        });
        
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

    logToTerminal(`[SYSTEM] Loaded operation ${level.title}.`, "system-msg");
}

// Update rotor UI display values
function updateRotorUI() {
    rotor1ValEl.innerText = String.fromCharCode(65 + rotor1Val);
    rotor2ValEl.innerText = String.fromCharCode(65 + rotor2Val);
}

// Log message to the CRT screen terminal feed
function logToTerminal(message, className) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    entry.innerText = message;
    terminalLogEl.appendChild(entry);
    terminalLogEl.scrollTop = terminalLogEl.scrollHeight;
}

// Event Listeners
function setupEventListeners() {
    // Keyboard clicking sounds
    consoleInput.addEventListener('input', () => {
        sounds.playKey();
    });

    submitBtn.addEventListener('click', handleCommandSubmit);
    consoleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleCommandSubmit();
        }
    });

    // Rotor interactive adjust buttons
    document.querySelector('#rotor-1 .rotor-arrow-up').addEventListener('click', () => {
        sounds.playDial();
        rotor1Val = (rotor1Val + 1) % 26;
        updateRotorUI();
        triggerFastDecryption();
    });
    document.querySelector('#rotor-1 .rotor-arrow-down').addEventListener('click', () => {
        sounds.playDial();
        rotor1Val = (rotor1Val - 1 + 26) % 26;
        updateRotorUI();
        triggerFastDecryption();
    });
    document.querySelector('#rotor-2 .rotor-arrow-up').addEventListener('click', () => {
        sounds.playDial();
        rotor2Val = (rotor2Val + 1) % 26;
        updateRotorUI();
        triggerFastDecryption();
    });
    document.querySelector('#rotor-2 .rotor-arrow-down').addEventListener('click', () => {
        sounds.playDial();
        rotor2Val = (rotor2Val - 1 + 26) % 26;
        updateRotorUI();
        triggerFastDecryption();
    });

    // Sounds toggler
    soundToggleBtn.addEventListener('click', () => {
        sounds.enabled = !sounds.enabled;
        soundToggleBtn.innerText = sounds.enabled ? "🔊 SOUND ON" : "🔇 SOUND OFF";
        if (sounds.enabled) sounds.playDial();
    });

    // Modals bindings
    settingsBtn.addEventListener('click', () => {
        sounds.playDial();
        settingsModal.classList.add('show');
    });
    
    closeSettingsBtn.addEventListener('click', () => {
        sounds.playDial();
        settingsModal.classList.remove('show');
    });

    saveSettingsBtn.addEventListener('click', () => {
        sounds.playDial();
        geminiApiKey = apiKeyInput.value.trim();
        localStorage.setItem('gemini_api_key', geminiApiKey);
        settingsModal.classList.remove('show');
        
        if (geminiApiKey) {
            consoleInput.placeholder = "Enter instructions for the Bombe (e.g. 'Shift left 3')...";
            logToTerminal("[SYSTEM] Gemini key saved. Co-processor online.", "system-msg");
        } else {
            consoleInput.placeholder = "Enter instructions (Simulated Mode - no API key configured)...";
            logToTerminal("[SYSTEM] Disconnected key. Reverting to local simulation mode.", "hint-msg");
        }
    });

    nextLevelBtn.addEventListener('click', () => {
        sounds.playDial();
        victoryModal.classList.remove('show');
        if (currentLevelIdx < LEVELS.length - 1) {
            currentLevelIdx++;
            loadLevel(currentLevelIdx);
            renderLevelSelector();
        }
    });
}

// Trigger decryption without recompiling the AI instructions
function triggerFastDecryption() {
    // If there was a previous compilation run, re-run operations on the default level ciphertext
    // This allows manual rotor changes to immediately decrypt Level 4
    if (currentLevelIdx === 3) {
        const out = enigmaProcess(LEVELS[3].ciphertext, rotor1Val, rotor2Val);
        plaintextDisplay.innerText = out;
        checkVictory(out);
    }
}

// Local regex compiler for offline/no-key mode
function runSimulatedCompiler(input) {
    const ops = [];
    const text = input.toLowerCase();

    // Parse Caesar shifting
    if (text.includes("shift") || text.includes("caesar")) {
        const matches = text.match(/-?\d+/);
        let shift = matches ? parseInt(matches[0]) : 0;
        
        // Handle word directions
        if (text.includes("back") || text.includes("left") || text.includes("backward")) {
            if (shift > 0) shift = -shift;
            else if (shift === 0) shift = -3; // Default caesar shift back
        } else if (shift === 0) {
            shift = 3; // Default caesar shift forward
        }
        ops.push({ type: "caesar", shift });
    }

    // Parse reversal
    if (text.includes("reverse") || text.includes("invert")) {
        ops.push({ type: "reverse" });
    }

    // Parse Vigenere ciphers
    if (text.includes("vigenere") || text.includes("key")) {
        const keyMatch = input.match(/key\s+([A-Za-z]+)/i) || input.match(/vigenere\s+([A-Za-z]+)/i);
        const key = keyMatch ? keyMatch[1].toUpperCase() : "PRIDE";
        ops.push({ type: "vigenere", key });
    }

    // Parse case swaps
    if (text.includes("swap") || text.includes("case")) {
        ops.push({ type: "swapcase" });
    }

    // Parse Enigma setting commands
    if (text.includes("enigma") || text.includes("rotor")) {
        // Look for rotor values set (e.g. "rotor 1 to J, rotor 2 to S")
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

// Handle Command Compile & Execution
async function handleCommandSubmit() {
    const commandText = consoleInput.value.trim();
    if (!commandText) return;

    sounds.playCompile();
    logToTerminal(`CO-PROCESSOR> ${commandText}`, "player-msg");
    consoleInput.value = '';

    // Disable input while compiling
    consoleInput.disabled = true;
    submitBtn.disabled = true;
    plaintextDisplay.innerText = "COMPILING LOGIC...";

    let operations = [];

    if (geminiApiKey) {
        try {
            operations = await compileCommandWithGemini(commandText);
        } catch (err) {
            logToTerminal(`[COMPILER ERROR] API failed. Falling back to local simulation compiler.`, "error-msg");
            operations = runSimulatedCompiler(commandText);
        }
    } else {
        // Run simulated parser
        operations = runSimulatedCompiler(commandText);
    }

    // Execute operations list on the ciphertext
    if (operations.length > 0) {
        logToTerminal(`[COMPILER] Operations compiled: ${JSON.stringify(operations)}`, "compiler-msg");
        animateDecryptionPipeline(operations);
    } else {
        logToTerminal(`[COMPILER] Failed to compile command. Check instructions.`, "error-msg");
        plaintextDisplay.innerText = "COMPILATION ERROR";
        consoleInput.disabled = false;
        submitBtn.disabled = false;
    }
}

// Call Gemini API to parse natural language into operational steps
async function compileCommandWithGemini(command) {
    const prompt = `Translate this cryptanalysis command into a JSON array of operations: "${command}".
    Supported operations:
    1. {"type": "caesar", "shift": integer} -> Shift characters forward/backward
    2. {"type": "vigenere", "key": "string"} -> Vigenere decode using key
    3. {"type": "reverse"} -> Reverse all characters
    4. {"type": "swapcase"} -> Swap uppercase/lowercase sizing
    5. {"type": "enigma", "rotor1": integer, "rotor2": integer} -> Run Enigma rotor processor with rotor1 position (0-25) and rotor2 position (0-25)

    Format output as a raw JSON array only. Do not wrap in markdown or backticks. If you cannot parse, return [].`;

    const response = await fetch(`https://generativetext.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        throw new Error("Failed to contact Gemini API");
    }

    const data = await response.json();
    const cleanText = data.candidates[0].content.parts[0].text.trim();
    return JSON.parse(cleanText);
}

// Animate the decoding steps visually across the Bombe rotors
function animateDecryptionPipeline(operations) {
    let result = LEVELS[currentLevelIdx].ciphertext;
    let step = 0;

    function executeNextStep() {
        if (step >= operations.length) {
            // Processing done
            plaintextDisplay.innerText = result;
            plaintextDisplay.classList.add('success-text');
            consoleInput.disabled = false;
            submitBtn.disabled = false;
            checkVictory(result);
            return;
        }

        const op = operations[step];
        logToTerminal(`[RUNNING] Step ${step + 1}: ${op.type.toUpperCase()}...`, "system-msg");

        // Execute specific step
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
                // Set rotor dials
                if (op.rotor1 !== undefined) rotor1Val = op.rotor1 % 26;
                if (op.rotor2 !== undefined) rotor2Val = op.rotor2 % 26;
                updateRotorUI();
                result = enigmaProcess(result, rotor1Val, rotor2Val);
                break;
        }

        // Rotor dial rotation visual effect
        let rotateCount = 0;
        const interval = setInterval(() => {
            sounds.playDial();
            rotor1Val = (rotor1Val + 1) % 26;
            rotor2Val = (rotor2Val + 3) % 26;
            updateRotorUI();
            rotateCount++;
            
            if (rotateCount > 6) {
                clearInterval(interval);
                // Reset positions to final values representing step
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

// Check if decrypted text matches the expected solution
function checkVictory(text) {
    const expected = LEVELS[currentLevelIdx].expected;
    if (text.trim().toUpperCase() === expected.toUpperCase()) {
        sounds.playSuccess();
        completedLevels.add(LEVELS[currentLevelIdx].id);
        localStorage.setItem('completed_levels', JSON.stringify(Array.from(completedLevels)));
        
        victoryTextEl.innerText = `Decryption Verified: "${expected}". Excellent progress cryptanalyst. Operation completed.`;
        victoryModal.classList.add('show');
        renderLevelSelector();
    } else {
        sounds.playError();
    }
}

// Launch app on load
window.addEventListener('DOMContentLoaded', init);
