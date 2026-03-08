export const getRank = (power) => {
  if (power < 50) {
    return { rank: 'Bronze', color: '#CD7F32', borderColor: '#8B5A2B' };
  }
  if (power < 100) {
    return { rank: 'Silver', color: '#A8A9AD', borderColor: '#6E6E6E' };
  }
  return { rank: 'Gold', color: '#FFD700', borderColor: '#B8860B' };
};
