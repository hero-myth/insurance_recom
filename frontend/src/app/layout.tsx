import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Life Insurance Recommendation MVP',
    description: 'Get personalized life insurance recommendations based on your profile',
    keywords: 'life insurance, recommendation, financial planning, insurance quotes',
    authors: [{ name: 'Insurance MVP Team' }],
    viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen">
                    {children}
                </div>
            </body>
        </html>
    )
} 