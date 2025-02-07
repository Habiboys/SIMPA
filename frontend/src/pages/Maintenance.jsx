import React, { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { apiRequest, BASE_URL } from '../utils/api';
import { 
  FileSpreadsheet, Calendar, Download, Building2,
  ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';
import _ from 'lodash';

const MaintenancePage = () => {
  const { selectedProject } = useProject();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [activeTab, setActiveTab] = useState('pemeriksaan');
  const [sortConfig, setSortConfig] = useState({ field: 'tanggal', direction: 'desc' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filters, setFilters] = useState({
    gedung: 'all',
    ruangan: 'all'
  });

  // Get unique gedung and ruangan lists
  const gedungList = React.useMemo(() => {
    return _.uniqBy(maintenanceData, 'unit.ruangan.gedung.id')
      .map(item => ({
        id: item.unit?.ruangan?.gedung?.id,
        nama: item.unit?.ruangan?.gedung?.nama
      }))
      .filter(item => item.id && item.nama);
  }, [maintenanceData]);

  const ruanganList = React.useMemo(() => {
    let ruangans = [];
    if (filters.gedung === 'all') {
      ruangans = maintenanceData;
    } else {
      ruangans = maintenanceData.filter(
        item => item.unit?.ruangan?.gedung?.id === parseInt(filters.gedung)
      );
    }
    return _.uniqBy(ruangans, 'unit.ruangan.id')
      .map(item => ({
        id: item.unit?.ruangan?.id,
        nama: item.unit?.ruangan?.nama,
        gedungId: item.unit?.ruangan?.gedung?.id
      }))
      .filter(item => item.id && item.nama);
  }, [maintenanceData, filters.gedung]);

  const showAlert = (message, type = 'success') => {
    Swal.fire({
      icon: type,
      title: type === 'success' ? 'Berhasil!' : 'Gagal!',
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const fetchMaintenanceData = async () => {
    try {
      if (!selectedProject) return;
      setLoading(true);
      const data = await apiRequest(`/maintenance/project/${selectedProject.id}`, 'GET', null, true);
      setMaintenanceData(data);
    } catch (error) {
      showAlert(error.message || 'Gagal mengambil data maintenance', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchMaintenanceData();
    }
  }, [selectedProject]);

  useEffect(() => {
    // Reset ruangan filter when gedung changes
    if (filters.gedung !== 'all') {
      setFilters(prev => ({ ...prev, ruangan: 'all' }));
    }
  }, [filters.gedung]);

  const handleSort = (field) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredAndSortedData = () => {
    let filtered = [...maintenanceData];

    // Apply gedung filter
    if (filters.gedung !== 'all') {
      filtered = filtered.filter(
        item => item.unit?.ruangan?.gedung?.id === parseInt(filters.gedung)
      );
    }

    // Apply ruangan filter
    if (filters.ruangan !== 'all') {
      filtered = filtered.filter(
        item => item.unit?.ruangan?.id === parseInt(filters.ruangan)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.field === 'tanggal') {
        return direction * (new Date(a.tanggal) - new Date(b.tanggal));
      }
      return 0;
    });

    return filtered;
  };

  

  const handleExport = async () => {
    try {
      let endpoint = `/maintenance/export/project/${selectedProject.id}`;
  
      // Format tanggal jika ada
      const formattedStartDate = exportDateRange.startDate
        ? format(new Date(exportDateRange.startDate), 'yyyy-MM-dd')
        : null;
      const formattedEndDate = exportDateRange.endDate
        ? format(new Date(exportDateRange.endDate), 'yyyy-MM-dd')
        : null;
  
      // Tambahkan parameter tanggal ke endpoint jika ada
      if (formattedStartDate && formattedEndDate) {
        endpoint += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      }
  
      // Gunakan apiRequest untuk mengunduh file
      const blob = await apiRequest(endpoint, "GET", null, true, true);
  
      // Tentukan nama file
      let fileName;
      if (formattedStartDate && formattedEndDate) {
        // Jika export berdasarkan tanggal, tambahkan rentang tanggal ke nama file
        fileName = `maintenance_export_${selectedProject.nama}_${formattedStartDate}_${formattedEndDate}.xlsx`;
      } else {
        // Jika export semua, cukup gunakan nama project
        fileName = `maintenance_export_${selectedProject.nama}.xlsx`;
      }
  
      // Handle file download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  
      setShowExportModal(false);
    } catch (error) {
      showAlert(error.message || 'Gagal mengexport data', 'error');
    }
  };

  const showDetailModal = (maintenance) => {
    setSelectedMaintenance(maintenance);
    document.getElementById('modal-detail').showModal();
  };

  const closeModal = () => {
    document.getElementById('modal-detail')?.close();
    setSelectedMaintenance(null);
  };

  if (!selectedProject) {
    return (
      <div className="hero min-h-[400px] bg-base-200 rounded-box">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h1 className="text-2xl font-bold">Selamat Datang!</h1>
            <p className="py-4 opacity-70">
              Silakan pilih proyek terlebih dahulu untuk melihat data maintenance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Data Maintenance
          </h1>
          <p className="text-base-content/60 mt-1">
            Proyek: {selectedProject.nama}
          </p>
        </div>
        <button 
  onClick={() => setShowExportModal(true)} 
  className="btn btn-primary"
  disabled={exportLoading}
>
  {exportLoading ? (
    <span className="loading loading-spinner"></span>
  ) : (
    <>
      <Download className="w-4 h-4" /> Export Data
    </>
  )}
</button>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6">
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Filter Gedung</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.gedung}
                onChange={(e) => setFilters({ ...filters, gedung: e.target.value })}
              >
                <option value="all">Semua Gedung</option>
                {gedungList.map(gedung => (
                  <option key={gedung.id} value={gedung.id}>
                    {gedung.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Filter Ruangan</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.ruangan}
                onChange={(e) => setFilters({ ...filters, ruangan: e.target.value })}
                disabled={filters.gedung === 'all'}
              >
                <option value="all">Semua Ruangan</option>
                {ruanganList.map(ruangan => (
                  <option key={ruangan.id} value={ruangan.id}>
                    {ruangan.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th onClick={() => handleSort('tanggal')} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal
                      {sortConfig.field === 'tanggal' && (
                        <ArrowUpDown className={`w-4 h-4 ${
                          sortConfig.direction === 'desc' ? 'rotate-180' : ''
                        }`} />
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Gedung
                    </div>
                  </th>
                  <th>Ruangan</th>
                  <th>Unit</th>
                  <th>Kategori</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </td>
                  </tr>
                ) : filteredAndSortedData().length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="text-center py-8">
                        <FileSpreadsheet className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                        <p className="text-base-content/60">
                          {maintenanceData.length === 0 
                            ? 'Belum ada data maintenance'
                            : 'Tidak ada data yang sesuai dengan filter'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData().map((maintenance) => (
                    <tr key={maintenance.id}>
                      <td>{format(new Date(maintenance.tanggal), 'dd MMMM yyyy', { locale: id })}</td>
                      <td>{maintenance.unit?.ruangan?.gedung?.nama || '-'}</td>
                      <td>{maintenance.unit?.ruangan?.nama || '-'}</td>
                      <td>
                        {maintenance.unit?.detailModel?.nama_model} - {maintenance.unit?.nomor_seri}
                      </td>
                      <td>
                        <div className={`badge badge-${maintenance.kategori === 'rutin' ? 'info' : 'warning'} badge-sm capitalize`}>
                          {maintenance.kategori}
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => showDetailModal(maintenance)}
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <dialog id="modal-export" className={`modal ${showExportModal ? 'modal-open' : ''}`}>
  <div className="modal-box">
    <h3 className="font-bold text-lg mb-4">Export Data Maintenance</h3>
    <div className="form-control gap-4">
      <label className="label cursor-pointer">
        <span className="label-text">Export semua data</span>
        <input
          type="radio"
          name="export-type"
          className="radio"
          checked={!exportDateRange.startDate}
          onChange={() => setExportDateRange({ startDate: '', endDate: '' })}
        />
      </label>
      <label className="label cursor-pointer">
        <span className="label-text">Export berdasarkan tanggal</span>
        <input
          type="radio"
          name="export-type"
          className="radio"
          checked={!!exportDateRange.startDate}
          onChange={() => setExportDateRange({ startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') })}
        />
      </label>
      {exportDateRange.startDate && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tanggal Mulai</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={exportDateRange.startDate}
              onChange={(e) => setExportDateRange({ ...exportDateRange, startDate: e.target.value })}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tanggal Akhir</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={exportDateRange.endDate}
              onChange={(e) => setExportDateRange({ ...exportDateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
    <div className="modal-action">
      <button className="btn btn-primary" onClick={handleExport}>
        <Download className="w-4 h-4" /> Export
      </button>
      <button className="btn" onClick={() => setShowExportModal(false)}>
        Batal
      </button>
    </div>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button onClick={() => setShowExportModal(false)}>close</button>
  </form>
</dialog>
      {/* Detail Modal */}
      <dialog id="modal-detail" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-4xl">
          {selectedMaintenance && (
            <>
              <h3 className="font-bold text-lg mb-4">Detail Maintenance</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-base-content/60">Tanggal</p>
                  <p className="font-medium">
                    {format(new Date(selectedMaintenance.tanggal), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Gedung</p>
                  <p className="font-medium">{selectedMaintenance.unit?.ruangan?.gedung?.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Ruangan</p>
                  <p className="font-medium">{selectedMaintenance.unit?.ruangan?.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Kategori</p>
                  <div className={`badge badge-${selectedMaintenance.kategori === 'rutin' ? 'info' : 'warning'} capitalize`}>
                    {selectedMaintenance.kategori}
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <h4 className="font-bold mb-3">Informasi Unit</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-base-content/60">Merek</p>
                    <p className="font-medium">{selectedMaintenance.unit?.detailModel?.jenisModel?.merek?.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Model</p>
                    <p className="font-medium">{selectedMaintenance.unit?.detailModel?.jenisModel?.nama_model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Detail Model</p>
                    <p className="font-medium">{selectedMaintenance.unit?.detailModel?.nama_model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Nomor Seri</p>
                    <p className="font-medium">{selectedMaintenance.unit?.nomor_seri}</p>
                  </div>
                </div>
              </div>

              <div className="tabs tabs-bordered">
                <a 
                  className={`tab tab-lg font-medium ${activeTab === 'pemeriksaan' ? 'tab-active bg-primary text-primary-content' : 'text-base-content/70'}`}
                  onClick={() => setActiveTab('pemeriksaan')}
                >
                  Pemeriksaan
                </a>
                <a 
                  className={`tab tab-lg font-medium ${activeTab === 'pembersihan' ? 'tab-active bg-primary text-primary-content' : 'text-base-content/70'}`}
                  onClick={() => setActiveTab('pembersihan')}
                >
                  Pembersihan
                </a>
               <a 
                  className={`tab tab-lg font-medium ${activeTab === 'palet' ? 'tab-active bg-primary text-primary-content' : 'text-base-content/70'}`}
                  onClick={() => setActiveTab('palet')}
                >
                  Foto palet
                </a>
                <a 
                  className={`tab tab-lg font-medium ${activeTab === 'foto' ? 'tab-active bg-primary text-primary-content' : 'text-base-content/70'}`}
                  onClick={() => setActiveTab('foto')}
                >
                  Foto
                </a>
              </div>

              {/* Hasil Pemeriksaan */}
              <div className={`mt-6 ${activeTab !== 'pemeriksaan' ? 'hidden' : ''}`}>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Variabel</th>
                        <th>Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMaintenance.hasilPemeriksaan.map((hasil, index) => (
                        <tr key={hasil.id}>
                          <td>{index + 1}</td>
                          <td>{hasil.variablePemeriksaan.nama_variable}</td>
                          <td>{hasil.nilai}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hasil Pembersihan */}
              <div className={`mt-6 ${activeTab !== 'pembersihan' ? 'hidden' : ''}`}>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Variabel</th>
                        <th>Sebelum</th>
                        <th>Sesudah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMaintenance.hasilPembersihan.map((hasil, index) => (
                        <tr key={hasil.id}>
                          <td>{index + 1}</td>
                          <td>{hasil.variablePembersihan.nama_variable}</td>
                          <td>{hasil.sebelum}</td>
                          <td>{hasil.sesudah}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

{/* Foto-foto */}
<div className={`mt-6 ${activeTab !== 'foto' ? 'hidden' : ''}`}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Foto Sebelum */}
    <div>
      <h4 className="font-bold mb-4">Foto Sebelum</h4>
      <div className="grid gap-4">
        {selectedMaintenance.foto
          .filter(f => f.status === 'sebelum')
          .map((foto) => (
            <div key={foto.id} className="card bg-base-200">
              <figure className="px-4 pt-4">
                <img
                  src={`${BASE_URL}/uploads/${foto.foto}`}
                  alt="Foto Sebelum"
                  className="rounded-lg object-cover w-full h-48"
                />
                {/* Tambahkan nama foto di sini */}
                <figcaption className="text-center mt-2 text-sm text-gray-600">
                  {foto.nama} {/* Menampilkan nama foto */}
                </figcaption>
              </figure>
            </div>
          ))}
      </div>
    </div>

    {/* Foto Sesudah */}
    <div>
      <h4 className="font-bold mb-4">Foto Sesudah</h4>
      <div className="grid gap-4">
        {selectedMaintenance.foto
          .filter(f => f.status === 'sesudah')
          .map((foto) => (
            <div key={foto.id} className="card bg-base-200">
              <figure className="px-4 pt-4">
                <img
                  src={`${BASE_URL}/uploads/${foto.foto}`}
                  alt="Foto Sesudah"
                  className="rounded-lg object-cover w-full h-48"
                />
                {/* Tambahkan nama foto di sini */}
                <figcaption className="text-center mt-2 text-sm text-gray-600">
                  {foto.nama} {/* Menampilkan nama foto */}
                </figcaption>
              </figure>
            </div>
          ))}
      </div>
    </div>
  </div>
</div>

<div className={`mt-6 ${activeTab !== 'palet' ? 'hidden' : ''}`}>

  {/* Menampilkan foto palet */}
  {selectedMaintenance.unit.detailModel.kategori === 'indoor' &&
    selectedMaintenance.palet_indoor && (
      <img
        src={`${BASE_URL}/uploads/${selectedMaintenance.palet_indoor}`}
        alt="Foto Palet Indoor"
        className="rounded-lg object-cover w-full  mt-2"
      />
    )}

  {selectedMaintenance.unit.detailModel.kategori === 'outdoor' &&
    selectedMaintenance.palet_outdoor && (
      <img
        src={`${BASE_URL}/uploads/${selectedMaintenance.palet_outdoor}`}
        alt="Foto Palet Outdoor"
        className="rounded-lg object-cover w-full h-48 mt-2"
      />
    )}
</div>

              <div className="modal-action">
                <button className="btn" onClick={closeModal}>
                  Tutup
                </button>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default MaintenancePage;