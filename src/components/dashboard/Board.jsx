 import React from "react";
import Card from "../ui/Card";

const CardContent = Card.Content;
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Settings, Users, FileText, LayoutDashboard } from "lucide-react";

const data = [
  { name: "Traité", value: 40 },
  { name: "En cours", value: 25 },
  { name: "Rejeté", value: 10 },
];

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-4 space-y-4">
        <div className="text-2xl font-bold mb-4">LOGO</div>
        <nav className="space-y-2">
          <div className="flex items-center gap-2"><LayoutDashboard size={18}/> Tableau de bord</div>
          <div className="flex items-center gap-2"><Users size={18}/> Gestion des utilisateurs</div>
          <div className="flex items-center gap-2"><FileText size={18}/> Gestion des plaintes</div>
          <div className="flex items-center gap-2"><Settings size={18}/> Paramètres</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Rechercher..." className="p-2 border rounded-md" />
            <button className="bg-blue-900 text-white p-2 rounded-md"><Search size={16}/></button>
          </div>
        </div>

        {/* Diagram Section */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Statistiques des plaintes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Liste des plaintes</h2>
            <div className="overflow-auto">
              <table className="min-w-full table-auto border border-gray-200">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Secteur</th>
                    <th className="p-2 border">Sous-secteur</th>
                    <th className="p-2 border">Libellé</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Statut</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="p-2 border">001</td>
                    <td className="p-2 border">Santé</td>
                    <td className="p-2 border">Hôpitaux</td>
                    <td className="p-2 border">Manque de personnel</td>
                    <td className="p-2 border">2025-05-26</td>
                    <td className="p-2 border text-yellow-600">En cours</td>
                    <td className="p-2 border space-x-2">
                      <button className="text-blue-600">Voir</button>
                      <button className="text-green-600">Traiter</button>
                      <button className="text-red-600">Supprimer</button>
                    </td>
                  </tr>
                  {/* D'autres lignes peuvent être ajoutées ici */}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
