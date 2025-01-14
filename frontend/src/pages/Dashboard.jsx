import React, { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { apiRequest } from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Building2, Wrench, Calendar, 
  AlertTriangle, CheckCircle2, PieChart as PieChartIcon 
} from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import _ from 'lodash';

const DashboardPage = () => {
  const { selectedProject } = useProject();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chart colors
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProject) return;
      try {
        setLoading(true);
        const data = await apiRequest(`/maintenance/project/${selectedProject.id}`, 'GET', null, true);
        setMaintenanceData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProject]);

  // Prepare data for summary cards
  const summaryData = React.useMemo(() => {
    const total = maintenanceData.length;
    const rutinCount = maintenanceData.filter(m => m.kategori === 'rutin').length;
    const insidentilCount = maintenanceData.filter(m => m.kategori === 'insidentil').length;
    const uniqueGedungCount = _.uniqBy(maintenanceData, 'unit.ruangan.gedung.id').length;

    return {
      total,
      rutinCount,
      insidentilCount,
      uniqueGedungCount
    };
  }, [maintenanceData]);

  // Prepare data for monthly trend chart
  const monthlyTrendData = React.useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM yyyy', { locale: id }),
        date: startOfMonth(date),
        rutin: 0,
        insidentil: 0
      };
    }).reverse();

    maintenanceData.forEach(maintenance => {
      const maintenanceDate = new Date(maintenance.tanggal);
      const monthData = last6Months.find(m => 
        maintenanceDate >= m.date && 
        maintenanceDate < new Date(m.date.getFullYear(), m.date.getMonth() + 1, 1)
      );
      
      if (monthData) {
        if (maintenance.kategori === 'rutin') {
          monthData.rutin++;
        } else {
          monthData.insidentil++;
        }
      }
    });

    return last6Months.map(({ month, rutin, insidentil }) => ({
      month,
      rutin,
      insidentil
    }));
  }, [maintenanceData]);

  // Prepare data for distribution by building chart
  const buildingData = React.useMemo(() => {
    const grouped = _.groupBy(maintenanceData, 'unit.ruangan.gedung.id');
    return Object.entries(grouped).map(([id, maintenances]) => ({
      name: maintenances[0].unit.ruangan.gedung.nama,
      value: maintenances.length
    }));
  }, [maintenanceData]);

  if (!selectedProject) {
    return (
      <div className="hero min-h-[400px] bg-base-200 rounded-box">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <PieChartIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h1 className="text-2xl font-bold">Selamat Datang!</h1>
            <p className="py-4 opacity-70">
              Silakan pilih proyek terlebih dahulu untuk melihat dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-base-content/60 mb-6">
        Proyek: {selectedProject.nama}
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Total Maintenance</h2>
              <Wrench className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{summaryData.total}</p>
          </div>
        </div>

        <div className="card bg-info text-info-content">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">xxxx</h2>
              <CheckCircle2 className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{summaryData.rutinCount}</p>
          </div>
        </div>

        <div className="card bg-warning text-warning-content">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">xxx </h2>
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{summaryData.insidentilCount}</p>
          </div>
        </div>

        <div className="card bg-secondary text-secondary-content">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Jumlah Gedung</h2>
              <Building2 className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{summaryData.uniqueGedungCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Calendar className="w-5 h-5" />
              Tren Maintenance 6 Bulan Terakhir
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rutin" 
                    stroke="#3B82F6" 
                    name="Maintenance Rutin"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="insidentil" 
                    stroke="#F59E0B"
                    name="Maintenance Insidentil" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribution by Building Chart */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Building2 className="w-5 h-5" />
              Distribusi Maintenance per Gedung
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buildingData}
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {buildingData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;