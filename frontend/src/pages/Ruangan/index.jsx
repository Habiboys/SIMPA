import { useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { apiRequest } from '../../utils/api';
import { 
  Plus, Building2, PencilLine, Trash2, DoorClosed, 
  Search, Filter, ChevronDown, ArrowUpDown
} from 'lucide-react';
import Swal from 'sweetalert2';

const Ruangan = () => {
  const { selectedProject } = useProject();
  const [buildings, setBuildings] = useState([]);
  const [buildingForm, setBuildingForm] = useState({ nama: '' });
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState({ nama: '', lantai: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  
  // Filter states
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'nama', direction: 'asc' });

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
  const fetchBuildings = async () => {
    try {
      if (!selectedProject) return;
      const data = await apiRequest(`/proyek/${selectedProject.id}/gedung`, 'GET', null, true);
      setBuildings(data);
      if (data.length > 0) {
        const firstBuildingId = data[0].id;
        setActiveTab(firstBuildingId);
        await fetchRooms(firstBuildingId);
      }
    } catch (error) {
      showAlert(error.message || 'Gagal mengambil data gedung', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (buildingId) => {
    try {
      const data = await apiRequest(
        `/proyek/${selectedProject.id}/gedung/${buildingId}/ruangan`,
        'GET',
        null,
        true
      );
      setRooms(data);
    } catch (error) {
      showAlert('Gagal mengambil data ruangan', 'error');
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchBuildings();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (activeTab) {
      fetchRooms(activeTab);
    }
  }, [activeTab]);

  // Modal handlers
  const showAddBuildingModal = () => {
    setBuildingForm({ nama: '' });
    document.getElementById('modal-add-building').showModal();
  };

  const showEditBuildingModal = (building) => {
    setSelectedBuilding(building);
    setBuildingForm({ nama: building.nama });
    document.getElementById('modal-edit-building').showModal();
  };

  const showAddRoomModal = (buildingId) => {
    setSelectedBuilding(buildings.find(b => b.id === buildingId));
    setRoomForm({ nama: '', lantai: '' });
    document.getElementById('modal-add-room').showModal();
  };

  const closeModals = () => {
    document.getElementById('modal-add-building')?.close();
    document.getElementById('modal-edit-building')?.close();
    document.getElementById('modal-add-room')?.close();
    setSelectedBuilding(null);
    setBuildingForm({ nama: '' });
    setRoomForm({ nama: '', lantai: '' });
  };

  // CRUD handlers
  const handleAddBuilding = async (e) => {
    e.preventDefault();
    try {
      const newBuilding = await apiRequest(
        `/proyek/${selectedProject.id}/gedung`, 
        'POST', 
        buildingForm, 
        true
      );
      closeModals();
      showAlert('Gedung berhasil ditambahkan');
      await fetchBuildings();
      setActiveTab(newBuilding.id);
    } catch (error) {
      showAlert(error.message || 'Gagal menambahkan gedung', 'error');
    }
  };

  const handleEditBuilding = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(
        `/proyek/${selectedProject.id}/gedung/${selectedBuilding.id}`,
        'PATCH',
        buildingForm,
        true
      );
      closeModals();
      showAlert('Gedung berhasil diperbarui');
      await fetchBuildings();
    } catch (error) {
      showAlert(error.message || 'Gagal memperbarui gedung', 'error');
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    const result = await Swal.fire({
      title: 'Hapus Gedung?',
      text: 'Semua ruangan dalam gedung ini akan ikut terhapus.',
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
          `/proyek/${selectedProject.id}/gedung/${buildingId}`,
          'DELETE',
          null,
          true
        );
        showAlert('Gedung berhasil dihapus');
        const remainingBuildings = buildings.filter(b => b.id !== buildingId);
        if (remainingBuildings.length > 0) {
          setActiveTab(remainingBuildings[0].id);
        } else {
          setActiveTab(null);
        }
        await fetchBuildings();
      } catch (error) {
        showAlert(error.message || 'Gagal menghapus gedung', 'error');
      }
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(
        `/proyek/${selectedProject.id}/gedung/${selectedBuilding.id}/ruangan`,
        'POST',
        {
          ...roomForm,
          lantai: parseInt(roomForm.lantai),
          id_gedung: selectedBuilding.id
        },
        true
      );
      closeModals();
      showAlert('Ruangan berhasil ditambahkan');
      await fetchRooms(activeTab);
    } catch (error) {
      showAlert(error.message || 'Gagal menambahkan ruangan', 'error');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const result = await Swal.fire({
      title: 'Hapus Ruangan?',
      text: 'Anda yakin ingin menghapus ruangan ini?',
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
          `/proyek/${selectedProject.id}/gedung/${activeTab}/ruangan/${roomId}`,
          'DELETE',
          null,
          true
        );
        showAlert('Ruangan berhasil dihapus');
        await fetchRooms(activeTab);
      } catch (error) {
        showAlert(error.message || 'Gagal menghapus ruangan', 'error');
      }
    }
  };

  // Sorting and Filtering
  const getUniqueFloors = () => {
    return [...new Set(rooms.map(room => room.lantai))].sort((a, b) => a - b);
  };

  const handleSort = (field) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredAndSortedRooms = () => {
    let filtered = [...rooms];

    // Apply floor filter
    if (selectedFloorFilter !== 'all') {
      filtered = filtered.filter(room => room.lantai === parseInt(selectedFloorFilter));
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(room => 
        room.nama.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.field === 'nama') {
        return direction * a.nama.localeCompare(b.nama);
      } else if (sortConfig.field === 'lantai') {
        return direction * (a.lantai - b.lantai);
      }
      return 0;
    });

    return filtered;
  };

  if (!selectedProject) {
    return (
      <div className="hero min-h-[400px] bg-base-200 rounded-box">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h1 className="text-2xl font-bold">Selamat Datang!</h1>
            <p className="py-4 opacity-70">
              Silakan pilih proyek terlebih dahulu untuk mengelola gedung dan ruangan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Manajemen Gedung & Ruangan
          </h1>
          <p className="text-base-content/60 mt-1">
            Proyek: {selectedProject.nama}
          </p>
        </div>
        <button onClick={showAddBuildingModal} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Tambah Gedung
        </button>
      </div>

      {/* Main Content */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : buildings.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Belum Ada Gedung</h3>
              <p className="text-base-content/60 mb-4">
                Mulai dengan menambahkan gedung pertama Anda ke proyek ini.
              </p>
              <button onClick={showAddBuildingModal} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Tambah Gedung
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div role="tablist" className="tabs tabs-lifted mb-6">
                {buildings.map((building) => (
                  <button
                    key={building.id}
                    role="tab"
                    className={`tab ${activeTab === building.id ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab(building.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {building.nama}
                      <div className="badge badge-sm">{rooms.length}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Building Actions */}
              {activeTab && (
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      {buildings.find(b => b.id === activeTab)?.nama}
                    </h3>
                    <div className="join">
                      <button 
                        className="btn btn-sm join-item"
                        onClick={() => showEditBuildingModal(buildings.find(b => b.id === activeTab))}
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn btn-sm join-item btn-error"
                        onClick={() => handleDeleteBuilding(activeTab)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => showAddRoomModal(activeTab)}
                  >
                    <Plus className="w-4 h-4" /> Tambah Ruangan
                  </button>
                </div>
              )}

              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="form-control flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                    <input
                      type="text"
                      placeholder="Cari ruangan..."
                      className="input input-bordered w-full pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <select
                  className="select select-bordered w-full md:w-48"
                  value={selectedFloorFilter}
                  onChange={(e) => setSelectedFloorFilter(e.target.value)}
                >
                  <option value="all">Semua Lantai</option>
                  {getUniqueFloors().map(floor => (
                    <option key={floor} value={floor}>
                      Lantai {floor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rooms Table */}
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('nama')} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          Nama Ruangan
                          {sortConfig.field === 'nama' && (
                            <ArrowUpDown className={`w-4 h-4 ${
                              sortConfig.direction === 'desc' ? 'rotate-180' : ''
                            }`} />
                          )}
                        </div>
                      </th>
                      <th onClick={() => handleSort('lantai')} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          Lantai
                          {sortConfig.field === 'lantai' && (
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
                    {filteredAndSortedRooms().map((room) => (
                      <tr key={room.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <DoorClosed className="w-4 h-4 text-primary" />
                            {room.nama}
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-ghost">Lantai {room.lantai}</div>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-ghost btn-sm text-error"
                              onClick={() => handleDeleteRoom(room.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAndSortedRooms().length === 0 && (
                      <tr>
                        <td colSpan="3">
                          <div className="text-center py-8">
                            <DoorClosed className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                            <p className="text-base-content/60">
                              {rooms.length === 0 
                                ? 'Belum ada ruangan di gedung ini'
                                : 'Tidak ada ruangan yang sesuai dengan filter'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Building Modals */}
      <dialog id="modal-add-building" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Tambah Gedung Baru</h3>
          <form onSubmit={handleAddBuilding}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama Gedung</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={buildingForm.nama}
                onChange={(e) => setBuildingForm({ ...buildingForm, nama: e.target.value })}
                placeholder="Masukkan nama gedung"
                required
              />
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

      <dialog id="modal-edit-building" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Edit Gedung</h3>
          <form onSubmit={handleEditBuilding}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama Gedung</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={buildingForm.nama}
                onChange={(e) => setBuildingForm({ ...buildingForm, nama: e.target.value })}
                placeholder="Masukkan nama gedung"
                required
              />
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

      <dialog id="modal-add-room" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Tambah Ruangan Baru</h3>
          <form onSubmit={handleAddRoom}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama Ruangan</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={roomForm.nama}
                onChange={(e) => setRoomForm({ ...roomForm, nama: e.target.value })}
                placeholder="Masukkan nama ruangan"
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Nomor Lantai</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={roomForm.lantai}
                onChange={(e) => setRoomForm({ ...roomForm, lantai: e.target.value })}
                placeholder="Masukkan nomor lantai"
                required
                min="0"
              />
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

export default Ruangan;