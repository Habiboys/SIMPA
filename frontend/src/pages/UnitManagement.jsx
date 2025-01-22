import React, { useState, useEffect } from 'react';
import { Search, Plus, PencilLine, Trash2, Filter, ChevronLeft, ChevronRight, Thermometer } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { apiRequest } from '../utils/api';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 10;
// const KATEGORI_OPTIONS = [
//   { value: 'indoor', label: 'INDOOR' },
//   { value: 'outdoor', label: 'OUTDOOR' }
// ];

const UnitManagementPage = () => {
  const { selectedProject } = useProject();
  const [units, setUnits] = useState([]);
  const [detailModels, setDetailModels] = useState([]);
  const [gedungs, setGedungs] = useState([]);
  const [ruangans, setRuangans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  // Form state
  const [selectedGedung, setSelectedGedung] = useState('');  // Untuk form modal
  
  // Filter states
  const [filterGedung, setFilterGedung] = useState('');
  const [filterLantai, setFilterLantai] = useState('');
  const [filterRuangan, setFilterRuangan] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculation

  // Form state
  const [unitForm, setUnitForm] = useState({
    id_jenis_model: '',
    id_ruangan: '',
    // nama: '',
    nomor_seri: '',
    // kategori: ''
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Alert handler
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
      customClass: { popup: 'colored-toast' }
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    // if (!unitForm.nama.trim()) errors.nama = 'Nama unit harus diisi';
    if (!unitForm.nomor_seri.trim()) errors.nomor_seri = 'Nomor seri harus diisi';
    // if (!unitForm.kategori) errors.kategori = 'Kategori harus dipilih';
    if (!unitForm.id_jenis_model) errors.id_jenis_model = 'Model harus dipilih';
    if (!unitForm.id_ruangan) errors.id_ruangan = 'Ruangan harus dipilih';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get filtered ruangan options for main filter
  const getFilteredRuangans = () => {
    return ruangans.filter(ruangan => {
      if (!ruangan || !ruangan.gedung) return false;
      if (filterGedung && ruangan.gedung.id !== parseInt(filterGedung)) return false;
      if (filterLantai && ruangan.lantai !== parseInt(filterLantai)) return false;
      return true;
    });
  };

  // Get ruangan options for form modal
  const getFormRuangans = () => {
    return ruangans.filter(ruangan => {
      if (!ruangan || !ruangan.gedung) return false;
      if (selectedGedung && ruangan.gedung.id !== parseInt(selectedGedung)) return false;
      return true;
    });
  };

  // Get unique lantai options from ruangans
  const getLantaiOptions = () => {
    const lantais = new Set();
    ruangans.forEach(ruangan => {
      if (ruangan?.lantai && (!filterGedung || (ruangan.gedung && ruangan.gedung.id === parseInt(filterGedung)))) {
        lantais.add(ruangan.lantai);
      }
    });
    return Array.from(lantais).sort((a, b) => a - b);
  };

  // Fetch all required data
  const fetchAllData = async () => {
    if (!selectedProject?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch units
      const unitsResponse = await apiRequest(
        `/unit/${selectedProject.id}`,
        'GET',
        null,
        true
      );

      // Fetch buildings and rooms
      const gedungResponse = await apiRequest(
        `/proyek/${selectedProject.id}/gedung`,
        'GET',
        null,
        true
      );

      // Fetch rooms for each building
      const ruanganPromises = gedungResponse.map(gedung =>
        apiRequest(
          `/proyek/${selectedProject.id}/gedung/${gedung.id}/ruangan`,
          'GET',
          null,
          true
        ).then(ruangans => ruangans.map(ruangan => ({
          ...ruangan,
          gedung: gedung // Ensure each room has its building reference
        })))
      );
      const ruangansResult = await Promise.all(ruanganPromises);
      
      // Fetch detail models with proper relations
      const detailModelsResponse = await apiRequest('/detail-model', 'GET', null, true);

      setUnits(unitsResponse);
      setGedungs(gedungResponse);
      setRuangans(ruangansResult.flat());
      setDetailModels(detailModelsResponse);

    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert(error.message || 'Terjadi kesalahan saat mengambil data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedProject]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Mohon lengkapi semua field yang diperlukan', 'error');
      return;
    }

    try {
      const payload = {
        ...unitForm,
        id_jenis_model: parseInt(unitForm.id_jenis_model),
        id_ruangan: parseInt(unitForm.id_ruangan)
      };

      if (selectedItem) {
        await apiRequest(`/unit/${selectedItem.id}`, 'PUT', payload, true);
        showAlert('Unit berhasil diperbarui');
      } else {
        await apiRequest('/unit', 'POST', payload, true);
        showAlert('Unit baru berhasil ditambahkan');
      }

      closeModal();
      fetchAllData();
    } catch (error) {
      showAlert(error.message || 'Terjadi kesalahan saat menyimpan data', 'error');
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Unit?',
      text: 'Unit yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiRequest(`/unit/${id}`, 'DELETE', null, true);
        showAlert('Unit berhasil dihapus');
        fetchAllData();
      } catch (error) {
        showAlert(error.message || 'Terjadi kesalahan saat menghapus unit', 'error');
      }
    }
  };

  const openModal = (type, item = null) => {
    if (!selectedProject) {
      showAlert('Pilih proyek terlebih dahulu', 'error');
      return;
    }

    setModalType(type);
    setSelectedItem(item);
    setFormErrors({});

    if (item) {
      setSelectedGedung(item.ruangan?.gedung?.id?.toString() || '');
      setUnitForm({
        id_jenis_model: item.detailModel?.id?.toString() || '',
        id_ruangan: item.ruangan?.id?.toString() || '',
        // nama: item.nama || '',
        nomor_seri: item.nomor_seri || '',
        // kategori: item.kategori || ''
      });
    } else {
      setSelectedGedung('');
      setUnitForm({
        id_jenis_model: '',
        id_ruangan: '',
        // nama: '',
        nomor_seri: '',
        // kategori: ''
      });
    }

    window.modal.showModal();
  };

  const closeModal = () => {
    window.modal.close();
    setSelectedItem(null);
    setModalType(null);
    setFormErrors({});
    setSelectedGedung('');
    setUnitForm({
      id_jenis_model: '',
      id_ruangan: '',
      // nama: '',
      nomor_seri: '',
      // kategori: ''
    });
  };

  // Filter units based on search and filters
  const filteredUnits = units.filter(unit => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      // unit.nama?.toLowerCase().includes(searchLower) ||
      unit.nomor_seri?.toLowerCase().includes(searchLower) ||
      unit.ruangan?.nama?.toLowerCase().includes(searchLower) ||
      unit.detailModel?.nama_model?.toLowerCase().includes(searchLower);

    const matchesGedung = !filterGedung || unit.ruangan?.gedung?.id === parseInt(filterGedung);
    const matchesLantai = !filterLantai || unit.ruangan?.lantai === parseInt(filterLantai);
    const matchesRuangan = !filterRuangan || unit.ruangan?.id === parseInt(filterRuangan);

    return matchesSearch && matchesGedung && matchesLantai && matchesRuangan;
  });

  // Welcome screen if no project selected
  if (!selectedProject) {
    return (
      <div className="hero min-h-[400px] bg-base-200 rounded-box">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <Thermometer className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h1 className="text-2xl font-bold">Selamat Datang!</h1>
            <p className="py-4 opacity-70">
              Silakan pilih proyek terlebih dahulu untuk mengelola unit Ac
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredUnits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUnits = filteredUnits.slice(startIndex, startIndex + ITEMS_PER_PAGE);


  return (
    <div className="container mx-auto p-4">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Daftar Unit AC</h1>
            <p className="text-base-content/70">
              Proyek: {selectedProject.nama} · Total Unit: {filteredUnits.length}
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Cari unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
            </div>
            <button onClick={() => openModal('add')} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Tambah Unit
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="select select-bordered w-full"
            value={filterGedung}
            onChange={(e) => {
              setFilterGedung(e.target.value);
              setFilterLantai('');
              setFilterRuangan('');
            }}
          >
            <option value="">Semua Gedung</option>
            {gedungs.map((gedung) => (
              <option key={gedung.id} value={gedung.id}>
                {gedung.nama}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-full"
            value={filterLantai}
            onChange={(e) => {
              setFilterLantai(e.target.value);
              setFilterRuangan('');
            }}
            disabled={!filterGedung}
          >
            <option value="">Semua Lantai</option>
            {getLantaiOptions().map((lantai) => (
              <option key={lantai} value={lantai}>
                Lantai {lantai}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-full"
            value={filterRuangan}
            onChange={(e) => setFilterRuangan(e.target.value)}
            disabled={!filterGedung}
          >
            <option value="">Semua Ruangan</option>
            {getFilteredRuangans().map((ruangan) => (
              <option key={ruangan.id} value={ruangan.id}>
                {ruangan.nama}
              </option>
            ))}
          </select>

          <button
            className="btn btn-outline btn-block"
            onClick={() => {
              setFilterGedung('');
              setFilterLantai('');
              setFilterRuangan('');
            }}
          >
            <Filter className="w-4 h-4" /> Reset Filter
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredUnits.length > 0 ? (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>No. Seri Unit</th>
                <th>Model</th>
                <th>Lokasi</th>
                <th>Kategori</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUnits.map((unit) => (
                <tr key={unit.id}>
                  {/* <td className="font-medium">{unit.nama}</td> */}
                  <td className="font-medium">{unit.nomor_seri}</td>
                  <td>
                    {unit.detailModel?.jenisModel?.merek?.nama} -{' '}
                    {unit.detailModel?.nama_model}
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span>{unit.ruangan?.gedung?.nama}</span>
                      <span className="text-sm text-base-content/70">
                        Lantai {unit.ruangan?.lantai} · {unit.ruangan?.nama}
                      </span>
                    </div>
                  </td>
                  
                  <td>
                    <span className="badge badge-outline">
                      {unit.detailModel.kategori?.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal('edit', unit)}
                        className="btn btn-ghost btn-sm"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-4 border-t">
            <div className="text-sm text-base-content/70">
              Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredUnits.length)} dari {filteredUnits.length} unit
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="join">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn btn-sm join-item ${
                      currentPage === page ? 'btn-active' : ''
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Tidak ada data</h3>
            <p className="text-base-content/70">
              {searchTerm || filterGedung || filterLantai || filterRuangan
                ? 'Tidak ada hasil yang cocok dengan filter yang dipilih'
                : 'Belum ada unit AC yang terdaftar. Mulai dengan menambahkan unit baru!'}
            </p>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <dialog id="modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-6">
            {selectedItem ? 'Edit Unit AC' : 'Tambah Unit AC Baru'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
              <label className="label">
                <span className="label-text">Nomor Seri</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${
                  formErrors.nomor_seri ? 'input-error' : ''
                }`}
                value={unitForm.nomor_seri}
                onChange={(e) =>
                  setUnitForm({ ...unitForm, nomor_seri: e.target.value })
                }
                placeholder="Masukkan nomor seri"
              />
              {formErrors.nomor_seri && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {formErrors.nomor_seri}
                  </span>
                </label>
              )}
            </div>
            

            <div className="form-control">
              <label className="label">
                <span className="label-text">Model AC</span>
              </label>
              <select
                className={`select select-bordered w-full ${
                  formErrors.id_jenis_model ? 'select-error' : ''
                }`}
                value={unitForm.id_jenis_model}
                onChange={(e) =>
                  setUnitForm({ ...unitForm, id_jenis_model: e.target.value })
                }
              >
                <option value="">Pilih Model</option>
                {detailModels
                  .filter(model => model.jenisModel && model.jenisModel.merek)
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.jenisModel.merek.nama} - {model.jenisModel.nama_model} - {model.nama_model}
                    </option>
                  ))}
              </select>
              {formErrors.id_jenis_model && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {formErrors.id_jenis_model}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Gedung</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedGedung}
                onChange={(e) => {
                  setSelectedGedung(e.target.value);
                  setUnitForm({ ...unitForm, id_ruangan: '' });
                }}
              >
                <option value="">Pilih Gedung</option>
                {gedungs.map((gedung) => (
                  <option key={gedung.id} value={gedung.id}>
                    {gedung.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Ruangan</span>
              </label>
              <select
                className={`select select-bordered w-full ${
                  formErrors.id_ruangan ? 'select-error' : ''
                }`}
                value={unitForm.id_ruangan}
                onChange={(e) =>
                  setUnitForm({ ...unitForm, id_ruangan: e.target.value })
                }
                disabled={!selectedGedung}
              >
                <option value="">Pilih Ruangan</option>
                {getFormRuangans().map((ruangan) => (
                  <option key={ruangan.id} value={ruangan.id}>
                    {ruangan.nama} (Lantai {ruangan.lantai})
                  </option>
                ))}
              </select>
              {formErrors.id_ruangan && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {formErrors.id_ruangan}
                  </span>
                </label>
              )}
            </div>

          

            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Kategori</span>
              </label>
              <select
                className={`select select-bordered w-full ${
                  formErrors.kategori ? 'select-error' : ''
                }`}
                value={unitForm.kategori}
                onChange={(e) =>
                  setUnitForm({ ...unitForm, kategori: e.target.value })
                }
              >
                <option value="">Pilih Kategori</option>
                {KATEGORI_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.kategori && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {formErrors.kategori}
                  </span>
                </label>
              )}
            </div> */}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedItem ? 'Simpan Perubahan' : 'Tambah Unit'}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default UnitManagementPage;