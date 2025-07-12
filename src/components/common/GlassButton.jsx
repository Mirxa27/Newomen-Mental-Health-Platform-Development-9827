import React from 'react';
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


    const handleClick = (e) => {
        if (disabled || loading) return;
        onClick?.(e);
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`${buttonClasses} ${fullWidth ? 'w-full' : 'inline-block'}`}
            onClick={handleClick}
            disabled={disabled}
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
        </motion.button>
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