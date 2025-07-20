import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from './ui/GlobalUI';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';




interface OrderStat {
  month: string;
  count: number;
}

export default function DashboardContent() {
  const { isLightMode, currentThemeData } = useTheme();
  const [stats, setStats] = useState({

    products: 0,
    rawMaterials: 0,
    finishedGoods: 0,
    productionOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [products, rawMaterials, finishedGoods, productionOrders] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('raw_materials').select('id', { count: 'exact' }),
          supabase.from('finished_goods_inventory').select('id', { count: 'exact' }),
          supabase.from('production_orders').select('id', { count: 'exact' })
        ]);

        setStats({
          products: products.count || 0,
          rawMaterials: rawMaterials.count || 0,
          finishedGoods: finishedGoods.count || 0,
          productionOrders: productionOrders.count || 0
        });
      } catch (e) {
        console.error('Error fetching stats:', e);
      }

      setLoading(false);
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchOrderStats() {
      setLoadingChart(true);
      try {
        const { data } = await supabase
          .from('production_orders')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

        const monthCounts: Record<string, number> = {};
        data?.forEach(order => {
          const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          monthCounts[month] = (monthCounts[month] || 0) + 1;
        });

        const chartData = Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
        setOrderStats(chartData);
      } catch (e) {
        console.error('Error fetching order stats:', e);
      }

      setLoadingChart(false);
    }
    fetchOrderStats();
  }, []);

  useEffect(() => {
    async function fetchRecentOrders() {
      setLoadingRecent(true);
      try {
        const { data } = await supabase
          .from('production_orders')
          .select('order_number, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(data || []);
      } catch (e) {
        console.error('Error fetching recent orders:', e);
      }

      setLoadingRecent(false);
    }
    fetchRecentOrders();
  }, []);

  // Simple SVG Bar Chart
  function BarChart({ data }: { data: OrderStat[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
      <div className="flex items-end gap-2 h-40">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className="rounded-t"
              style={{
                backgroundColor: currentThemeData.primary,
                height: `${(item.count / max) * 120}px`,
                width: '40px'
              }}
            />

            <div className="text-xs text-center">{item.month}</div>
            <div className="text-xs font-bold">{item.count}</div>
          </div>
        ))}
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats Cards */}
      <Card
        style={{
          backgroundColor: isLightMode ? '#e0f2fe' : '#0c4a6e',
          color: isLightMode ? '#0c4a6e' : '#e0f2fe',
        }}
        className="text-center"
      >
        <CardContent className="p-6">
          <div className="text-3xl font-bold">{stats.products}</div>
          <div className="text-lg">Products</div>
        </CardContent>
      </Card>
      <Card
        style={{
          backgroundColor: isLightMode ? '#dcfce7' : '#166534',
          color: isLightMode ? '#166534' : '#dcfce7',
        }}
        className="text-center"
      >
        <CardContent className="p-6">
          <div className="text-3xl font-bold">{stats.rawMaterials}</div>
          <div className="text-lg">Raw Materials</div>
        </CardContent>
      </Card>
      <Card
        style={{
          backgroundColor: isLightMode ? '#fef9c3' : '#854d0e',
          color: isLightMode ? '#854d0e' : '#fef9c3',
        }}
        className="text-center"
      >
        <CardContent className="p-6">
          <div className="text-3xl font-bold">{stats.finishedGoods}</div>
          <div className="text-lg">Finished Goods</div>
        </CardContent>
      </Card>
      <Card
        style={{
          backgroundColor: isLightMode ? '#f3e8ff' : '#581c87',
          color: isLightMode ? '#581c87' : '#f3e8ff',
        }}
        className="text-center"
      >
        <CardContent className="p-6">
          <div className="text-3xl font-bold">{stats.productionOrders}</div>
          <div className="text-lg">Production Orders</div>
        </CardContent>
      </Card>


      {/* Chart and Recent Activity */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 mt-6">
        <CardHeader>
          <CardTitle>Production Orders per Month</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingChart ? <div>Loading chart...</div> : <BarChart data={orderStats} />}
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 mt-6">
        <CardHeader>
          <CardTitle>Recent Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div>Loading recent orders...</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Order Number</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.order_number}</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
