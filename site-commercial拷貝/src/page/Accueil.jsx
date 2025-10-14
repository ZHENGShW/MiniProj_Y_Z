import { useMemo } from "react";
import { Package, ShoppingCart, Boxes, DollarSign, Trophy } from "lucide-react";
import { useAppState } from "../context/AppState";

// Composant de statistique réutilisable
function Stat({ icon: Icon, title, value, color = "text-gray-800", bg = "bg-gray-100" }) {
  return (
    <div className="p-6 rounded-xl border bg-white shadow-sm flex items-center gap-4 hover:shadow-md transition">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Accueil() {
  const { items, ordersCount, totalRevenue, topProducts } = useAppState();

  // Nombre total de produits
  const totalProducts = items.length;

  // Stock moyen global
  const avgStock = useMemo(() => {
    if (items.length === 0) return "0";
    const sum = items.reduce((s, p) => s + p.quantity, 0);
    return (sum / items.length).toFixed(0);
  }, [items]);

  // Catégories existantes
  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return Array.from(set).sort();
  }, [items]);

  return (
    <div className="p-10 space-y-10">
      {/* ——— Titre principal ——— */}
      <h2 className="text-3xl font-bold mb-8">Tableau de bord</h2>

      {/* ——— Bloc des statistiques principales ——— */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          icon={Package}
          title="Produits enregistrés"
          value={totalProducts}
          bg="bg-blue-100"
          color="text-blue-700"
        />
        <Stat
          icon={Boxes}
          title="Stock moyen"
          value={avgStock}
          bg="bg-green-100"
          color="text-green-700"
        />
        <Stat
          icon={ShoppingCart}
          title="Commandes passées"
          value={ordersCount}
          bg="bg-purple-100"
          color="text-purple-700"
        />
        <Stat
          icon={DollarSign}
          title="Chiffre d’affaires"
          value={totalRevenue.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
          bg="bg-yellow-100"
          color="text-yellow-700"
        />
      </div>

      {/* ——— Section des catégories ——— */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Catégories de produits</h3>
        <div className="flex flex-wrap gap-3">
          {categories.length > 0 ? (
            categories.map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                {c}
              </span>
            ))
          ) : (
            <span className="text-gray-500 italic">Aucune catégorie.</span>
          )}
        </div>
      </div>

      {/* ——— Section Top Produits ——— */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Top 3 produits les plus vendus
        </h3>

        {topProducts.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Quantité vendue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        #{i + 1}
                      </span>
                      {p.name}
                    </td>
                    <td className="px-4 py-2 text-blue-600 font-semibold">
                      {p.qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Aucune commande passée pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}