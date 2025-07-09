import React from 'react';
import { motion } from 'framer-motion';

const AreaProgressBar = ({ area, percentage, color }) => {
  const areaName = area.replace('-', ' ');

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-base font-semibold text-gray-700 capitalize">{areaName}</span>
        <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          className="h-2.5 rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default AreaProgressBar;
