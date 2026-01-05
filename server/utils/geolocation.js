import geoip from 'geoip-lite';
import axios from 'axios';

// South Indian states
const SOUTH_INDIAN_STATES = [
    'Tamil Nadu',
    'Kerala',
    'Karnataka',
    'Andhra Pradesh',
    'Telangana',
    'TN',
    'KL',
    'KA',
    'AP',
    'TG'
];

/**
 * Get location from IP address
 * @param {string} ip - IP address
 * @returns {Promise<Object>} - Location data
 */
export const getLocationFromIP = async (ip) => {
    try {
        // Use geoip-lite for offline lookup (free and fast)
        const geo = geoip.lookup(ip);

        if (geo) {
            return {
                country: geo.country,
                state: geo.region,
                city: geo.city,
                ip: ip,
                isSouthIndia: isSouthIndianState(geo.region)
            };
        }

        // Fallback to online API if geoip-lite doesn't have data
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}`);
            const data = response.data;

            if (data.status === 'success') {
                return {
                    country: data.country,
                    state: data.regionName,
                    city: data.city,
                    ip: ip,
                    isSouthIndia: isSouthIndianState(data.regionName)
                };
            }
        } catch (apiError) {
            console.error('IP API error:', apiError.message);
        }

        // Default fallback
        return {
            country: 'Unknown',
            state: 'Unknown',
            city: 'Unknown',
            ip: ip,
            isSouthIndia: false
        };
    } catch (error) {
        console.error('Geolocation error:', error);
        return {
            country: 'Unknown',
            state: 'Unknown',
            city: 'Unknown',
            ip: ip,
            isSouthIndia: false
        };
    }
};

/**
 * Check if state is in South India
 * @param {string} state - State name
 * @returns {boolean} - True if South Indian state
 */
export const isSouthIndianState = (state) => {
    if (!state) return false;

    return SOUTH_INDIAN_STATES.some(southState =>
        state.toLowerCase().includes(southState.toLowerCase()) ||
        southState.toLowerCase().includes(state.toLowerCase())
    );
};

/**
 * Get IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
export const getIPFromRequest = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        '127.0.0.1';
};

/**
 * Determine theme based on time and location
 * @param {Object} location - Location object with isSouthIndia property
 * @returns {string} - 'light' or 'dark'
 */
export const getThemeForLocation = (location) => {
    const now = new Date();
    const hour = now.getHours();

    // White theme: South India + 10 AM to 12 PM
    if (location.isSouthIndia && hour >= 10 && hour < 12) {
        return 'light';
    }

    // Dark theme for all other cases
    return 'dark';
};
