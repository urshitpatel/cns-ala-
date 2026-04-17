document.addEventListener('DOMContentLoaded', () => {
    // Real-time clock logic
    const clockElement = document.getElementById('live-time');
    
    const updateTime = () => {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        };
        clockElement.textContent = now.toLocaleDateString('en-US', options);
    };

    // Initial update
    updateTime();
    // Update every second
    setInterval(updateTime, 1000);

    // Add subtle parallax effect to the background blobs
    const blobs = document.querySelectorAll('.blob');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (window.innerWidth / 2 - e.pageX) / speed;
            const yOffset = (window.innerHeight / 2 - e.pageY) / speed;
            
            blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
});
