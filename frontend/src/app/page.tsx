'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is already authenticated
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                // Try to validate token
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const currentTime = Math.floor(Date.now() / 1000);

                    if (payload.exp >= currentTime) {
                        // Valid token, redirect to recommendation page
                        router.push('/recommendation');
                        return;
                    }
                } catch (error) {
                    // Invalid token, remove it
                    localStorage.removeItem('authToken');
                }
            }

            // No valid token, redirect to auth page
            router.push('/auth');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
} 