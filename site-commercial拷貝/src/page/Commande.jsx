import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { useAppState } from "../context/AppState";

// Composant principal : page "Commande"
export default function Commande() {
  // Récupère la liste des produits et l'action d'application de commande depuis le contexte global
  const { items, applyOrder } = useAppState();

  // —— Initialisation des quantités par produit —— //
  // Mémorise un objet { idProduit: 0 } pour tous les produits, recalculé si items change
  const initialQuantities = useMemo(
    () => items.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
    [items]
  );

  // —— État du formulaire (coordonnées + quantités) —— //
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    quantities: initialQuantities,
  });

  // —— États d'UI (confirmation) —— //
  const [isConfirmed, setIsConfirmed] = useState(false);     // Passage à la page "Commande confirmée"
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Ouverture/fermeture de la modale de confirmation

  // Snapshot des quantités au moment de la validation (sert pour l'écran de succès)
  const [confirmedQuantities, setConfirmedQuantities] = useState(null);

  // —— Filtres (catégorie + texte) —— //
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");

  // Construit la liste des catégories disponibles (avec "all" en tête)
  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  // Applique les filtres (catégorie et recherche texte) de façon mémoïsée
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const byCat = selectedCategory === "all" || p.category === selectedCategory;
      const byText =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return byCat && byText;
    });
  }, [items, selectedCategory, query]);

  // —— Saisie des quantités —— //
  // Garantit une valeur numérique bornée entre 0 et le stock disponible
  const handleChange = (id, rawValue) => {
    const product = items.find((p) => p.id === id);
    const n = Number(rawValue);
    const safe = Number.isFinite(n) ? n : 0;
    const clamped = Math.max(0, Math.min(safe, product.quantity)); // anti-dépassement de stock
    setFormData((prev) => ({
      ...prev,
      quantities: { ...prev.quantities, [id]: clamped },
    }));
  };

  // —— Retirer un article de la commande (remettre la quantité à 0) —— //
  const removeFromOrder = (id) => {
    setFormData((prev) => ({
      ...prev,
      quantities: { ...prev.quantities, [id]: 0 },
    }));
  };

  // —— Vue "panier" en temps réel (avant validation) —— //
  // Construit la liste des produits sélectionnés avec qty > 0
  const selectedProducts = useMemo(
    () =>
      items
        .map((p) => ({ ...p, qty: formData.quantities[p.id] || 0 }))
        .filter((p) => p.qty > 0),
    [items, formData.quantities]
  );

  // Totaux dérivés du panier courant
  const totalItems = selectedProducts.reduce((s, p) => s + p.qty, 0);
  const totalPrice = selectedProducts.reduce((s, p) => s + p.qty * p.price, 0);
  const hasSelection = selectedProducts.length > 0; // bouton "Confirmer" activable seulement si true

  // —— Données pour la page de succès (basées sur le snapshot confirmé) —— //
  const confirmedProducts = useMemo(() => {
    if (!confirmedQuantities) return [];
    return items
      .map((p) => ({ ...p, qty: Number(confirmedQuantities[p.id] || 0) }))
      .filter((p) => p.qty > 0);
  }, [items, confirmedQuantities]);

  const cTotalItems = confirmedProducts.reduce((s, p) => s + p.qty, 0);
  const cTotalPrice = confirmedProducts.reduce((s, p) => s + p.qty * p.price, 0);

  // —— Soumission du formulaire : simplement ouvrir la modale si au moins un article —— //
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasSelection) return; // blocage si panier vide
    setIsConfirmOpen(true);
  };

  // —— Accessibilité : fermer la modale avec la touche Échap —— //
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsConfirmOpen(false);
    if (isConfirmOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isConfirmOpen]);

  // —— Écran "Commande confirmée" —— //
  if (isConfirmed) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto w-full">
        <div className="bg-green-50 border border-green-300 rounded-xl p-8 shadow-md text-center">
          {/* Icône de succès */}
          <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />

          {/* Titre + message de confirmation */}
          <h2 className="text-3xl font-bold text-green-700 mb-2">Commande confirmée !</h2>
          <p className="text-gray-700 mb-6">
            Merci <strong>{formData.firstName} {formData.lastName}</strong>, votre commande a bien été enregistrée.
            Une confirmation a été envoyée à <strong>{formData.email}</strong>.
          </p>

          {/* Récapitulatif basé sur le snapshot (ne varie plus si le stock évolue) */}
          <div className="overflow-x-auto rounded-lg border mb-6">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Quantité</th>
                  <th className="px-4 py-3">Prix unitaire</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {confirmedProducts.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.qty}</td>
                    <td className="px-4 py-2">
                      {p.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {(p.qty * p.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                  </tr>
                ))}
                {/* Ligne total */}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3">{cTotalItems}</td>
                  <td />
                  <td className="px-4 py-3 text-blue-600 text-lg">
                    {cTotalPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bouton pour créer une nouvelle commande (reset complet) */}
          <button
            onClick={() => {
              setFormData({ firstName: "", lastName: "", email: "", quantities: initialQuantities });
              setConfirmedQuantities(null);
              setIsConfirmed(false);
            }}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            ⬅️ Nouvelle commande
          </button>
        </div>
      </div>
    );
  }

  // —— Formulaire de commande (avant confirmation) —— //
  return (
    <div className="px-6 py-10 max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-8 text-center">Passer votre commande</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-xl p-8">
        {/* —— Coordonnées client —— */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Prénom"
            className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Nom"
            className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* —— Filtres (catégorie + recherche) —— */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-xl shadow-sm">
          {/* Filtre catégorie */}
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

          {/* Recherche texte sur nom/catégorie */}
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

          {/* Bouton de réinitialisation des filtres si actif */}
          {(selectedCategory !== "all" || query.trim() !== "") && (
            <button
              type="button"
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

        {/* —— Liste des produits filtrés + saisie des quantités —— */}
        <div>
          <h3 className="font-bold text-lg mb-4">Sélection des produits</h3>
          <div className="space-y-3">
            {filteredProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{p.name}</span>{" "}
                  <span className="text-gray-500 text-sm">(disponible : {p.quantity})</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={p.quantity}
                  step="1"
                  value={formData.quantities[p.id] || 0}
                  onChange={(e) => handleChange(p.id, e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()} // évite changement via molette (UX)
                  className="border p-2 rounded w-24 text-center focus:ring focus:ring-blue-200"
                />
              </div>
            ))}
          </div>
        </div>

        {/* —— Récapitulatif dynamique (panier courant) —— */}
        {selectedProducts.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-2">Récapitulatif de la commande</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3">Quantité</th>
                    <th className="px-4 py-3">Prix unitaire</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.qty}</td>
                      <td className="px-4 py-2">
                        {p.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {(p.qty * p.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </td>
                      <td className="px-4 py-2">
                        {/* Action : remettre la quantité à 0 pour retirer l’article */}
                        <button
                          type="button"
                          onClick={() => removeFromOrder(p.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300/60 transition"
                          aria-label={`Supprimer ${p.name}`}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs">Supprimer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Ligne total panier */}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3">{totalItems}</td>
                    <td />
                    <td className="px-4 py-3 text-blue-600 text-lg">
                      {totalPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* —— Bouton de soumission : désactivé si panier vide —— */}
        <button
          type="submit"
          disabled={!hasSelection}
          className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition
                      hover:bg-green-700
                      ${!hasSelection ? "opacity-50 cursor-not-allowed hover:bg-blue-600" : ""}`}
        >
          Confirmer la commande
        </button>
      </form>

      {/* —— Modale de confirmation (avant validation finale) —— */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          {/* Overlay cliquable pour fermer */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Récapitulatif de la commande</h3>
            </div>

            {/* Contenu : tableau récapitulatif du panier courant */}
            <div className="max-h-[60vh] overflow-auto p-6">
              {selectedProducts.length > 0 ? (
                <table className="min-w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Produit</th>
                      <th className="px-4 py-2">Quantité</th>
                      <th className="px-4 py-2">Prix unitaire</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="px-4 py-2">{p.qty}</td>
                        <td className="px-4 py-2">
                          {p.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                        </td>
                        <td className="px-4 py-2">
                          {(p.qty * p.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                        </td>
                      </tr>
                    ))}
                    {/* Ligne total modale */}
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-4 py-2">Total</td>
                      <td className="px-4 py-2">{totalItems}</td>
                      <td />
                      <td className="px-4 py-2 text-blue-600">
                        {totalPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 italic">Aucun produit sélectionné.</p>
              )}
            </div>

            {/* Question + actions de confirmation */}
            <div className="px-6 pb-6">
              <p className="mt-4 text-base">Êtes-vous sûr de confirmer la commande ?</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              {/* Bouton d’annulation (ferme la modale) */}
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-300 text-white hover:bg-gray-400"
              >
                Non
              </button>
              {/* Bouton de validation finale */}
              <button
                type="button"
                onClick={() => {
                  // 1) Snapshot des quantités (pour l'écran de succès)
                  const qSnap = { ...formData.quantities };
                  setConfirmedQuantities(qSnap);

                  // 2) Application côté contexte : décrémente le stock + incrémente le nombre de commandes
                  applyOrder(qSnap);

                  // 3) Reset des quantités en UI, fermeture de la modale et passage à l'écran de succès
                  setFormData((prev) => ({ ...prev, quantities: initialQuantities }));
                  setIsConfirmOpen(false);
                  setIsConfirmed(true);
                }}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}