import { useState, useEffect } from 'react';
import { 
  Plus, ClipboardList, PencilLine, Trash2, Search, 
  ArrowUpDown, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import { apiRequest } from '../utils/api';

const VariableManagement = () => {
  const [variables, setVariables] = useState({ pembersihan: [], pemeriksaan: [] });
  const [activeTab, setActiveTab] = useState('pembersihan');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ field: 'nama_variable', direction: 'asc' });
  const [variableForm, setVariableForm] = useState({
    nama_variable: '',
    jenis: 'indoor'
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
      timerProgressBar: true,
      
      
    });
  };

  // Fetch Data
  const fetchVariables = async () => {
    try {
      setLoading(true);
      const [pembersihanData, pemeriksaanData] = await Promise.all([
        apiRequest('/variable-pembersihan', 'GET'),
        apiRequest('/variable-pemeriksaan', 'GET')
      ]);
      setVariables({
        pembersihan: pembersihanData,
        pemeriksaan: pemeriksaanData
      });
    } catch (error) {
      showAlert(error.message || 'Gagal mengambil data variabel', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  // Modal handlers
  const showAddModal = () => {
    setVariableForm({ nama_variable: '', jenis: 'indoor' });
    document.getElementById('modal-add-variable').showModal();
  };

  const showEditModal = (variable) => {
    setVariableForm({
      nama_variable: variable.nama_variable,
      jenis: variable.jenis
    });
    document.getElementById('modal-edit-variable').showModal();
  };

  const closeModals = () => {
    document.getElementById('modal-add-variable')?.close();
    document.getElementById('modal-edit-variable')?.close();
    setVariableForm({ nama_variable: '', jenis: 'indoor' });
  };

  // CRUD handlers
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(
        `/variable-${activeTab}`,
        'POST',
        variableForm
      );
      closeModals();
      showAlert('Variabel berhasil ditambahkan');
      await fetchVariables();
    } catch (error) {
      showAlert(error.message || 'Gagal menambahkan variabel', 'error');
    }
  };

  const handleEdit = async (e, id) => {
    e.preventDefault();
    try {
      await apiRequest(
        `/variable-${activeTab}/${id}`,
        'PUT',
        variableForm
      );
      closeModals();
      showAlert('Variabel berhasil diperbarui');
      await fetchVariables();
    } catch (error) {
      showAlert(error.message || 'Gagal memperbarui variabel', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Variabel?',
      text: 'Anda yakin ingin menghapus variabel ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiRequest(
          `/variable-${activeTab}/${id}`,
          'DELETE'
        );
        showAlert('Variabel berhasil dihapus');
        await fetchVariables();
      } catch (error) {
        showAlert(error.message || 'Gagal menghapus variabel', 'error');
      }
    }
  };

  // Sorting and Filtering
  const handleSort = (field) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredAndSortedVariables = () => {
    // Check if data exists
    if (!variables[activeTab]) {
      return [];
    }

    let filtered = [...variables[activeTab]];

    // Apply jenis filter
    if (selectedJenis !== 'all') {
      filtered = filtered.filter(variable => variable?.jenis === selectedJenis);
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(variable => 
        variable?.nama_variable?.toLowerCase()?.includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.field === 'nama_variable') {
        return direction * (a.nama_variable || '').localeCompare(b.nama_variable || '');
      } else if (sortConfig.field === 'jenis') {
        return direction * (a.jenis || '').localeCompare(b.jenis || '');
      }
      return 0;
    });

    return filtered;
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Jenis Maintenance
          </h1>
          <p className="text-base-content/60 mt-1">
            Kelola variabel pembersihan dan pemeriksaan
          </p>
        </div>
        <button onClick={showAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Tambah Variabel
        </button>
      </div>

      {/* Main Content */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6">
          {/* Tabs */}
          <div role="tablist" className="tabs tabs-lifted mb-6">
            <button
              role="tab"
              className={`tab ${activeTab === 'pembersihan' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('pembersihan')}
            >
              Pembersihan
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === 'pemeriksaan' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('pemeriksaan')}
            >
              Pemeriksaan
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="form-control flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Cari variabel..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              className="select select-bordered w-full md:w-48"
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
            >
              <option value="all">Semua Jenis</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          {/* Variables Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th onClick={() => handleSort('nama_variable')} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      Nama Variabel
                      {sortConfig.field === 'nama_variable' && (
                        <ArrowUpDown className={`w-4 h-4 ${
                          sortConfig.direction === 'desc' ? 'rotate-180' : ''
                        }`} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort('jenis')} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      Jenis
                      {sortConfig.field === 'jenis' && (
                        <ArrowUpDown className={`w-4 h-4 ${
                          sortConfig.direction === 'desc' ? 'rotate-180' : ''
                        }`} />
                      )}
                    </div>
                  </th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </td>
                  </tr>
                ) : filteredAndSortedVariables().length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                        <p className="text-base-content/60">
                          {variables[activeTab].length === 0 
                            ? `Belum ada variabel ${activeTab}`
                            : 'Tidak ada variabel yang sesuai dengan filter'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedVariables().map((variable) => (
                    <tr key={variable.id}>
                      <td>{variable.nama_variable}</td>
                      <td>
                        <div className="badge badge-ghost capitalize">
                          {variable.jenis}
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => showEditModal(variable)}
                          >
                            <PencilLine className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleDelete(variable.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add Modal */}
      <dialog id="modal-add-variable" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            Tambah Variabel {activeTab === 'pembersihan' ? 'Pembersihan' : 'Pemeriksaan'}
          </h3>
          <form onSubmit={handleAdd}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama Variabel</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={variableForm.nama_variable}
                onChange={(e) => setVariableForm({ ...variableForm, nama_variable: e.target.value })}
                placeholder="Masukkan nama variabel"
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Jenis</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={variableForm.jenis}
                onChange={(e) => setVariableForm({ ...variableForm, jenis: e.target.value })}
                required
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={closeModals}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModals}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default VariableManagement;