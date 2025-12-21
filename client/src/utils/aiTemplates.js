/**
 * AI Smart Templates Utility
 * Handles text processing for summarization and flashcard generation.
 */

// Simulate processing delay for a premium feel
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Summarize text into bullet points
 * @param {string} text - The raw text to summarize
 * @returns {Promise<string>} - The summarized text
 */
export const summarizeNote = async (text) => {
    await delay(2000); // AI planning delay

    if (!text || text.trim().length < 20) {
        return "Note is too short to summarize effectively.";
    }

    // Basic sentence splitting
    const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 10);

    // Heuristic: Pick the first sentence, the longest sentence, and a middle sentence
    const results = [];
    if (sentences.length > 0) results.push(sentences[0]);

    if (sentences.length > 2) {
        const sorted = [...sentences].sort((a, b) => b.length - a.length);
        const longest = sorted[0];
        if (longest !== sentences[0]) results.push(longest);
    }

    if (sentences.length > 3) {
        const middle = sentences[Math.floor(sentences.length / 2)];
        if (!results.includes(middle)) results.push(middle);
    }

    if (results.length === 0) return "Could not extract key points.";

    return "### AI Summary\n\n" + results.map(s => `• ${s.trim()}`).join('\n');
};

/**
 * Generate Flashcards from text
 * @param {string} text - The raw text to process
 * @returns {Promise<Array>} - Array of { front, back } objects
 */
export const generateAIFlashcards = async (text) => {
    await delay(2500); // AI extraction delay

    if (!text || text.trim().length < 10) {
        return [];
    }

    const cards = [];

    // Strategy 1: Definition Extraction (Explicit "is", ":", "adalah")
    const patterns = [
        /([^.:\n]+)\s+is\s+([^.\n]+)/gi,
        /([^.:\n]+):\s+([^.\n]+)/gi,
        /([^.:\n]+)\s+adalah\s+([^.\n]+)/gi,
        /([^.:\n]+)\s+itu\s+([^.\n]+)/gi, // "X itu Y"
        /([^.:\n]+)\s+means\s+([^.\n]+)/gi
    ];

    patterns.forEach(regex => {
        let match;
        // Reset regex state just in case
        regex.lastIndex = 0;
        while ((match = regex.exec(text)) !== null) {
            // Lowered length constraints
            if (match[1].trim().length < 50 && match[2].trim().length > 3) {
                cards.push({
                    front: match[1].trim(),
                    back: match[2].trim()
                });
            }
        }
    });

    // Strategy 2: Important Sentences (Fallback if few definitions found)
    if (cards.length < 3) {
        // Split by sentences, remove empty/short ones
        const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 15);

        sentences.forEach(s => {
            const trimmed = s.trim();
            // Don't duplicate if already caught by regex
            const alreadyExists = cards.some(c => c.back.includes(trimmed) || trimmed.includes(c.back));

            if (!alreadyExists) {
                // Heuristic: Create a "Fill in the blank" or general recall card
                // Pick a word > 5 chars to hide, or just ask about the key point
                const words = trimmed.split(' ');
                if (words.length >= 4) {
                    // Simple cloze deletion: hide the last few words
                    const splitPoint = Math.floor(words.length * 0.6);
                    const front = words.slice(0, splitPoint).join(' ') + " ...?";
                    const back = trimmed;

                    cards.push({ front, back });
                }
            }
        });
    }

    // Ensure we don't return too many
    return cards.slice(0, 5);
};
