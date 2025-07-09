import React, { useState } from 'react';

const members = [
  { nickname: 'StarGazer', progress: 70 },
  { nickname: 'Moonlight', progress: 40 },
  { nickname: 'Sunrise', progress: 90 },
];

const NicknameSearch = () => {
  const [query, setQuery] = useState('');
  const results = members.filter(m => m.nickname.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Search Community</h1>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter nickname" className="w-full p-2 border rounded" />
        <ul className="space-y-2">
          {results.map((m, i) => (
            <li key={i} className="p-2 bg-white/70 rounded">
              {m.nickname} - {m.progress}% shared progress
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NicknameSearch;
