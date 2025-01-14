import React, { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { apiRequest } from '../utils/api';
import { 
  FileSpreadsheet, Building2, Calendar, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';

const MaintenancePage = () => {
  const { selectedProject } = useProject();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [activeTab, setActiveTab] = useState('pemeriksaan');
  const [sortConfig, setSortConfig] = useState({ field: 'gedung', direction: 'asc' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Alert helper
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

  // Fetch Data
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

  // Sorting
  const handleSort = (field) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedData = () => {
    let sorted = [...maintenanceData];
    sorted.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.field) {
        case 'gedung':
          return direction * (a.unit?.ruangan?.gedung?.nama || '').localeCompare(b.unit?.ruangan?.gedung?.nama || '');
        case 'ruangan':
          return direction * (a.unit?.ruangan?.nama || '').localeCompare(b.unit?.ruangan?.nama || '');
        case 'tanggal':
          return direction * (new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
        default:
          return 0;
      }
    });
    return sorted;
  };

  // Modal handlers
  const showDetailModal = (maintenance) => {
    setSelectedMaintenance(maintenance);
    document.getElementById('modal-detail').showModal();
  };

  const closeModal = () => {
    document.getElementById('modal-detail')?.close();
    setSelectedMaintenance(null);
  };

  // Export handlers
  const handleExportModalOpen = () => {
    setShowExportModal(true);
    document.getElementById('modal-export').showModal();
  };

  const handleExport = async (useDateRange = false) => {
    try {
      let endpoint = `/maintenance/export/project/${selectedProject.id}`;
      if (useDateRange && exportDateRange.startDate && exportDateRange.endDate) {
        endpoint += `?startDate=${exportDateRange.startDate}&endDate=${exportDateRange.endDate}`;
      }
      window.location.href = `${import.meta.env.VITE_API_URL}${endpoint}`;
      setShowExportModal(false);
      document.getElementById('modal-export').close();
    } catch (error) {
      showAlert('Gagal mengexport data', 'error');
    }
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-8 h-8" />
            Data Maintenance
          </h1>
          <p className="text-base-content/60 mt-1">
            Proyek: {selectedProject.nama}
          </p>
        </div>
        <button onClick={handleExportModalOpen} className="btn btn-primary">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* Main Content */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th onClick={() => handleSort('tanggal')} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal
                    </div>
                  </th>
                  <th onClick={() => handleSort('gedung')} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Gedung
                    </div>
                  </th>
                  <th onClick={() => handleSort('ruangan')} className="cursor-pointer">
                    Ruangan
                  </th>
                  <th>Unit</th>
                  <th>Nama Pemeriksaan</th>
                  <th>Kategori</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </td>
                  </tr>
                ) : sortedData().length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="text-center py-8">
                        <FileSpreadsheet className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                        <p className="text-base-content/60">
                          Belum ada data maintenance
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedData().map((maintenance) => (
                    <tr key={maintenance.id}>
                      <td>
                        {format(new Date(maintenance.tanggal), 'dd MMMM yyyy', { locale: id })}
                      </td>
                      <td>{maintenance.unit?.ruangan?.gedung?.nama || '-'}</td>
                      <td>{maintenance.unit?.ruangan?.nama || '-'}</td>
                      <td>
                        {maintenance.unit?.detailModel?.nama_model} - {maintenance.unit?.nomor_seri}
                      </td>
                      <td>{maintenance.nama_pemeriksaan}</td>
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

      {/* Detail Modal */}
      <dialog id="modal-detail" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-4xl">
          {selectedMaintenance && (
            <>
              <h3 className="font-bold text-2xl mb-6">Detail Maintenance</h3>
              
              {/* Info Unit */}
              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3">Informasi Unit</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-base-content/60">Gedung</p>
                    <p className="font-medium">{selectedMaintenance.unit?.ruangan?.gedung?.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Ruangan</p>
                    <p className="font-medium">{selectedMaintenance.unit?.ruangan?.nama}</p>
                  </div>
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

              {/* Info Maintenance */}
              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3">Informasi Maintenance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-base-content/60">Tanggal</p>
                    <p className="font-medium">
                      {format(new Date(selectedMaintenance.tanggal), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Nama Pemeriksaan</p>
                    <p className="font-medium">{selectedMaintenance.nama_pemeriksaan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Kategori</p>
                    <div className={`badge badge-${selectedMaintenance.kategori === 'rutin' ? 'info' : 'warning'} capitalize`}>
                      {selectedMaintenance.kategori}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs untuk Hasil */}
              <div className="tabs tabs-lifted mb-4">
                <a 
                  className={`tab ${activeTab === 'pemeriksaan' ? 'tab-active bg-primary text-primary-content' : ''}`}
                  onClick={() => setActiveTab('pemeriksaan')}
                >
                  Hasil Pemeriksaan
                </a>
                <a 
                  className={`tab ${activeTab === 'pembersihan' ? 'tab-active bg-secondary text-secondary-content' : ''}`}
                  onClick={() => setActiveTab('pembersihan')}
                >
                  Hasil Pembersihan
                </a>
                <a 
                  className={`tab ${activeTab === 'foto' ? 'tab-active bg-accent text-accent-content' : ''}`}
                  onClick={() => setActiveTab('foto')}
                >
                  Foto-foto
                </a>
              </div>

              {/* Hasil Pemeriksaan */}
              <div className={`py-4 ${activeTab !== 'pemeriksaan' ? 'hidden' : ''}`}>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Variabel</th>
                        <th>Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMaintenance.hasilPemeriksaan.map((hasil) => (
                        <tr key={hasil.id}>
                          <td>{hasil.variablePemeriksaan.nama_variable}</td>
                          <td>{hasil.nilai}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hasil Pembersihan */}
              <div className={`py-4 ${activeTab !== 'pembersihan' ? 'hidden' : ''}`}>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Variabel</th>
                        <th>Sebelum</th>
                        <th>Sesudah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMaintenance.hasilPembersihan.map((hasil) => (
                        <tr key={hasil.id}>
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
              <div className={`py-4 ${activeTab !== 'foto' ? 'hidden' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Foto Sebelum</h4>
                    <div className="grid gap-4">
                      {selectedMaintenance.foto
                        .filter(foto => foto.status === 'sebelum')
                        .map((foto) => (
                          <div key={foto.id} className="card bg-base-200">
                            <figure className="px-4 pt-4">
                              <img
                                src={`${import.meta.env.VITE_API_URL}/maintenance/foto/${foto.foto}`}
                                alt="Foto sebelum maintenance"
                                className="rounded-lg object-cover w-full h-48"
                              />
                            </figure>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Foto Sesudah</h4>
                    <div className="grid gap-4">
                      {selectedMaintenance.foto
                        .filter(foto => foto.status === 'sesudah')
                        .map((foto) => (
                          <div key={foto.id} className="card bg-base-200">
                            <figure className="px-4 pt-4">
                              <img
                                src={`${import.meta.env.VITE_API_URL}/maintenance/foto/${foto.foto}`}
                                alt="Foto sesudah maintenance"
                                className="rounded-lg object-cover w-full h-48"
                              />
                            </figure>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
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

      {/* Export Modal */}
      <dialog id="modal-export" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Export Data Maintenance</h3>
          
          <div className="space-y-4">
            <button
              className="btn btn-primary w-full"
              onClick={() => handleExport(false)}
            >
              Export Semua Data
            </button>

            <div className="divider">ATAU</div>

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
                <span className="label-text">Tanggal Selesai</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={exportDateRange.endDate}
                onChange={(e) => setExportDateRange({ ...exportDateRange, endDate: e.target.value })}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={() => handleExport(true)}
              disabled={!exportDateRange.startDate || !exportDateRange.endDate}
            >
              Export Data Berdasarkan Tanggal
            </button>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Tutup</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default MaintenancePage;