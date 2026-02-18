import { useCallback } from 'react';

/**
 * useSpeech – A reusable Text-to-Speech hook with child-friendly settings.
 * Rate 0.8 (slower, clearer) and Pitch 1.2 (warm, friendly).
 */
export const useSpeech = () => {
    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel any ongoing speech to avoid overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;   // Slower for clarity
        utterance.pitch = 1.2;  // Warm, friendly pitch

        // Attempt to select a pleasant voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
            (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
        ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
        if (preferred) utterance.voice = preferred;

        window.speechSynthesis.speak(utterance);
    }, []);

    const cancel = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { speak, cancel };
};
