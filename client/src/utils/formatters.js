/**
 * Format a date to YouTube-style relative time
 * Examples: "just now", "5 minutes ago", "2 hours ago", "1 day ago", "3 weeks ago", "2 months ago", "1 year ago"
 * 
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted relative time string
 */
export const formatTimeAgo = (date) => {
    if (!date) return '';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Just now (less than 1 minute)
    if (diffSeconds < 60) {
        return 'just now';
    }

    // Minutes (1-59 minutes)
    if (diffMinutes < 60) {
        return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }

    // Hours (1-23 hours)
    if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }

    // Days (1-6 days)
    if (diffDays < 7) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }

    // Weeks (1-4 weeks)
    if (diffWeeks < 5) {
        return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    }

    // Months (1-11 months)
    if (diffMonths < 12) {
        return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    }

    // Years
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
};

/**
 * Format view count to YouTube-style (K, M, B)
 * Examples: "123", "1.2K", "5.4M", "1.2B"
 * 
 * @param {number} views - Number of views
 * @returns {string} - Formatted view count
 */
export const formatViews = (views) => {
    if (!views || views === 0) return '0';

    if (views >= 1000000000) {
        return `${(views / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return views.toString();
};

/**
 * Format subscriber count to YouTube-style
 * Examples: "123", "1.2K", "5.4M"
 * 
 * @param {number} count - Number of subscribers
 * @returns {string} - Formatted subscriber count
 */
export const formatSubscribers = (count) => {
    if (!count || count === 0) return '0';

    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
};

/**
 * Format video duration to YouTube-style
 * Examples: "4:05", "1:23:45"
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';

    const totalSeconds = Math.floor(Number(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
