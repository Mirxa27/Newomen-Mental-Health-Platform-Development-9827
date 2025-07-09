import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import UserSearch from '../components/community/UserSearch';
import ConnectionRequests from '../components/community/ConnectionRequests';
import SupportCircles from '../components/community/SupportCircles';

const Community = () => {
    const [activeTab, setActiveTab] = useState('search');

    const renderContent = () => {
        switch (activeTab) {
            case 'search':
                return <UserSearch />;
            case 'requests':
                return <ConnectionRequests />;
            case 'circles':
                return <SupportCircles />;
            default:
                return <UserSearch />;
        }
    };

    return (
        <PageWrapper>
            <div className="p-4">
                <h1 className="text-3xl font-bold mb-4">Community</h1>
                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('search')} className={`py-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-blue-500' : ''}`}>User Search</button>
                    <button onClick={() => setActiveTab('requests')} className={`py-2 px-4 ${activeTab === 'requests' ? 'border-b-2 border-blue-500' : ''}`}>Connection Requests</button>
                    <button onClick={() => setActiveTab('circles')} className={`py-2 px-4 ${activeTab === 'circles' ? 'border-b-2 border-blue-500' : ''}`}>Support Circles</button>
                </div>
                <div>
                    {renderContent()}
                </div>
            </div>
        </PageWrapper>
    );
};

export default Community; 