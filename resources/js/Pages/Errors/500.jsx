import React from 'react';
import { Head, usePage } from '@inertiajs/react';

export default function Error({ status, title, message }) {
    const { url } = usePage();

    const getErrorDetails = () => {
        switch (status) {
            case 403:
                return {
                    icon: '🔒',
                    color: 'text-red-500',
                    bgColor: 'bg-red-100',
                };
            case 404:
                return {
                    icon: '🔍',
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-100',
                };
            case 500:
                return {
                    icon: '⚙️',
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-100',
                };
            default:
                return {
                    icon: '❌',
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-100',
                };
        }
    };

    const errorDetails = getErrorDetails();

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                        {/* Error Icon */}
                        <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full ${errorDetails.bgColor} mb-6`}>
                            <span className={`text-3xl ${errorDetails.color}`}>
                                {errorDetails.icon}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {title}
                            </h1>
                            
                            <p className="text-gray-600 mb-6 text-lg">
                                {message}
                            </p>

                            <div className="text-sm text-gray-500 mb-8 p-3 bg-gray-50 rounded-lg">
                                <code className="text-xs">
                                    Error {status} • {url}
                                </code>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    ← Go Back
                                </button>
                                
                                <a
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    Go to Dashboard
                                </a>
                            </div>

                            {/* Additional Help for 403 */}
                            {status === 403 && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        If you believe this is a mistake, please contact your administrator.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}