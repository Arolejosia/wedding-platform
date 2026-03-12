import React, { useState, useEffect } from "react";
import "./BudgetTracker.css";
import { useParams } from "react-router-dom";
import API_URL from "../config/api";

const TASKS_URL = `${API_URL}/api/tasks`;

const CATEGORIES = [
  { value: "venue", label: "Lieu", icon: "🏛️", color: "#FF6B9D" },
  { value: "catering", label: "Traiteur", icon: "🍽️", color: "#4ECDC4" },
  { value: "decoration", label: "Décoration", icon: "🎨", color: "#FFD93D" },
  { value: "photography", label: "Photo/Vidéo", icon: "📸", color: "#95E1D3" },
  { value: "music", label: "Musique", icon: "🎵", color: "#AA96DA" },
  { value: "invitations", label: "Invitations", icon: "💌", color: "#FCBAD3" },
  { value: "outfits", label: "Tenues", icon: "👗", color: "#F38181" },
  { value: "transport", label: "Transport", icon: "🚗", color: "#6A2C70" },
  { value: "flowers", label: "Fleurs", icon: "💐", color: "#B8E994" },
  { value: "cake", label: "Gâteau", icon: "🎂", color: "#FFA07A" },
  { value: "gifts", label: "Cadeaux", icon: "🎁", color: "#87CEEB" },
  { value: "other", label: "Autre", icon: "📌", color: "#999" },
];

const BudgetTracker = () => {
  const { weddingId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${TASKS_URL}?weddingId=${weddingId}`);
      const data = await res.json();

      const tasks = data.tasks || [];

      setTasks(tasks);
      calculateStats(tasks);
    } catch (err) {
      console.error("Erreur chargement tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasks) => {
    let totalCost = 0;
    let totalPaid = 0;
    let byCategory = {};

    tasks.forEach((task) => {
      if (task.cost) {
        totalCost += task.cost;

        if (task.paid) {
          totalPaid += task.cost;
        }

        if (!byCategory[task.category]) {
          byCategory[task.category] = {
            actual: 0,
            count: 0,
          };
        }

        byCategory[task.category].actual += task.cost;
        byCategory[task.category].count += 1;
      }
    });

    setStats({
      totalBudget: totalCost,
      totalActual: totalCost,
      totalPaid: totalPaid,
      remaining: totalCost - totalPaid,
      byCategory,
    });
  };

  const filteredExpenses = (tasks || [])
    .filter((t) => t.cost > 0)
    .filter((t) => filterCategory === "all" || t.category === filterCategory);

  const formatMoney = (amount) => {
    return amount?.toLocaleString("fr-FR") || "0";
  };

  const getPercentage = (part, total) => {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  };

  if (loading) {
    return (
      <div className="budget-loading">
        <div className="spinner-large"></div>
        <p>Chargement du budget...</p>
      </div>
    );
  }

  return (
    <div className="budget-tracker">
      <header className="budget-header">
        <h1>💰 Suivi Budget</h1>
      </header>

      {/* Stats globales */}
      <div className="budget-overview">
        <div className="overview-card total">
          <h3>Budget Total</h3>
          <p className="amount">{formatMoney(stats?.totalBudget)} FCFA</p>
        </div>

        <div className="overview-card spent">
          <h3>Dépensé</h3>
          <p className="amount">{formatMoney(stats?.totalActual)} FCFA</p>
          <span className="percentage">
            {getPercentage(stats?.totalActual, stats?.totalBudget)}%
          </span>
        </div>

        <div className="overview-card paid">
          <h3>Payé</h3>
          <p className="amount">{formatMoney(stats?.totalPaid)} FCFA</p>
          <span className="percentage">
            {getPercentage(stats?.totalPaid, stats?.totalActual)}%
          </span>
        </div>

        <div className="overview-card remaining">
          <h3>Restant</h3>
          <p className="amount">{formatMoney(stats?.remaining)} FCFA</p>
          <span className="percentage">
            {getPercentage(stats?.remaining, stats?.totalBudget)}%
          </span>
        </div>

        {getPercentage(stats?.totalActual, stats?.totalBudget) > 90 && (
          <div className="budget-alert warning">
            ⚠️ Vous approchez de la limite du budget
          </div>
        )}
      </div>

      {/* Barre progression */}
      <div className="budget-progress-section">
        <div className="progress-labels">
          <span>
            Progression :{" "}
            {getPercentage(stats?.totalActual, stats?.totalBudget)}%
          </span>
          <span>
            {formatMoney(stats?.totalActual)} /{" "}
            {formatMoney(stats?.totalBudget)} FCFA
          </span>
        </div>

        <div className="budget-progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${getPercentage(
                stats?.totalActual,
                stats?.totalBudget
              )}%`,
            }}
          ></div>
        </div>

        <div className="budget-tips">
          {stats?.remaining > 0 && (
            <p>
              💡 Il vous reste {formatMoney(stats.remaining)} FCFA dans votre
              budget.
            </p>
          )}

          {stats?.remaining < 0 && (
            <p className="danger">
              ⚠️ Budget dépassé de {formatMoney(Math.abs(stats.remaining))} FCFA
            </p>
          )}
        </div>
      </div>

      {/* Graphique catégories */}
      <div className="category-breakdown">
        <h2>Répartition par catégorie</h2>

        <div className="category-chart">
          {CATEGORIES.map((cat) => {
            const catStats = stats?.byCategory?.[cat.value];
            if (!catStats || catStats.count === 0) return null;

            return (
              <div key={cat.value} className="category-bar">
                <div className="cat-label">
                  <span>
                    {cat.icon} {cat.label}
                  </span>
                  <span className="cat-amount">
                    {formatMoney(catStats.actual)} FCFA
                  </span>
                </div>

                <div className="cat-bar-bg">
                  <div
                    className="cat-bar-fill"
                    style={{
                      width: `${getPercentage(
                        catStats.actual,
                        stats.totalActual
                      )}%`,
                      background: cat.color,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste dépenses */}
      <div className="expenses-section">
        <div className="expenses-header">
          <h2>Dépenses ({filteredExpenses.length})</h2>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes catégories</option>

            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="expenses-grid">
          {filteredExpenses.map((expense) => {
            const cat = CATEGORIES.find((c) => c.value === expense.category);

            return (
              <div key={expense._id} className="expense-card">
                <div className="expense-header">
                  <div className="expense-title">
                    <span
                      className="expense-icon"
                      style={{ color: cat?.color }}
                    >
                      {cat?.icon}
                    </span>

                    <h3>{expense.title}</h3>
                  </div>
                </div>

                <div className="expense-amounts">
                  <div className="amount-row">
                    <span>Coût :</span>
                    <strong>{formatMoney(expense.cost)} FCFA</strong>
                  </div>

                  <div className="amount-row paid">
                    <span>Statut :</span>

                    <strong>
                      {expense.paid
                        ? "✅ Payé"
                        : `⏳ ${formatMoney(expense.cost)} à payer`}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExpenses.length === 0 && (
          <p className="empty-state">Aucune dépense dans cette catégorie</p>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;