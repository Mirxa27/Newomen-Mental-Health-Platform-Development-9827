import React from 'react';

const UserSearch = () => {
    return (
        <div>
            <h2 className="text-xl font-bold">Search for Users</h2>
            <input type="text" placeholder="Enter nickname..." className="p-2 border rounded w-full mt-4" />
        </div>
    );
};

export default UserSearch; 