// State
let appKeyPair = null;

// DOM Elements
const generateKeysBtn = document.getElementById('generateKeysBtn');
const privateKeyOutput = document.getElementById('privateKeyOutput');
const publicKeyOutput = document.getElementById('publicKeyOutput');

const messageInput = document.getElementById('messageInput');
const signMessageBtn = document.getElementById('signMessageBtn');
const hashOutput = document.getElementById('hashOutput');
const signatureOutput = document.getElementById('signatureOutput');

const verifyMessageInput = document.getElementById('verifyMessageInput');
const verifySignatureInput = document.getElementById('verifySignatureInput');
const verifyBtn = document.getElementById('verifyBtn');
const verificationResult = document.getElementById('verificationResult');

// Utility to convert ArrayBuffer to Base64 string
function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Utility to convert Base64 string to ArrayBuffer
function base64ToBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// Format pem key
function sanitizePem(pem) {
    // Remove headers, footers and whitespace
    return pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
}

// 1. Generate Keys
generateKeysBtn.addEventListener('click', async () => {
    try {
        generateKeysBtn.textContent = 'Generating...';
        generateKeysBtn.disabled = true;

        // Generate RSA-PSS Key Pair with SHA-256
        appKeyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-PSS",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true, // extractable
            ["sign", "verify"]
        );

        // Export Private Key (PKCS8)
        const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", appKeyPair.privateKey);
        const privateKeyB64 = bufferToBase64(exportedPrivateKey);
        privateKeyOutput.value = `-----BEGIN PRIVATE KEY-----\n${privateKeyB64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;

        // Export Public Key (SPKI)
        const exportedPublicKey = await window.crypto.subtle.exportKey("spki", appKeyPair.publicKey);
        const publicKeyB64 = bufferToBase64(exportedPublicKey);
        publicKeyOutput.value = `-----BEGIN PUBLIC KEY-----\n${publicKeyB64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

        signMessageBtn.disabled = false;
        generateKeysBtn.textContent = 'Keys Generated ✓';
        
        checkVerifyInputs();
    } catch (error) {
        console.error("Key Generation Error:", error);
        alert("Failed to generate keys.");
        generateKeysBtn.textContent = 'Generate Key Pair';
        generateKeysBtn.disabled = false;
    }
});

// Calculate and show real-time Hash of message
messageInput.addEventListener('input', async () => {
    const message = messageInput.value;
    if (!message) {
        hashOutput.textContent = 'Waiting for input...';
        return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    hashOutput.textContent = hashHex;
});

// 2. Sign Message
signMessageBtn.addEventListener('click', async () => {
    if (!appKeyPair) {
        alert("Please generate keys first.");
        return;
    }

    const message = messageInput.value;
    if (!message) {
        alert("Please enter a message to sign.");
        return;
    }

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        // Sign the data using Private Key
        const signature = await window.crypto.subtle.sign(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            appKeyPair.privateKey,
            data
        );

        // Output signature as Base64
        const signatureB64 = bufferToBase64(signature);
        signatureOutput.value = signatureB64;
        
        // Auto-fill verification fields for convenience
        verifyMessageInput.value = message;
        verifySignatureInput.value = signatureB64;
        checkVerifyInputs();

    } catch (error) {
        console.error("Signing Error:", error);
        alert("Failed to sign message.");
    }
});

// Enable/Disable Verify button based on inputs
function checkVerifyInputs() {
    verifyBtn.disabled = !(verifyMessageInput.value && verifySignatureInput.value && publicKeyOutput.value);
}
verifyMessageInput.addEventListener('input', checkVerifyInputs);
verifySignatureInput.addEventListener('input', checkVerifyInputs);
publicKeyOutput.addEventListener('input', checkVerifyInputs);

// 3. Verify Signature
verifyBtn.addEventListener('click', async () => {
    const message = verifyMessageInput.value;
    const signatureB64 = verifySignatureInput.value.trim();
    const publicKeyPem = publicKeyOutput.value;

    if (!message || !signatureB64 || !publicKeyPem) {
        alert("Original message, signature, and public key are required for verification.");
        return;
    }

    try {
        verificationResult.className = 'status-box';
        verificationResult.textContent = 'Verifying...';

        // 1. Import the Public Key
        const publicKeyB64Text = sanitizePem(publicKeyPem);
        const publicKeyBuffer = base64ToBuffer(publicKeyB64Text);
        
        const importedPublicKey = await window.crypto.subtle.importKey(
            "spki",
            publicKeyBuffer,
            {
                name: "RSA-PSS",
                hash: "SHA-256",
            },
            true,
            ["verify"]
        );

        // 2. Prepare Data and Signature
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const signatureBuffer = base64ToBuffer(signatureB64);

        // 3. Verify using Public Key
        const isValid = await window.crypto.subtle.verify(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            importedPublicKey,
            signatureBuffer,
            data
        );

        // Update UI
        if (isValid) {
            verificationResult.textContent = '✓ Signature is Valid - Message Integrity Confirmed';
            verificationResult.className = 'status-box status-valid';
        } else {
            verificationResult.textContent = '✗ Invalid Signature or Corrupted Message';
            verificationResult.className = 'status-box status-invalid';
        }

    } catch (error) {
        console.error("Verification Error:", error);
        verificationResult.textContent = '✗ Verification Failed (Invalid format or key)';
        verificationResult.className = 'status-box status-invalid';
    }
});
