import { useMemo, useState } from "react";
import { products } from "../data/products";

export default function Produit() {
  // Catégorie sélectionnée dans le menu déroulant ; "all" = toutes les catégories
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 🔹 Texte saisi dans la barre de recherche (correspond au nom ou à la catégorie)
  const [query, setQuery] = useState("");

  // 🔹 Extraction de toutes les catégories uniques pour remplir le menu déroulant
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set).sort()];
  }, []);

  // 🔹 Filtrage combiné : d'abord par catégorie, ensuite par texte saisi
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase(); 
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchText =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCategory && matchText;
    });
  }, [selectedCategory, query]);

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Produits</h2>

      {/* Zone de filtrage : menu déroulant de catégories + champ de recherche + bouton de réinitialisation */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="text-sm text-gray-600">Catégorie</label>

        {/* 🔹 下拉菜单 / Menu déroulant */}
        <select
          className="border p-2 rounded min-w-[220px]"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Toutes les catégories" : c}
            </option>
          ))}
        </select>

        {/* Champ de saisie (recherche par nom ou catégorie) */}
        <input
          type="text"
          placeholder="Rechercher par nom ou catégorie..."
          className="border p-2 rounded flex-grow min-w-[240px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Affiche le bouton 'Réinitialiser' si un filtre est actif */}
        {(selectedCategory !== "all" || query.trim() !== "") && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setQuery("");
            }}
            className="border px-3 py-2 rounded text-sm hover:bg-gray-100"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau des produits */}
      <table className="min-w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 text-left">Nom</th>
            <th className="border p-2 text-left">Catégorie</th>
            <th className="border p-2 text-left">Prix</th>
            <th className="border p-2 text-left">Quantité</th>
            <th className="border p-2 text-left">Seuil</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            // 🔹 Surlignage rouge si la quantité < seuil de réapprovisionnement
            <tr
              key={p.id}
              className={p.quantity < p.restockThreshold ? "bg-red-100" : ""}
            >
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">
                {/* ffichage du prix au format français en euros */}
                {p.price.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </td>
              <td className="border p-2">{p.quantity}</td>
              <td className="border p-2">{p.restockThreshold}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Message affiché lorsqu'aucun produit ne correspond au filtre */}
      {filteredProducts.length === 0 && (
        <p className="mt-4 text-gray-500 italic">Aucun produit trouvé.</p>
      )}
    </div>
  );
}
