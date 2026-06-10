// ciphers.js

/**
 * Caesar Cipher encryption
 * Shifts alphabetic characters forward by the specified offset.
 */
export function caesarEncrypt(text, shift) {
    shift = ((shift % 26) + 26) % 26;
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
    }).join('');
}

/**
 * Caesar Cipher decryption (inverse of encryption)
 */
export function caesarDecrypt(text, shift) {
    return caesarEncrypt(text, -shift);
}

/**
 * Vigenere Cipher encryption
 * Shifts alphabetic characters based on a shifting keyword.
 */
export function vigenereEncrypt(text, key) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (key.length === 0) return text;
    let keyIndex = 0;
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        const shift = key.charCodeAt(keyIndex % key.length) - 65;
        if (code >= 65 && code <= 90) {
            keyIndex++;
            return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
            keyIndex++;
            return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
    }).join('');
}

/**
 * Vigenere Cipher decryption
 */
export function vigenereDecrypt(text, key) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (key.length === 0) return text;
    let keyIndex = 0;
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        const shift = 26 - (key.charCodeAt(keyIndex % key.length) - 65);
        if (code >= 65 && code <= 90) {
            keyIndex++;
            return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
            keyIndex++;
            return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
    }).join('');
}

/**
 * Reverses the input string.
 */
export function reverseText(text) {
    return text.split('').reverse().join('');
}

/**
 * Swaps uppercase to lowercase and vice versa.
 */
export function swapCase(text) {
    return text.split('').map(char => {
        if (char === char.toUpperCase()) {
            return char.toLowerCase();
        }
        return char.toUpperCase();
    }).join('');
}

// Fixed Enigma wiring tables (historical Enigma I rotors)
const ROTOR_I = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const ROTOR_II = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
const ROTOR_REFLECTOR = "YRUHQSLDPXNGOKMIEBFZCWVJAT"; // Reflector B

/**
 * Simplified Enigma Rotor mapping simulation.
 * It passes each letter through:
 * Input -> Rotor 1 -> Rotor 2 -> Reflector -> Rotor 2 (Inv) -> Rotor 1 (Inv) -> Output
 * Rotors advance after every encoded letter.
 */
export function enigmaProcess(text, rotor1Pos = 0, rotor2Pos = 0) {
    let r1 = rotor1Pos % 26;
    let r2 = rotor2Pos % 26;
    
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        const isUpper = code >= 65 && code <= 90;
        const isLower = code >= 97 && code <= 122;
        
        if (!isUpper && !isLower) return char;
        
        const val = isUpper ? code - 65 : code - 97;
        
        // Rotors step forward
        r1 = (r1 + 1) % 26;
        if (r1 === 0) {
            r2 = (r2 + 1) % 26;
        }
        
        // 1. Forward through Rotor I
        let current = (val + r1) % 26;
        let mapped = ROTOR_I.charCodeAt(current) - 65;
        mapped = (mapped - r1 + 26) % 26;
        
        // 2. Forward through Rotor II
        mapped = (mapped + r2) % 26;
        mapped = ROTOR_II.charCodeAt(mapped) - 65;
        mapped = (mapped - r2 + 26) % 26;
        
        // 3. Reflector B
        mapped = ROTOR_REFLECTOR.charCodeAt(mapped) - 65;
        
        // 4. Inverse through Rotor II
        mapped = (mapped + r2) % 26;
        mapped = ROTOR_II.indexOf(String.fromCharCode(mapped + 65));
        mapped = (mapped - r2 + 26) % 26;
        
        // 5. Inverse through Rotor I
        mapped = (mapped + r1) % 26;
        mapped = ROTOR_I.indexOf(String.fromCharCode(mapped + 65));
        mapped = (mapped - r1 + 26) % 26;
        
        return String.fromCharCode(mapped + (isUpper ? 65 : 97));
    }).join('');
}
