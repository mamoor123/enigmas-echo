// verify_gemini.js
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("ERROR: No GEMINI_API_KEY or GOOGLE_API_KEY found in environment variables.");
    console.log("Please run the command with your API key set, like:");
    console.log("  $env:GEMINI_API_KEY='your_key_here'; node verify_gemini.js");
    process.exit(1);
}

async function verifyGemini(command) {
    console.log(`Sending command: "${command}" to Gemini...`);
    
    const prompt = `Translate this cryptanalysis command into a JSON array of operations: "${command}".
    Supported operations:
    1. {"type": "caesar", "shift": integer} -> Shift characters forward/backward
    2. {"type": "vigenere", "key": "string"} -> Vigenere decode using key
    3. {"type": "reverse"} -> Reverse all characters
    4. {"type": "swapcase"} -> Swap uppercase/lowercase sizing
    5. {"type": "enigma", "rotor1": integer, "rotor2": integer} -> Run Enigma rotor processor with rotor1 position (0-25) and rotor2 position (0-25)

    Format output as a raw JSON array only. Do not wrap in markdown or backticks. If you cannot parse, return [].`;

    try {
        const response = await fetch(`https://generativetext.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const cleanText = data.candidates[0].content.parts[0].text.trim();
        console.log("Response text:", cleanText);
        const parsed = JSON.parse(cleanText);
        console.log("Successfully parsed JSON operations:", parsed);
        console.log("\nVERIFICATION SUCCESSFUL: Gemini parsed natural language into operations successfully.");
    } catch (err) {
        console.error("VERIFICATION FAILED:", err.message);
    }
}

verifyGemini("please reverse the text, shift left by 3 and swap the case");
