import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">ShopZen</h1>
      <div className="flex space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-4 py-2 rounded font-bold transition ${
              isActive ? "bg-blue-800" : "hover:bg-blue-500"
            }`
          }
        >
          Accueil
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `px-4 py-2 rounded font-bold transition ${
              isActive ? "bg-blue-800" : "hover:bg-blue-500"
            }`
          }
        >
          Produits
        </NavLink>
        <NavLink
          to="/order"
          className={({ isActive }) =>
            `px-4 py-2 rounded font-bold transition ${
              isActive ? "bg-blue-800" : "hover:bg-blue-500"
            }`
          }
        >
          Commande
        </NavLink>
      </div>
    </nav>
  );
}
