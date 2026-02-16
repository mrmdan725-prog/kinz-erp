import React from 'react';

const Logo = ({ width = 200, height = 'auto', className = '' }) => {
    return (
        <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'white' }}>
            <div className="logo-icon" style={{
                position: 'relative',
                width: '60px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Recreating the orange 'k' shape */}
                <div style={{
                    width: '16px',
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: '8px',
                    position: 'absolute',
                    left: '0'
                }}></div>
                <div style={{
                    width: '40px',
                    height: '16px',
                    background: 'var(--primary)',
                    borderRadius: '8px',
                    position: 'absolute',
                    left: '10px',
                    top: '25px',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'left center'
                }}></div>
                <div style={{
                    width: '40px',
                    height: '16px',
                    background: 'var(--primary)',
                    borderRadius: '8px',
                    position: 'absolute',
                    left: '10px',
                    bottom: '25px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'left center'
                }}></div>
            </div>
            <div className="logo-text" style={{ textAlign: 'left', fontWeight: 'bold' }}>
                <div style={{ fontSize: '24px', letterSpacing: '1px', lineHeight: '1' }}>
                    KINZ HOME ART
                </div>
                <div style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    DOORS - FURNITURE - kitchens
                </div>
            </div>
        </div>
    );
};

export default Logo;
