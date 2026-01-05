import User from '../models/User.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-otp -phoneNumber');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, avatar },
            { new: true, runValidators: true }
        ).select('-otp');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};
