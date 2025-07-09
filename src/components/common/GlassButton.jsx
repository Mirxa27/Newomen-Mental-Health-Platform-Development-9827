import React from 'react';
import LiquidGlass from 'liquid-glass-react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const GlassButton = ({
    children,
    className = '',
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    ...props
}) => {
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const variantStyles = {
        primary: 'text-white font-medium',
        secondary: 'text-gray-700 font-medium',
        outline: 'text-blue-600 border border-blue-600 font-medium',
        ghost: 'text-gray-600 hover:text-gray-900 font-medium'
    };

    const buttonClasses = `
    ${sizeStyles[size]} 
    ${variantStyles[variant]} 
    ${fullWidth ? 'w-full' : ''} 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    inline-flex items-center justify-center rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${className}
  `.trim();

    const glassProps = {
        primary: {
            displacementScale: 64,
            blurAmount: 0.1,
            saturation: 130,
            aberrationIntensity: 2,
            elasticity: 0.35,
            cornerRadius: 8
        },
        secondary: {
            displacementScale: 50,
            blurAmount: 0.08,
            saturation: 110,
            aberrationIntensity: 1.5,
            elasticity: 0.25,
            cornerRadius: 8
        },
        outline: {
            displacementScale: 40,
            blurAmount: 0.05,
            saturation: 100,
            aberrationIntensity: 1,
            elasticity: 0.2,
            cornerRadius: 8
        },
        ghost: {
            displacementScale: 30,
            blurAmount: 0.03,
            saturation: 90,
            aberrationIntensity: 0.5,
            elasticity: 0.15,
            cornerRadius: 8
        }
    };

    const handleClick = (e) => {
        if (disabled || loading) return;
        onClick?.(e);
    };

    return (
        <motion.div
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={fullWidth ? 'w-full' : 'inline-block'}
        >
            <LiquidGlass
                {...glassProps[variant]}
                onClick={handleClick}
                className={buttonClasses}
                {...props}
            >
                {loading ? (
                    <div className="flex items-center space-x-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        />
                        <span>Loading...</span>
                    </div>
                ) : (
                    children
                )}
            </LiquidGlass>
        </motion.div>
    );
};

GlassButton.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    fullWidth: PropTypes.bool,
};

export default GlassButton; 