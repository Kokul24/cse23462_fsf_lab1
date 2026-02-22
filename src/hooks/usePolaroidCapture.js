import { useState, useCallback } from 'react';

/**
 * usePolaroidCapture
 * ------------------
 * A gamified capture hook using react-screen-capture.
 *
 * Behavior:
 *  1. Plays a "shutter" click sound via Web Audio API.
 *  2. Flashes the screen white for 200 ms.
 *  3. Receives a base64 screenshot from react-screen-capture's onEndCapture.
 *  4. Draws a Polaroid-style white border + caption on the image.
 *  5. Downloads the final image as my-awesome-garden.png.
 */
const usePolaroidCapture = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [flashVisible, setFlashVisible] = useState(false);

    // ── Shutter sound via Web Audio API (no external file needed) ──
    const playShutterSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } catch {
            // Web Audio not supported — fail silently
        }
    }, []);

    // ── Called when user clicks the camera button ──
    // This triggers the flash + sound, then calls onStartCapture from react-screen-capture
    const startCapture = useCallback(
        async (onStartCapture) => {
            if (isCapturing) return;
            setIsCapturing(true);

            // 1. Sound
            playShutterSound();

            // 2. Flash
            setFlashVisible(true);
            await new Promise((r) => setTimeout(r, 200));
            setFlashVisible(false);

            // 3. Trigger react-screen-capture's selection capture
            onStartCapture();
        },
        [isCapturing, playShutterSound]
    );

    // ── Called by react-screen-capture's onEndCapture with the base64 screenshot ──
    const handleEndCapture = useCallback((base64Source) => {
        if (!base64Source) {
            setIsCapturing(false);
            return;
        }

        // Load the captured image to get dimensions
        const img = new Image();
        img.onload = () => {
            const BORDER = 32;
            const CAPTION_HEIGHT = 64;
            const totalW = img.width + BORDER * 2;
            const totalH = img.height + BORDER * 2 + CAPTION_HEIGHT;

            const polaroid = document.createElement('canvas');
            polaroid.width = totalW;
            polaroid.height = totalH;
            const ctx = polaroid.getContext('2d');

            // White background (the "polaroid" border)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, totalW, totalH);

            // Subtle shadow
            ctx.shadowColor = 'rgba(0,0,0,0.08)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;

            // Draw captured image
            ctx.drawImage(img, BORDER, BORDER);

            // Reset shadow for text
            ctx.shadowColor = 'transparent';

            // Caption
            const dateStr = new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
            const caption = `🌻 My Garden — ${dateStr}`;
            ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#3d7c3f';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(caption, totalW / 2, img.height + BORDER * 2 + CAPTION_HEIGHT / 2);

            // Download
            const link = document.createElement('a');
            link.download = 'my-awesome-garden.png';
            link.href = polaroid.toDataURL('image/png');
            link.click();

            setIsCapturing(false);
        };

        img.onerror = () => {
            console.error('Failed to load captured image');
            setIsCapturing(false);
        };

        img.src = base64Source;
    }, []);

    return { startCapture, handleEndCapture, isCapturing, flashVisible };
};

export { usePolaroidCapture };
