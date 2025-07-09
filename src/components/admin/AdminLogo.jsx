import React from 'react';

const AdminLogo = ({ className }) => (
  <div className={`flex items-center justify-center font-bold text-white ${className}`}>
    <div className="w-8 h-8 mr-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-lg">N</span>
    </div>
    <span className="text-xl">Newomen Admin</span>
  </div>
);

export default AdminLogo;
