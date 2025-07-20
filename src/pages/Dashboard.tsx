import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface OrderStat {
  month: string;
  count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    rawMaterials: 0,
    finishedGoods: 0,
    productionOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const [products, rawMaterials, finishedGoods, productionOrders] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('raw_materials').select('id', { count: 'exact', head: true }),
        supabase.from('finished_goods_inventory').select('id', { count: 'exact', head: true }),
        supabase.from('production_orders').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        products: products.count || 0,
        rawMaterials: rawMaterials.count || 0,
        finishedGoods: finishedGoods.count || 0,
        productionOrders: productionOrders.count || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchOrderStats() {
      setLoadingChart(true);
      // Get last 6 months
      const now = new Date();
      const months: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
      // Fetch all orders in last 6 months
      const since = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);
      const { data } = await supabase
        .from('production_orders')
        .select('id, created_at')
        .gte('created_at', since);
      // Count per month
      const counts: Record<string, number> = {};
      months.forEach(m => (counts[m] = 0));
      (data || []).forEach((o: any) => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (counts[key] !== undefined) counts[key]++;
      });
      setOrderStats(months.map(m => ({ month: m, count: counts[m] })));
      setLoadingChart(false);
    }
    fetchOrderStats();
  }, []);

  useEffect(() => {
    async function fetchRecentOrders() {
      setLoadingRecent(true);
      const { data } = await supabase
        .from('production_orders')
        .select('order_number, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders(data || []);
      setLoadingRecent(false);
    }
    fetchRecentOrders();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  // SVG Bar Chart (simple, no external lib)
  function BarChart({ data }: { data: OrderStat[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    const width = 300;
    const height = 120;
    const barWidth = 40;
    const gap = 10;
    return (
      <svg width={width} height={height}>
        {data.map((d, i) => (
          <g key={d.month}>
            <rect
              x={i * (barWidth + gap) + 20}
              y={height - (d.count / max) * 80 - 20}
              width={barWidth}
              height={(d.count / max) * 80}
              fill="#3b82f6"
            />
            <text
              x={i * (barWidth + gap) + 20 + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize={12}
            >
              {d.month.slice(5)}
            </text>
            <text
              x={i * (barWidth + gap) + 20 + barWidth / 2}
              y={height - (d.count / max) * 80 - 25}
              textAnchor="middle"
              fontSize={12}
              fill="#222"
            >
              {d.count}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-100 p-6 rounded shadow text-center">
        <div className="text-3xl font-bold">{stats.products}</div>
        <div className="text-lg">Products</div>
      </div>
      <div className="bg-green-100 p-6 rounded shadow text-center">
        <div className="text-3xl font-bold">{stats.rawMaterials}</div>
        <div className="text-lg">Raw Materials</div>
      </div>
      <div className="bg-yellow-100 p-6 rounded shadow text-center">
        <div className="text-3xl font-bold">{stats.finishedGoods}</div>
        <div className="text-lg">Finished Goods</div>
      </div>
      <div className="bg-purple-100 p-6 rounded shadow text-center">
        <div className="text-3xl font-bold">{stats.productionOrders}</div>
        <div className="text-lg">Production Orders</div>
      </div>
      {/* Chart and Recent Activity */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-bold mb-2">Production Orders per Month</h2>
        {loadingChart ? <div>Loading chart...</div> : <BarChart data={orderStats} />}
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-bold mb-2">Recent Production Orders</h2>
        {loadingRecent ? (
          <div>Loading recent activity...</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => (
                <tr key={i}>
                  <td>{o.order_number}</td>
                  <td>{o.status}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 