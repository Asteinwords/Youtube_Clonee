import { translate } from '@vitalets/google-translate-api';

/**
 * FREE Translation using google-translate-api (no API key needed!)
 * This uses Google Translate web interface - completely free
 */

/**
 * Detect language of text
 * @param {string} text - Text to detect language
 * @returns {Promise<string>} - Language code
 */
export const detectLanguage = async (text) => {
    try {
        const result = await translate(text, { to: 'en' });
        return result.from.language.iso;
    } catch (error) {
        console.error('Language detection error:', error);
        return 'en'; // Default to English
    }
};

/**
 * Translate text to target language (100% FREE)
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'en', 'hi', 'ta')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLanguage) => {
    try {
        const result = await translate(text, { to: targetLanguage });
        return result.text;
    } catch (error) {
        console.error('Translation error:', error);
        throw new Error('Failed to translate text');
    }
};

/**
 * Get supported languages
 * @returns {Array} - Array of supported languages
 */
export const getSupportedLanguages = () => {
    // Common languages supported by Google Translate (free)
    return [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'te', name: 'Telugu' },
        { code: 'kn', name: 'Kannada' },
        { code: 'ml', name: 'Malayalam' },
        { code: 'bn', name: 'Bengali' },
        { code: 'mr', name: 'Marathi' },
        { code: 'gu', name: 'Gujarati' },
        { code: 'pa', name: 'Punjabi' },
        { code: 'ur', name: 'Urdu' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'ar', name: 'Arabic' }
    ];
};

// Common language codes for quick reference
export const COMMON_LANGUAGES = {
    ENGLISH: 'en',
    HINDI: 'hi',
    TAMIL: 'ta',
    TELUGU: 'te',
    KANNADA: 'kn',
    MALAYALAM: 'ml',
    BENGALI: 'bn',
    MARATHI: 'mr',
    GUJARATI: 'gu',
    PUNJABI: 'pa',
    URDU: 'ur',
    SPANISH: 'es',
    FRENCH: 'fr',
    GERMAN: 'de',
    CHINESE: 'zh',
    JAPANESE: 'ja',
    KOREAN: 'ko',
    ARABIC: 'ar'
};

export default { detectLanguage, translateText, getSupportedLanguages };
