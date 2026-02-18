import logoImg from '../assets/kinz.png';

const Logo = ({ width = 180, height = 'auto', className = '' }) => {
    return (
        <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center' }}>
            <img
                src={logoImg}
                alt="KINZ Logo"
                style={{
                    width: width,
                    height: height,
                    filter: 'brightness(1.5)',
                    objectFit: 'contain'
                }}
            />
        </div>
    );
};

export default Logo;
