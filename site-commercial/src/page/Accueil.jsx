import { products } from "../data/products";

export default function Accueil() {
  const totalProducts = products.length;
  const averageStock = (products.reduce((sum, p) => sum + p.quantity, 0) / totalProducts).toFixed(1);
  const totalOrders = 42; // Valeur fixe pour synthèse, pas d'interaction

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Accueil</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-100 p-4 rounded shadow">Nombre de produits : {totalProducts}</div>
        <div className="bg-gray-100 p-4 rounded shadow">Stock moyen : {averageStock}</div>
        <div className="bg-gray-100 p-4 rounded shadow">Commandes passées : {totalOrders}</div>
      </div>
      <div className="mt-6">
        <h3 className="font-bold mb-2">Catégories</h3>
        <ul className="list-disc list-inside">
          {categories.map(cat => <li key={cat}>{cat}</li>)}
        </ul>
      </div>
    </div>
  );
}

