import React from 'react';

const MetricCard = ({ title, count, borderColor }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${borderColor}`}>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{count}</p>
    </div>
  );
};

export default MetricCard;