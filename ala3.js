document.addEventListener('DOMContentLoaded', () => {
    // Sender Elements
    const senderMsg = document.getElementById('senderInput');
    const senderKey = document.getElementById('senderSecret');
    const senderMacOutput = document.getElementById('senderMacOutput');
    const btnTransmit = document.getElementById('btn-transmit');

    // Receiver Elements
    const receiverMsg = document.getElementById('receiverInput');
    const receiverKey = document.getElementById('receiverSecret');
    const receiverReceivedMac = document.getElementById('receiverMacInput');
    const verifyBtn = document.getElementById('verifyBtn');
    
    const verifyStatusBox = document.querySelector('.status-panel');
    const verifyHeader = document.getElementById('validationStatus');
    const statusText = document.getElementById('validationDetails');

    let currentSenderMac = "";

    // Generate MAC on Sender Side
    const updateSenderMac = () => {
        const msg = senderMsg.value;
        const key = senderKey.value;
        
        if (!key) {
            senderMacOutput.textContent = "Please provide a secret key.";
            return;
        }

        // Generate HMAC using SHA256
        const hash = CryptoJS.HmacSHA256(msg, key);
        currentSenderMac = hash.toString(CryptoJS.enc.Hex);
        senderMacOutput.textContent = currentSenderMac;
    };

    // Initially generate
    updateSenderMac();

    // Event Listeners for Sender Input
    senderMsg.addEventListener('input', updateSenderMac);
    senderKey.addEventListener('input', updateSenderMac);

    // Transmit action
    btnTransmit.addEventListener('click', () => {
        // Copy values over to receiver
        receiverMsg.value = senderMsg.value;
        receiverReceivedMac.value = currentSenderMac;
        receiverKey.value = senderKey.value; // Keys are pre-shared in reality
        
        // Add a slight animation to the button
        btnTransmit.textContent = "Transmission Complete ✓";
        btnTransmit.style.background = "#fff";
        btnTransmit.style.color = "var(--brand-purple)";
        
        setTimeout(() => {
            btnTransmit.textContent = "Commence Transmission ➔";
            btnTransmit.style.background = "";
            btnTransmit.style.color = "";
        }, 2000);

        verifyReceiverMac();
    });

    verifyBtn.addEventListener('click', () => {
        verifyReceiverMac();
    });

    // Verification Logic on Receiver Side
    const verifyReceiverMac = () => {
        const rMsg = receiverMsg.value;
        const rKey = receiverKey.value;
        const expectedMac = receiverReceivedMac.value || receiverReceivedMac.textContent;

        if (expectedMac === "waiting..." || !expectedMac || expectedMac === "") {
            setVerifyStatus('pending', "Awaiting Data...");
            return;
        }

        if (!rKey) {
            setVerifyStatus('invalid', "Missing Secret Key!");
            return;
        }

        // Receiver recalculates MAC with their own copy of the key and the received message
        const calculatedHash = CryptoJS.HmacSHA256(rMsg, rKey);
        const calculatedMac = calculatedHash.toString(CryptoJS.enc.Hex);

        if (calculatedMac === expectedMac) {
             setVerifyStatus('valid', "Integrity Verified: The HMAC matches perfectly. The message has not been tampered with in transit.");
        } else {
             setVerifyStatus('invalid', "Validation Failed: The HMAC signatures do NOT match. The message was altered or the secret key is wrong.");
        }
    };

    const setVerifyStatus = (status, text) => {
        // Reset classes
        verifyStatusBox.className = 'status-panel mt-4';
        verifyHeader.className = 'status-header';
        
        const pulseSpan = document.createElement('div');
        pulseSpan.className = 'pulse-ring';
        const textSpan = document.createElement('span');

        if (status === 'valid') {
            verifyHeader.classList.add('status-valid');
            textSpan.textContent = "AUTHENTICATION SUCCESSFUL";
        } else if (status === 'invalid') {
            verifyHeader.classList.add('status-invalid');
            textSpan.textContent = "AUTHENTICATION FAILED";
        } else {
            textSpan.textContent = "AWAITING ANALYSIS";
        }

        verifyHeader.innerHTML = '';
        verifyHeader.appendChild(pulseSpan);
        verifyHeader.appendChild(textSpan);

        statusText.textContent = text;
    };

    // Event Listeners for Receiver (simulating tampering)
    receiverMsg.addEventListener('input', verifyReceiverMac);
    receiverKey.addEventListener('input', verifyReceiverMac);
    receiverReceivedMac.addEventListener('input', verifyReceiverMac);
});
