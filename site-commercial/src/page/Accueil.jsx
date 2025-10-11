import { useMemo } from "react";
import { Package, ShoppingCart, Boxes } from "lucide-react";
import { useAppState } from "../context/AppState";

// —— Composant réutilisable pour afficher une statistique —— //
// Il affiche une icône, un titre et une valeur, avec un fond et une couleur configurables.
function Stat({ icon: Icon, title, value, color = "text-gray-800", bg = "bg-gray-100" }) {
  return (
    <div className="p-6 rounded-xl border bg-white shadow-sm flex items-center gap-4">
      {/* Icône colorée */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>

      {/* Texte : titre + valeur */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// —— Page principale "Accueil" —— //
// Présente un tableau de bord avec des statistiques générales et les catégories existantes.
export default function Accueil() {
  // Récupère les données globales depuis le contexte partagé de l'application
  const { items, ordersCount } = useAppState();

  // —— Calculs dérivés —— //

  // Nombre total de produits
  const totalProducts = items.length;

  // Stock moyen de tous les produits
  const avgStock = useMemo(() => {
    if (items.length === 0) return "0.0"; // Évite la division par zéro
    const sum = items.reduce((s, p) => s + p.quantity, 0); // Somme des quantités disponibles
    return (sum / items.length).toFixed(0); // Arrondi à 0 décimales
  }, [items]);

  // Liste des catégories existantes (unique et triée)
  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return Array.from(set).sort();
  }, [items]);

  // —— Rendu JSX —— //
  return (
    <div className="p-10">
      {/* Titre principal de la page */}
      <h2 className="text-3xl font-bold mb-8">Accueil</h2>

      {/* ——— Bloc des statistiques principales ——— */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Nombre de produits enregistrés */}
        <Stat
          icon={Package}
          title="Nombre de produits"
          value={totalProducts}
          bg="bg-blue-100"
          color="text-blue-700"
        />

        {/* Stock moyen global */}
        <Stat
          icon={Boxes}
          title="Stock moyen"
          value={avgStock}
          bg="bg-green-100"
          color="text-green-700"
        />

        {/* Nombre total de commandes passées (côté front / session) */}
        <Stat
          icon={ShoppingCart}
          title="Commandes passées"
          value={ordersCount}
          bg="bg-purple-100"
          color="text-purple-700"
        />
      </div>

      {/* ——— Section des catégories ——— */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Catégories</h3>

        {/* Affichage sous forme d’étiquettes (badges) */}
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <span
              key={c}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
            >
              {c}
            </span>
          ))}

          {/* Message alternatif si aucune catégorie trouvée */}
          {categories.length === 0 && (
            <span className="text-gray-500 italic">Aucune catégorie.</span>
          )}
        </div>
      </div>
    </div>
  );
}
