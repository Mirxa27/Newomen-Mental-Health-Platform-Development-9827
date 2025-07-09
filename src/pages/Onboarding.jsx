import React, { useState } from 'react';
import BalanceWheel from '../components/common/BalanceWheel';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [selections, setSelections] = useState({});

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSelect = (area) => {
        setSelections(prev => ({ ...prev, balanceWheel: area }));
        console.log("Selected area:", area);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <div>Language & Culture Preferences</div>;
            case 2:
                return <div>Personality Test</div>;
            case 3:
                return <BalanceWheel onSelect={handleSelect} />;
            default:
                return <div>Welcome!</div>;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Onboarding</h1>
            {renderStep()}
            <div className="mt-8">
                {step > 1 && <button onClick={prevStep} className="px-4 py-2 mr-4 bg-gray-300 rounded">Previous</button>}
                {step < 3 && <button onClick={nextStep} className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>}
                {step === 3 && <button onClick={() => alert("Onboarding Complete!")} className="px-4 py-2 bg-green-500 text-white rounded">Finish</button>}
            </div>
        </div>
    );
};

export default Onboarding; 