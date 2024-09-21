import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear(); // Get the current year

    return (
        <footer style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f0f0' }}>
            <p>© {currentYear} หอพักณิชชาวีร์ สงวนลิขสิทธิ์</p>
        </footer>
    );
}

export default Footer;
