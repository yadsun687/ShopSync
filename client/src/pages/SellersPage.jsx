import SellerCard from '../components/SellerCard';

const sellers = [
  { name: 'Alice', power: 30 },
  { name: 'Bob', power: 75 },
  { name: 'Charlie', power: 120 },
  { name: 'Diana', power: 45 },
  { name: 'Eve', power: 95 },
  { name: 'Frank', power: 150 },
];

const SellersPage = () => {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Seller Rankings</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sellers.map((seller) => (
          <SellerCard key={seller.name} name={seller.name} power={seller.power} />
        ))}
      </div>
    </div>
  );
};

export default SellersPage;
