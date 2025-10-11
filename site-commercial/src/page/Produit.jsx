import { useMemo, useState } from "react";
import { useAppState } from "../context/AppState";

// Composant de page : liste et filtrage des produits
export default function Produit() {
  // Accès au state global de l'application (liste des produits)
  const { items } = useAppState();

  // —— États locaux pour les filtres —— //
  const [selectedCategory, setSelectedCategory] = useState("all"); // catégorie active
  const [query, setQuery] = useState("");                          // recherche textuelle

  // —— Construction de la liste des catégories (avec "all") —— //
  // Mémoïsé pour ne recalculer que si 'items' change
  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  // —— Filtrage des produits (catégorie + recherche) —— //
  // 1) Normalise la requête (trim + toLowerCase)
  // 2) Filtre par catégorie (ou "all")
  // 3) Filtre par texte (nom OU catégorie contient la requête)
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchText =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCategory && matchText;
    });
  }, [items, selectedCategory, query]);

  // —— Rendu —— //
  return (
    <div className="p-10">
      {/* Titre de page */}
      <h2 className="text-3xl font-bold mb-8">Produits</h2>

      {/* Bloc de filtres (catégorie + recherche) */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-gray-50 p-4 rounded-xl shadow-sm">
        {/* Sélecteur de catégorie */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Catégorie</label>
          <select
            className="border p-2 rounded-lg min-w-[200px] shadow-sm focus:ring focus:ring-blue-200"
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

        {/* Champ de recherche (nom/catégorie) */}
        <div className="flex-grow">
          <label className="text-sm text-gray-600 mb-1 block">Recherche</label>
          <input
            type="text"
            placeholder="Nom ou catégorie..."
            className="border p-2 rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Réinitialisation des filtres visible seulement quand un filtre est actif */}
        {(selectedCategory !== "all" || query.trim() !== "") && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setQuery("");
            }}
            className="self-end bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau des produits filtrés */}
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
              // Alerte visuelle si la quantité < seuil de réassort
              const low = p.quantity < p.restockThreshold;
              // Alternance de couleur des lignes + mise en évidence en cas de stock bas
              const rowBg = low ? "bg-red-50 font-semibold" : (i % 2 === 0 ? "bg-white" : "bg-gray-50");
              return (
                <tr key={p.id} className={`border-t transition hover:bg-gray-50 ${rowBg}`}>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">
                    {/* Pastille de catégorie */}
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Affichage localisé en EUR (fr-FR) */}
                    {p.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3">{p.restockThreshold}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Message vide si aucun produit ne correspond aux filtres */}
      {filteredProducts.length === 0 && (
        <p className="mt-6 text-gray-500 italic text-center">Aucun produit trouvé.</p>
      )}
    </div>
  );
}
