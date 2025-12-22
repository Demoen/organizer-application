/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Slate 950
                surface: "#1e293b",    // Slate 800
                "surface-glass": "rgba(30, 41, 59, 0.7)",
                primary: "#22d3ee",    // Cyan 400
                "primary-glow": "rgba(34, 211, 238, 0.5)",
                secondary: "#6366f1",  // Indigo 500
                accent: "#f97316",     // Orange 500
                danger: "#ef4444",     // Red 500
                success: "#10b981",    // Emerald 500
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "pulse-glow": "pulseGlow 2s infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 5px rgba(34, 211, 238, 0.2)" },
                    "50%": { boxShadow: "0 0 20px rgba(34, 211, 238, 0.6)" },
                }
            }
        },
    },
    plugins: [],
}
