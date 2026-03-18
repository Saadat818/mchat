import React from 'react';

interface MBankLogoProps {
    size?: number;        // размер иконки в px
    showText?: boolean;   // показывать "MBank" рядом
    textSize?: number;    // размер текста
    textColor?: string;
    variant?: 'light' | 'dark'; // light — белая "M", dark — тёмная
}

const MBankLogo: React.FC<MBankLogoProps> = ({
    size = 48,
    showText = false,
    textSize = 24,
    textColor = '#18191C',
    variant = 'light',
}) => {
    const iconColor = variant === 'light' ? '#FFFFFF' : '#00875A';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.25 }}>
            {/* Эмблема — зелёный скруглённый квадрат с буквой M */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
            >
                {/* Фон с градиентом */}
                <defs>
                    <linearGradient id="mbankGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#00A86B" />
                        <stop offset="100%" stopColor="#006644" />
                    </linearGradient>
                    <linearGradient id="mbankGradDark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#F5F5F5" />
                        <stop offset="100%" stopColor="#E0E0E0" />
                    </linearGradient>
                </defs>

                {/* Скруглённый прямоугольник */}
                <rect
                    x="0" y="0" width="100" height="100"
                    rx="22"
                    fill={variant === 'light' ? 'url(#mbankGrad)' : 'url(#mbankGradDark)'}
                />

                {/* Золотая полоса снизу — фирменный акцент MBank */}
                <rect
                    x="0" y="82" width="100" height="18"
                    rx="0"
                    fill="#FFD700"
                    opacity="0.9"
                />
                <rect
                    x="0" y="82" width="100" height="18"
                    rx="0"
                    fill="transparent"
                />
                {/* Скругление только нижних углов золотой полосы */}
                <path
                    d="M 0 82 L 100 82 L 100 100 Q 100 100 78 100 L 22 100 Q 0 100 0 100 Z"
                    fill="#FFD700"
                    opacity="0.9"
                />

                {/* Буква M */}
                <text
                    x="50"
                    y="76"
                    textAnchor="middle"
                    fontFamily="Inter, Arial, sans-serif"
                    fontWeight="800"
                    fontSize="62"
                    fill={iconColor}
                    letterSpacing="-2"
                >
                    M
                </text>
            </svg>

            {/* Текст "MBank" */}
            {showText && (
                <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: textSize,
                    fontWeight: 700,
                    color: textColor,
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                }}>
                    M<span style={{ color: '#00875A' }}>Bank</span>
                </span>
            )}
        </div>
    );
};

export default MBankLogo;
