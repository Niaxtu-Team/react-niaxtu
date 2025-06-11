import { useState } from 'react';

const statCards = [
  {
    icon: 'fa-file-alt',
    color: 'blue',
    title: 'Total plaintes',
    value: '1,287',
    trend: 'up',
    change: '12%',
  },
  {
    icon: 'fa-check-circle',
    color: 'green',
    title: 'Plaintes résolues',
    value: '824',
    trend: 'up',
    change: '8%',
  },
  {
    icon: 'fa-users',
    color: 'indigo',
    title: 'Utilisateurs',
    value: '326',
    trend: 'up',
    change: '5%',
  },
  {
    icon: 'fa-clock',
    color: 'amber',
    title: 'Plaintes en attente',
    value: '156',
    trend: 'down',
    change: '3%',
  },
];

export default function StatCards() {
  const [isHoveringCard, setIsHoveringCard] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div 
          key={index}
          className={`bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
            isHoveringCard === index ? 'ring-2 ring-blue-500' : ''
          }`}
          onMouseEnter={() => setIsHoveringCard(index)}
          onMouseLeave={() => setIsHoveringCard(null)}
        >
          <div className="flex justify-between">
            <div className={`bg-${card.color}-100 w-12 h-12 rounded-lg flex items-center justify-center`}>
              <i className={`fas ${card.icon} text-${card.color}-500 text-xl`}></i>
            </div>
            <div className={`text-xs font-medium ${
              card.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.change} {card.trend === 'up' ? '↑' : '↓'}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 