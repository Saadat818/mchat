import React from 'react';
import styles from './TypingIndicator.module.scss';

interface TypingIndicatorProps {
    userName: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName }) => {
    return (
        <div className={styles.typingContainer}>
            <div className={styles.typingContent}>
                <span className={styles.userName}>{userName}</span>
                <span className={styles.typingText}> печатает</span>
                <div className={styles.dotsContainer}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
