import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const GlassCard = ({
    children,
    className = '',
    onClick,
    displacementScale = 70,
    blurAmount = 0.0625,
    saturation = 140,
    aberrationIntensity = 2,
    elasticity = 0.15,
    cornerRadius = 12,
    padding = '24px',
    overLight = false,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`glass-card ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
};

GlassCard.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func,
    displacementScale: PropTypes.number,
    blurAmount: PropTypes.number,
    saturation: PropTypes.number,
    aberrationIntensity: PropTypes.number,
    elasticity: PropTypes.number,
    cornerRadius: PropTypes.number,
    padding: PropTypes.string,
    overLight: PropTypes.bool,
};

export default GlassCard; 