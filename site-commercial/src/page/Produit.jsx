import { useMemo, useState } from "react";
import { useAppState } from "../context/AppState";

export default function Produit() {
  const { items } = useAppState();

  // Prix min et max de tous les produits
  const minPrice = Math.min(...items.map((p) => p.price));
  const maxPrice = Math.max(...items.map((p) => p.price));

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]); // valeur par défaut min-max

  // Catégories uniques
  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  // Filtrage produits
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchText = q === "" || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCategory && matchText && matchPrice;
    });
  }, [items, selectedCategory, query, priceRange]);

  const isFiltered =
    selectedCategory !== "all" ||
    query.trim() !== "" ||
    priceRange[1] !== maxPrice;


  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-8">Nos produits</h2>

      {/* Bloc filtres */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8 bg-gray-50 p-8 rounded-2xl shadow-lg">
        {/* Catégorie */}
        <div className="flex flex-col md:w-64">
          <label className="text-sm text-gray-600 mb-1">Catégorie</label>
          <select
            className="border p-2 rounded-lg min-w-full shadow-sm focus:ring focus:ring-blue-300"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Toutes les catégories" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Recherche */}
        <div className="flex-grow flex flex-col md:mx-4">
          <label className="text-sm text-gray-600 mb-1">Recherche</label>
          <input
            type="text"
            placeholder="Nom ou catégorie..."
            className="border p-2 rounded-lg w-full shadow-sm focus:ring focus:ring-blue-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Slider prix */}
        <div className="flex flex-col w-full md:w-72">
          <label className="text-sm text-gray-600 mb-2">
            Prix : {priceRange[0]}€ - {priceRange[1]}€
          </label>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full h-2 bg-gray-300 rounded-full accent-blue-500 hover:accent-blue-600"
          />
        </div>

        {/* Bouton réinitialiser */}
        <button
          type="button"
          disabled={!isFiltered}
          onClick={() => {
            if (!isFiltered) return;
            setSelectedCategory("all");
            setQuery("");
            setPriceRange([minPrice, maxPrice]);
          }}
          aria-disabled={!isFiltered}
          className={
            `self-start md:self-center px-5 py-2 rounded-xl transition ` +
            (isFiltered
              ? `bg-red-500 hover:bg-red-600 text-white`
              : `bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300`)
          }
          title={isFiltered ? "Réinitialiser les filtres" : "Aucun filtre appliqué"}
        >
          Réinitialiser
        </button>
      </div>

      {/* Tableau produits */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Seuil</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, i) => {
              const low = p.quantity < p.restockThreshold;
              const rowBg = low ? "bg-red-50 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-gray-50";
              return (
                <tr key={p.id} className={`border-t transition hover:bg-gray-100 ${rowBg}`}>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">{p.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3">{p.restockThreshold}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <p className="mt-6 text-gray-500 italic text-center">Aucun produit trouvé.</p>
      )}
    </div>
  );
}