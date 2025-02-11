import React, { useState, useEffect } from 'react';
import { Search, Plus, PencilLine, Trash2, ChevronDown, ChevronRight} from 'lucide-react';
import Swal from 'sweetalert2';
import { apiRequest } from '../utils/api';

const ModelManagementPage = () => {
  // State Management
  const [mereks, setMereks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [expandedMerek, setExpandedMerek] = useState(null);

  // Form States
  const [merekForm, setMerekForm] = useState({ nama: '' });
  const [modelForm, setModelForm] = useState({
    id_merek: '',
    nama_model: '',
    // kapasitas: ''
  });
  const [detailModelForm, setDetailModelForm] = useState({
    id_model: '',
    nama_model: '',
    kategori: ''
  });

  // Constants
  const kategoris = ['indoor', 'outdoor'];

  // Toast Notification
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

  // Data Fetching
  const fetchMerekWithRelations = async () => {
    try {
      const response = await apiRequest('/merek', 'GET', null, true);
      setMereks(response);
    } catch (error) {
      showAlert(error.message || 'Gagal mengambil data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerekWithRelations();
  }, []);

  // Form Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mapping untuk form dan endpoint
    const forms = {
      merek: { 
        form: merekForm, 
        endpoint: '/merek',
        getId: (item) => item.id
      },
      model: { 
        form: modelForm, 
        endpoint: '/jenis-model',
        getId: (item) => item.id
      },
      detail: { 
        form: detailModelForm, 
        endpoint: '/detail-model',
        getId: (item) => item.id
      }
    };

    const currentForm = forms[modalType];

    try {
      const endpoint = selectedItem 
        ? `${currentForm.endpoint}/${currentForm.getId(selectedItem)}`
        : currentForm.endpoint;
        
      console.log('Submitting to endpoint:', endpoint, {
        method: selectedItem ? 'PUT' : 'POST',
        data: currentForm.form
      });

      await apiRequest(
        endpoint,
        selectedItem ? 'PUT' : 'POST',
        currentForm.form,
        true
      );

      showAlert(`${modalType} berhasil ${selectedItem ? 'diperbarui' : 'ditambahkan'}`);
      closeModal();
      await fetchMerekWithRelations();
    } catch (error) {
      console.error('Error in form submission:', error);
      showAlert(error.message || `Gagal menyimpan ${modalType}`, 'error');
    }
  };

  const handleDelete = async (id, type) => {
    const result = await Swal.fire({
      title: `Hapus ${type}?`,
      text: `Anda yakin ingin menghapus ${type} ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const endpoints = {
          merek: '/merek',
          model: '/jenis-model',
          detail: '/detail-model'
        };
        await apiRequest(`${endpoints[type]}/${id}`, 'DELETE', null, true);
        showAlert(`${type} berhasil dihapus`);
        await fetchMerekWithRelations();
      } catch (error) {
        showAlert(error.message || `Gagal menghapus ${type}`, 'error');
      }
    }
  };

  // Modal Handlers
  const openModal = (type, item = null, parentId = null) => {
    setModalType(type);
    setSelectedItem(item);
    
    // Reset semua form terlebih dahulu
    setMerekForm({ nama: '' });
    setModelForm({ id_merek: '', nama_model: '' });
    setDetailModelForm({ id_model: '', nama_model: '', kategori: '' });
    
    if (item) {
      // Jika mode edit
      switch (type) {
        case 'merek':
          setMerekForm({ nama: item.nama });
          break;
        case 'model':
          setModelForm({
            id_merek: item.id_merek || parentId,
            nama_model: item.nama_model,
            // kapasitas: item.kapasitas
          });
          break;
        case 'detail':
          setDetailModelForm({
            id_model: item.id_model || parentId,
            nama_model: item.nama_model,
            kategori: item.kategori?.toLowerCase()
          });
          break;
      }
    } else if (parentId) {
      // Jika mode tambah dengan parent
      if (type === 'model') {
        setModelForm(prev => ({ ...prev, id_merek: parentId }));
      } else if (type === 'detail') {
        setDetailModelForm(prev => ({ ...prev, id_model: parentId }));
      }
    }
    
    console.log('Opening modal with:', { type, item, parentId });
    window.modal.showModal();
  };

  const closeModal = () => {
    window.modal.close();
    setSelectedItem(null);
    setModalType(null);
    setMerekForm({ nama: '' });
    setModelForm({ id_merek: '', nama_model: '' });
    setDetailModelForm({ id_model: '', nama_model: '', kategori: '' });
  };

  // Search Filter
  const filteredMereks = mereks.filter(merek => {
    const searchLower = searchTerm.toLowerCase();
    return (
      merek.nama.toLowerCase().includes(searchLower) ||
      merek.jenisModel?.some(model => 
        model.nama_model.toLowerCase().includes(searchLower) ||
        model.detailModel?.some(detail => 
          detail.nama_model.toLowerCase().includes(searchLower)
        )
      )
    );
  });

  // Component for Model Card
  const ModelCard = ({ model }) => (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium">{model.nama_model}</h4>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => openModal('model', model)}
            >
              <PencilLine className="w-4 h-4" />
            </button>
            <button 
              className="btn btn-ghost btn-sm text-error"
              onClick={() => handleDelete(model.id, 'model')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 divider"></div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-medium text-sm opacity-70">Varian</h5>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => openModal('detail', null, model.id)}
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
          <div className="space-y-2">
            {model.detailModel?.map(detail => (
              <div key={detail.id} 
                   className="flex items-center justify-between p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors">
                <div>
                  <span className="font-medium">{detail.nama_model}</span>
                  <div className={`badge ml-2 ${
                    detail.kategori === 'INDOOR' 
                      ? 'badge-info' 
                      : 'badge-warning'
                  }`}>
                    {detail.kategori}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => openModal('detail', detail)}
                  >
                    <PencilLine className="w-3 h-3" />
                  </button>
                  <button 
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleDelete(detail.id, 'detail')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {!model.detailModel?.length && (
              <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <p className="text-sm opacity-70">Belum ada varian</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daftar Merek & Model AC</h1>
          <p className="opacity-70 mt-1">Kelola merek, model, dan varian AC</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>
          <button 
            onClick={() => openModal('merek')} 
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" /> Merek Baru
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredMereks.length > 0 ? (
        <div className="space-y-6">
          {filteredMereks.map(merek => (
            <div key={merek.id} className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className={`btn btn-circle btn-ghost btn-sm transition-transform duration-200 ${
                        expandedMerek === merek.id ? 'rotate-90' : ''
                      }`}
                      onClick={() => setExpandedMerek(expandedMerek === merek.id ? null : merek.id)}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-xl font-bold">{merek.nama}</h3>
                      <p className="text-sm opacity-70">
                        Total {merek.jenisModel?.length || 0} model tersedia
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => openModal('model', null, merek.id)}
                    >
                      <Plus className="w-4 h-4" /> Model
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => openModal('merek', merek)}
                    >
                      <PencilLine className="w-4 h-4" />
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => handleDelete(merek.id, 'merek')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedMerek === merek.id && (
                  <div className="mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {merek.jenisModel?.map(model => (
                        <ModelCard key={model.id} model={model} />
                      ))}
                      {!merek.jenisModel?.length && (
                        <div className="md:col-span-2 text-center p-8 border-2 border-dashed rounded-lg">
                          <p className="opacity-70 mb-2">Belum ada model untuk merek ini</p>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => openModal('model', null, merek.id)}
                          >
                            <Plus className="w-4 h-4" /> Tambah Model
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body items-center text-center py-16">
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data'}
            </h3>
            <p className="opacity-70 max-w-md mx-auto mb-4">
              {searchTerm 
                ? 'Coba gunakan kata kunci lain'
                : 'Mulai dengan menambahkan merek AC baru'}
            </p>
            {!searchTerm && (
              <button
                className="btn btn-primary"
                onClick={() => openModal('merek')}
              >
                <Plus className="w-4 h-4" /> Tambah Merek Baru
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <dialog id="modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {selectedItem ? `Edit ${modalType}` : `Tambah ${modalType} Baru`}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {modalType === 'merek' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nama Merek</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={merekForm.nama}
                    onChange={(e) => setMerekForm({ ...merekForm, nama: e.target.value })}
                    placeholder="Masukkan nama merek"
                    required
                  />
                </div>
              )}

              {modalType === 'model' && (
                <>
                  {!selectedItem && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Merek</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={modelForm.id_merek}
                        onChange={(e) => setModelForm({ ...modelForm, id_merek: parseInt(e.target.value) })}
                        required
                        disabled={!!selectedItem}
                      >
                        <option value="">Pilih Merek</option>
                        {mereks.map((merek) => (
                          <option key={merek.id} value={merek.id}>
                            {merek.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nama Model</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={modelForm.nama_model}
                      onChange={(e) => setModelForm({ ...modelForm, nama_model: e.target.value })}
                      placeholder="Masukkan nama model"
                      required
                    />
                  </div>

                </>
              )}

              {modalType === 'detail' && (
                <>
                  {!selectedItem && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Model AC</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={detailModelForm.id_model}
                        onChange={(e) => setDetailModelForm({ 
                          ...detailModelForm, 
                          id_model: parseInt(e.target.value) 
                        })}
                        required
                        disabled={!!selectedItem}
                      >
                        <option value="">Pilih Model AC</option>
                        {mereks.flatMap(merek => 
                          merek.jenisModel?.map(model => (
                            <option key={model.id} value={model.id}>
                              {merek.nama} - {model.nama_model}
                            </option>
                          )) || []
                        )}
                      </select>
                    </div>
                  )}

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nama Detail Model</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={detailModelForm.nama_model}
                      onChange={(e) => setDetailModelForm({ 
                        ...detailModelForm, 
                        nama_model: e.target.value 
                      })}
                      placeholder="Masukkan nama detail model"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Kategori</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={detailModelForm.kategori}
                      onChange={(e) => setDetailModelForm({ 
                        ...detailModelForm, 
                        kategori: e.target.value 
                      })}
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoris.map((kategori) => (
                        <option key={kategori} value={kategori}>
                          {kategori.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={closeModal}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedItem ? 'Perbarui' : 'Simpan'}
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

export default ModelManagementPage;