import React, { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { apiRequest } from '../utils/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Building2, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
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
      <div className="hero min-h-[400px] bg-base-200 rounded-box">
        <div className="hero-content text-center">
          <div className="max-w-md">
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
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-base-content/60 mb-6">
        Proyek: {selectedProject.nama}
      </p>

      {/* Summary Cards in One Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <SummaryCard title="Jumlah Proyek" value={summaryData.totalProjects} />
        <SummaryCard title="Total Unit" value={summaryData.totalUnits} />
        <SummaryCard title="Total Merk AC" value={summaryData.totalMerkAC} />
        <SummaryCard title="Total Model AC" value={summaryData.totalModelAC} />
        <SummaryCard title="Total Gedung" value={summaryData.totalGedung} />
        <SummaryCard title="Total Maintenance" value={summaryData.totalMaintenance} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Chart */}
        <div className="card bg-base-100 shadow-xl  transition-transform duration-300 hover:scale-[1.01]">
          <div className="card-body">
            <h2 className="card-title mb-4 flex items-center gap-2 text">
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

        {/* Distribution by Building Chart */}
        <div className="card bg-base-100 shadow-xl  transition-transform duration-300 hover:scale-[1.01]">
          <div className="card-body">
            <h2 className="card-title mb-4 flex items-center gap-2 text">
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart: Distribution by Unit */}
        <div className="card bg-base-100 shadow-xl  transition-transform duration-300 hover:scale-[1.01] col-span-1 lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title mb-4 flex items-center gap-2 text">
              <Building2 className="w-5 h-5" />
              Distribusi Maintenance per Unit
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={unitDistributionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donut Chart: Completion Status */}
        <div className="card bg-base-100 shadow-xl  transition-transform duration-300 hover:scale-[1.01]">
          <div className="card-body">
            <h2 className="card-title mb-4 flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              Status Maintenance
            </h2>
            <div className="h-80">
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
      </div>
    </div>
  );
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 shadow-lg p-4 rounded-lg ">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-sm">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// Component untuk kartu ringkasan
const SummaryCard = ({ title, value }) => {
  return (
    <div className="card bg-base-100 shadow-xl  transition-transform duration-300 hover:scale-[1.02]">
      <div className="card-body p-4">
        <h2 className="card-title text-base font-semibold">{title}</h2>
        <p className="text-2xl font-bold text-center">{value}</p>
      </div>
    </div>
  );
};

export default DashboardPage;