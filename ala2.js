document.addEventListener('DOMContentLoaded', () => {
    const input1 = document.getElementById('input1');
    const input2 = document.getElementById('input2');
    const len1 = document.getElementById('len1');
    const len2 = document.getElementById('len2');

    // DOM Elements for Outputs
    const els = {
        sha1: {
            out1: document.getElementById('sha1-out1'),
            out2: document.getElementById('sha1-out2'),
            bits: document.getElementById('sha1-bits'),
            percent: document.getElementById('sha1-percent')
        },
        sha256: {
            out1: document.getElementById('sha256-out1'),
            out2: document.getElementById('sha256-out2'),
            bits: document.getElementById('sha256-bits'),
            percent: document.getElementById('sha256-percent')
        },
        sha512: {
            out1: document.getElementById('sha512-out1'),
            out2: document.getElementById('sha512-out2'),
            bits: document.getElementById('sha512-bits'),
            percent: document.getElementById('sha512-percent')
        }
    };

    const hexToBin = (hex) => {
        let bin = '';
        for (let i = 0; i < hex.length; i++) {
            bin += parseInt(hex[i], 16).toString(2).padStart(4, '0');
        }
        return bin;
    };

    const calculateAvalanche = (hashHex1, hashHex2, bitLength) => {
        const bin1 = hexToBin(hashHex1);
        const bin2 = hexToBin(hashHex2);
        
        let flippedBits = 0;
        for (let i = 0; i < bin1.length; i++) {
            if (bin1[i] !== bin2[i]) {
                flippedBits++;
            }
        }
        
        const percentage = ((flippedBits / bitLength) * 100).toFixed(2);
        return { flippedBits, percentage };
    };

    const generateHighlightedHex = (hex1, hex2) => {
        let highlighted1 = '';
        let highlighted2 = '';
        
        for (let i = 0; i < hex1.length; i++) {
            if (hex1[i] === hex2[i]) {
                highlighted1 += `<span class="char-same">${hex1[i]}</span>`;
                highlighted2 += `<span class="char-same">${hex2[i]}</span>`;
            } else {
                highlighted1 += `<span class="char-diff">${hex1[i]}</span>`;
                highlighted2 += `<span class="char-diff">${hex2[i]}</span>`;
            }
        }
        
        return { html1: highlighted1, html2: highlighted2 };
    };

    const processHashes = () => {
        const text1 = input1.value;
        const text2 = input2.value;
        
        len1.textContent = text1.length;
        len2.textContent = text2.length;

        // SHA-1 processing
        const sha1Word1 = CryptoJS.SHA1(text1);
        const sha1Word2 = CryptoJS.SHA1(text2);
        const sha1Hex1 = sha1Word1.toString(CryptoJS.enc.Hex);
        const sha1Hex2 = sha1Word2.toString(CryptoJS.enc.Hex);
        
        const sha1High = generateHighlightedHex(sha1Hex1, sha1Hex2);
        const sha1Ava = calculateAvalanche(sha1Hex1, sha1Hex2, 160);
        
        els.sha1.out1.innerHTML = sha1High.html1;
        els.sha1.out2.innerHTML = sha1High.html2;
        els.sha1.bits.textContent = `${sha1Ava.flippedBits} / 160`;
        els.sha1.percent.textContent = `${sha1Ava.percentage}%`;

        // SHA-256 processing
        const sha256Word1 = CryptoJS.SHA256(text1);
        const sha256Word2 = CryptoJS.SHA256(text2);
        const sha256Hex1 = sha256Word1.toString(CryptoJS.enc.Hex);
        const sha256Hex2 = sha256Word2.toString(CryptoJS.enc.Hex);
        
        const sha256High = generateHighlightedHex(sha256Hex1, sha256Hex2);
        const sha256Ava = calculateAvalanche(sha256Hex1, sha256Hex2, 256);
        
        els.sha256.out1.innerHTML = sha256High.html1;
        els.sha256.out2.innerHTML = sha256High.html2;
        els.sha256.bits.textContent = `${sha256Ava.flippedBits} / 256`;
        els.sha256.percent.textContent = `${sha256Ava.percentage}%`;

        // SHA-512 processing
        const sha512Word1 = CryptoJS.SHA512(text1);
        const sha512Word2 = CryptoJS.SHA512(text2);
        const sha512Hex1 = sha512Word1.toString(CryptoJS.enc.Hex);
        const sha512Hex2 = sha512Word2.toString(CryptoJS.enc.Hex);
        
        const sha512High = generateHighlightedHex(sha512Hex1, sha512Hex2);
        const sha512Ava = calculateAvalanche(sha512Hex1, sha512Hex2, 512);
        
        els.sha512.out1.innerHTML = sha512High.html1;
        els.sha512.out2.innerHTML = sha512High.html2;
        els.sha512.bits.textContent = `${sha512Ava.flippedBits} / 512`;
        els.sha512.percent.textContent = `${sha512Ava.percentage}%`;
    };

    // Event Listeners
    input1.addEventListener('input', processHashes);
    input2.addEventListener('input', processHashes);

    // Initial Processing
    processHashes();
});
