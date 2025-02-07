import React, { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { apiRequest } from '../utils/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Building2, Calendar, CheckCircle2,TrendingUp,Activity, AlertTriangle,  ArrowUpRight} from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import _ from 'lodash';

const DashboardPage = () => {
  const { selectedProject } = useProject();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalMerkAC, setTotalMerkAC] = useState(0);
  const [totalModelAC, setTotalModelAC] = useState(0);
  const [totalGedung, setTotalGedung] = useState(0);
  const [totalMaintenance, setTotalMaintenance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Chart colors
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProject) return;

      try {
        setLoading(true);

        // Fetch maintenance data
        const maintenance = await apiRequest(`/maintenance/project/${selectedProject.id}`, 'GET', null, true);
        setMaintenanceData(maintenance);

        // Fetch total units in project
        const totalUnitsResponse = await apiRequest(`/unit/${selectedProject.id}/total`, 'GET', null, true);
        setTotalUnits(totalUnitsResponse.totalUnits);

        // // Fetch total merk AC
        const totalMerkResponse = await apiRequest('/merek/total', 'GET', null, true);
        setTotalMerkAC(totalMerkResponse.totalMerek);

        // Fetch total model AC
        const totalModelResponse = await apiRequest('/jenis-model/total', 'GET', null, true);
        setTotalModelAC(totalModelResponse.totalJenisModel);


        const totalProjectsResponse = await apiRequest(`/proyek/total`, 'GET', null, true);
        setTotalProjects(totalProjectsResponse.totalProyek);

        // Fetch total gedung in project
        const totalGedungResponse = await apiRequest(`/proyek/${selectedProject.id}/total-gedung`, 'GET', null, true);
        setTotalGedung(totalGedungResponse.totalGedung);

        // Fetch total maintenance in project
        const totalMaintenanceResponse = await apiRequest(`/maintenance/project/${selectedProject.id}/total-maintenance`, 'GET', null, true);
        setTotalMaintenance(totalMaintenanceResponse.totalMaintenance);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProject]);

  // Prepare summary data
  const summaryData = React.useMemo(() => {
    return {
      totalProjects, // Assuming only one project is selected
      totalUnits,
      totalMerkAC,
      totalModelAC,
      totalGedung,
      totalMaintenance,
    };
  }, [totalUnits, totalMerkAC, totalModelAC, totalGedung, totalMaintenance]);

  // Prepare data for monthly trend chart
  const monthlyTrendData = React.useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM yyyy', { locale: id }),
        date: startOfMonth(date),
        maintenanceCount: 0
      };
    }).reverse();

    maintenanceData.forEach(maintenance => {
      const maintenanceDate = new Date(maintenance.tanggal);
      const monthData = last6Months.find(m =>
        maintenanceDate >= m.date &&
        maintenanceDate < new Date(m.date.getFullYear(), m.date.getMonth() + 1, 1)
      );
      if (monthData) {
        monthData.maintenanceCount++;
      }
    });

    return last6Months.map(({ month, maintenanceCount }) => ({
      month,
      maintenanceCount
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

  // Prepare data for bar chart (distribution by unit)
  const unitDistributionData = React.useMemo(() => {
    const grouped = _.groupBy(maintenanceData, 'unit.id');
    return Object.entries(grouped).map(([id, maintenances]) => ({
      name: maintenances[0].unit.nama || `Unit ${id}`,
      count: maintenances.length
    })).sort((a, b) => b.count - a.count); // Sort by count descending
  }, [maintenanceData]);

  // Prepare data for donut chart (completed vs pending maintenance)
  const completionStatusData = React.useMemo(() => {
    const completed = maintenanceData.filter(m => m.status === 'selesai').length;
    const pending = maintenanceData.filter(m => m.status !== 'selesai').length;
    return [
      { name: 'Selesai', value: completed },
      { name: 'Belum Selesai', value: pending }
    ];
  }, [maintenanceData]);

  if (!selectedProject) {
    return (
      <div className="min-h-[400px] bg-base-200 rounded-xl p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Selamat Datang di Dashboard</h1>
          <p className="text-lg opacity-70">
            Silakan pilih proyek untuk memulai visualisasi data
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm opacity-70">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard Analytics</h1>
          <p className="text-base-content/60 mt-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {selectedProject.nama}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
            Last updated: {format(new Date(), 'dd MMM yyyy')}
          </span>
        </div>
      </div>

      {/* Quick Stats Grid - Reduced to 3 cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <QuickStatCard
          title="Overview Proyek"
          value={`${summaryData.totalProjects} Proyek / ${summaryData.totalGedung} Gedung`}
          icon={<Building2 className="w-5 h-5" />}
          trend="+2.5%"
        />
        <QuickStatCard
          title="Unit & Model"
          value={`${summaryData.totalUnits} Unit / ${summaryData.totalModelAC} Model`}
          icon={<Activity className="w-5 h-5" />}
          trend="+5.2%"
        />
        <QuickStatCard
          title="Total Maintenance"
          value={summaryData.totalMaintenance}
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend="+4.7%"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Trend Chart */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="card-title flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Tren Maintenance
                </h2>
                <select className="select select-sm select-bordered">
                  <option>6 Bulan Terakhir</option>
                  <option>12 Bulan Terakhir</option>
                </select>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="maintenanceCount"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', r: 5 }}
                      activeDot={{ r: 8 }}
                      name="Maintenance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Unit Distribution Bar Chart */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="card-title flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Distribusi per Unit
                </h2>
                <button className="btn btn-sm btn-ghost">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Donut Chart */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Status Maintenance
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionStatusData}
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {completionStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Building Distribution */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Distribusi per Gedung
              </h2>
              <div className="h-[300px]">
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickStatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-lg p-2 bg-base-200">{icon}</div>
          <span className="text-xs text-success flex items-center gap-1">
            {trend}
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 shadow-lg p-4 rounded-lg border border-base-300">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-sm">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default DashboardPage;