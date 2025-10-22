// import '../css/app.css';
// import './bootstrap';

// import { createInertiaApp } from '@inertiajs/react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
// import { createRoot } from 'react-dom/client';

// const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
// const cleanApp = () => {
//     document.getElementById('app').removeAttribute('data-page');
//   };


// createInertiaApp({
//     title: (title) => `${title} - ${appName}`,
//     resolve: (name) =>
//         resolvePageComponent(
//             `./Pages/${name}.jsx`,
//             import.meta.glob('./Pages/**/*.jsx'),
//         ),
//     setup({ el, App, props }) {
//         const root = createRoot(el);

//         root.render(<App {...props} />);
//     },
//     progress: {
//         color: '#4B5563',
//     },
// }).then(cleanApp);


import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global error handler for Inertia
const handleInertiaError = (error) => {
    const status = error.response?.status;
    
    if (status === 403) {
        // Redirect to a dedicated unauthorized page or show a modal
        window.location.href = '/unauthorized';
        return;
    }
    
    // For other errors, you might want to show a generic error page
    if (status >= 500) {
        window.location.href = '/error?status=' + status;
        return;
    }
    
    // Let Inertia handle validation errors and other cases
    return Promise.reject(error);
};

const cleanApp = () => {
    document.getElementById('app').removeAttribute('data-page');
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
}).then(cleanApp);

// Add global error handling for Inertia requests
window.addEventListener('inertia:error', (event) => {
    const { detail: { error } } = event;
    
    if (error.response?.status === 403) {
        // You can show a toast notification or redirect
        alert('You do not have permission to perform this action.');
        // Or redirect to unauthorized page
        // window.location.href = '/unauthorized';
    }
});