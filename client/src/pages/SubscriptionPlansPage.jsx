import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { paymentAPI } from '../utils/api';
import { FiCheck, FiClock, FiDownload, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SubscriptionPlansPage = () => {
    const { user } = useAuth();
    const { isOpen } = useSidebar();
    const [loading, setLoading] = useState(null);

    const plans = [
        {
            name: 'Free',
            price: 0,
            currency: 'USD',
            watchTime: '5 min/day',
            downloads: '1/day',
            features: [
                '5 minutes watch time per day',
                '1 video download per day',
                'Standard quality',
                'Ads supported'
            ],
            color: 'gray'
        },
        {
            name: 'Bronze',
            price: 0.15,
            currency: 'USD',
            watchTime: '7 min/day',
            downloads: 'Unlimited',
            features: [
                '7 minutes watch time per day',
                'Unlimited downloads',
                'HD quality',
                'Ad-free experience',
                'Email support'
            ],
            color: 'orange',
            popular: false
        },
        {
            name: 'Silver',
            price: 0.70,
            currency: 'USD',
            watchTime: '10 min/day',
            downloads: 'Unlimited',
            features: [
                '10 minutes watch time per day',
                'Unlimited downloads',
                'Full HD quality',
                'Ad-free experience',
                'Priority support',
                'Early access to features'
            ],
            color: 'gray',
            popular: true
        },
        {
            name: 'Gold',
            price: 1.40,
            currency: 'USD',
            watchTime: 'Unlimited',
            downloads: 'Unlimited',
            features: [
                'Unlimited watch time',
                'Unlimited downloads',
                '4K quality',
                'Ad-free experience',
                '24/7 Premium support',
                'Early access to features',
                'Exclusive content'
            ],
            color: 'yellow',
            popular: false
        }
    ];

    const handleSubscribe = async (plan) => {
        if (plan.name === 'Free') {
            toast.info('You are already on the free plan');
            return;
        }

        setLoading(plan.name);
        try {
            // Create PayPal order
            const response = await paymentAPI.createOrder(plan.name);
            const { approvalUrl } = response.data.data;

            // Redirect to PayPal
            window.location.href = approvalUrl;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed');
        } finally {
            setLoading(null);
        }
    };

    const getColorClasses = (color) => {
        const colors = {
            gray: 'from-gray-500 to-gray-700',
            orange: 'from-orange-500 to-orange-700',
            yellow: 'from-yellow-500 to-yellow-700'
        };
        return colors[color] || colors.gray;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                    <div className="p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Upgrade to unlock more features and enjoy unlimited content
                                </p>
                                {user && (
                                    <p className="mt-4 text-sm text-gray-500">
                                        Current Plan: <span className="font-bold capitalize">{user.subscriptionPlan || 'Free'}</span>
                                    </p>
                                )}
                            </div>

                            {/* Plans Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`relative rounded-2xl overflow-hidden ${plan.popular ? 'ring-4 ring-blue-500 scale-105' : ''
                                            } transition-transform hover:scale-105`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                                POPULAR
                                            </div>
                                        )}

                                        {/* Plan Header */}
                                        <div className={`bg-gradient-to-br ${getColorClasses(plan.color)} text-white p-6`}>
                                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                            <div className="text-4xl font-bold mb-1">
                                                ${plan.price}
                                                <span className="text-lg font-normal">/month</span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm mt-4">
                                                <div className="flex items-center">
                                                    <FiClock className="w-4 h-4 mr-1" />
                                                    {plan.watchTime}
                                                </div>
                                                <div className="flex items-center">
                                                    <FiDownload className="w-4 h-4 mr-1" />
                                                    {plan.downloads}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Plan Features */}
                                        <div className="bg-white dark:bg-gray-800 p-6">
                                            <ul className="space-y-3 mb-6">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <button
                                                onClick={() => handleSubscribe(plan)}
                                                disabled={loading === plan.name || user?.subscriptionPlan === plan.name}
                                                className={`w-full py-3 rounded-lg font-semibold transition-colors ${user?.subscriptionPlan === plan.name
                                                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                                    : plan.popular
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {loading === plan.name ? (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Processing...</span>
                                                    </div>
                                                ) : user?.subscriptionPlan === plan.name ? (
                                                    'Current Plan'
                                                ) : plan.name === 'Free' ? (
                                                    'Free Forever'
                                                ) : (
                                                    'Subscribe Now'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Info */}
                            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h3 className="font-bold mb-2">💳 Secure Payment with PayPal</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    All payments are processed securely through PayPal. You can pay with your PayPal account or credit card.
                                    Cancel anytime from your account settings.
                                </p>
                            </div>

                            {/* FAQ */}
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <h4 className="font-semibold mb-2">What happens when I reach my watch time limit?</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            You'll be prompted to upgrade to a higher plan. Your watch time resets daily at midnight.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <h4 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your billing period.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubscriptionPlansPage;
