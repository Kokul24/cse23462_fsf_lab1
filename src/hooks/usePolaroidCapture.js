import { useState, useCallback } from 'react';

/**
 * usePolaroidCapture
 * ------------------
 * A gamified capture hook using react-screen-capture.
 *
 * Behavior:
 *  1. Plays a "shutter" click sound via Web Audio API.
 *  2. Flashes the screen white for 200 ms.
 *  3. Triggers react-screen-capture's area-selection tool.
 *  4. Receives the selected area as a base64 data URL from react-screen-capture.
 *  5. Uses that base64 string directly as the href to download the image.
 *
 * @param {object} [options]
 * @param {string} [options.filename] - Download filename (e.g. 'my-results.png').
 */
const usePolaroidCapture = ({ filename } = {}) => {
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
    // react-screen-capture returns the captured area as a base64-encoded data URL.
    // We use that base64 string directly as the download href.
    const handleEndCapture = useCallback((base64Image) => {
        if (!base64Image) {
            setIsCapturing(false);
            return;
        }

        // Convert base64 to a downloadable image
        const link = document.createElement('a');
        link.href = base64Image;           // base64 data URL from react-screen-capture
        link.download = filename || 'my-results.png';
        link.click();

        setIsCapturing(false);
    }, [filename]);

    return { startCapture, handleEndCapture, isCapturing, flashVisible };
};

export { usePolaroidCapture };
