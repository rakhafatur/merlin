import React from 'react';

type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  bgColor?: string;
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, bgColor }) => {
  return (
    <div
      className="dashboard-card p-5 rounded-2xl shadow-lg flex items-center gap-5 w-64 transition-transform duration-300 hover:scale-105"
      style={{
        backgroundColor: bgColor || '#4A90E2', // soft blue
        color: 'var(--color-white)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)', // lembut
      }}
    >
      {icon && (
        <div
          className="text-4xl"
          style={{
            color: '#FFD700', // soft gold
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <h4 className="font-semibold text-white opacity-90">{title}</h4>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
      </div>
    </div>
  );
};

export default KpiCard;
