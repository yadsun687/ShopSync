import { useState, useEffect, useRef } from 'react';
import { getRank } from '../utils/rankUtils';

const SellerCard = ({ name, power: initialPower }) => {
  const [power, setPower] = useState(initialPower);
  const { rank, color, borderColor } = getRank(power);
  const prevRank = useRef(rank);

  useEffect(() => {
    if (prevRank.current !== rank) {
      console.log(`${name} rank changed: ${prevRank.current} → ${rank}`);
      prevRank.current = rank;
    }
  }, [rank, name]);

  const levelUp = () => {
    const bonus = Math.floor(Math.random() * 11) + 5; // 5–15
    setPower((prev) => prev + bonus);
  };

  return (
    <div
      className="rounded-lg p-6 bg-white dark:bg-gray-800 shadow-md transition-all"
      style={{ border: `3px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
        <span
          className="rounded-full px-3 py-1 text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {rank}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Power: <span className="font-bold text-lg">{power}</span>
      </p>
      <button
        onClick={levelUp}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Level Up
      </button>
    </div>
  );
};

export default SellerCard;
