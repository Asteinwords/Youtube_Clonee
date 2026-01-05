import { getLocationFromIP, getIPFromRequest, getThemeForLocation } from '../utils/geolocation.js';

/**
 * @desc    Get theme based on time and location
 * @route   GET /api/theme
 * @access  Public
 */
export const getTheme = async (req, res) => {
    try {
        const ip = getIPFromRequest(req);
        const location = await getLocationFromIP(ip);
        const theme = getThemeForLocation(location);

        res.status(200).json({
            success: true,
            data: {
                theme,
                location: {
                    city: location.city,
                    state: location.state,
                    country: location.country,
                    isSouthIndia: location.isSouthIndia
                }
            }
        });
    } catch (error) {
        console.error('Get theme error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching theme',
            data: {
                theme: 'dark', // Default fallback
                location: null
            }
        });
    }
};
