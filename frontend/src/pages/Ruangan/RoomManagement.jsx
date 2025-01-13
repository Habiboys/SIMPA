// src/pages/Ruangan/RoomManagement.jsx
import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { Plus, DoorClosed, PencilLine, Trash2, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';

const RoomManagement = ({ building, onUpdate, selectedProject }) => {
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState({ nama: '', lantai: '' });
  const [selectedRoom, setSelectedRoom] = useState(null);

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
      customClass: {
        popup: 'colored-toast'
      }
    });
  };

  // Modal handlers
  const showAddRoomModal = () => {
    setRoomForm({ nama: '', lantai: '' });
    document.getElementById(`modal-add-room-${building.id}`).showModal();
  };

  const showEditRoomModal = (room) => {
    setSelectedRoom(room);
    setRoomForm({ nama: room.nama, lantai: room.lantai.toString() });
    document.getElementById(`modal-edit-room-${building.id}`).showModal();
  };

  const closeModals = () => {
    document.getElementById(`modal-add-room-${building.id}`)?.close();
    document.getElementById(`modal-edit-room-${building.id}`)?.close();
    setSelectedRoom(null);
    setRoomForm({ nama: '', lantai: '' });
  };

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      const data = await apiRequest(
        `/proyek/${selectedProject.id}/gedung/${building.id}/ruangan`,
        'GET',
        null,
        true
      );
      setRooms(data);
      if (onUpdate) onUpdate();
    } catch (error) {
      showAlert(error.message || 'Gagal mengambil data ruangan', 'error');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [building.id]);

  // CRUD Handlers
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(
        `/proyek/${selectedProject.id}/gedung/${building.id}/ruangan`,
        'POST',
        { 
          ...roomForm, 
          lantai: parseInt(roomForm.lantai),
          id_gedung: building.id 
        },
        true
      );
      closeModals();
      fetchRooms();
      showAlert('Ruangan berhasil ditambahkan');
    } catch (error) {
      showAlert(error.message || 'Gagal menambahkan ruangan', 'error');
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(
        `/proyek/${selectedProject.id}/gedung/${building.id}/ruangan/${selectedRoom.id}`,
        'PATCH',
        { 
          ...roomForm, 
          lantai: parseInt(roomForm.lantai),
          id_gedung: building.id 
        },
        true
      );
      closeModals();
      fetchRooms();
      showAlert('Ruangan berhasil diperbarui');
    } catch (error) {
      showAlert(error.message || 'Gagal memperbarui ruangan', 'error');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const result = await Swal.fire({
      title: 'Hapus Ruangan?',
      text: 'Anda yakin ingin menghapus ruangan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiRequest(
          `/proyek/${selectedProject.id}/gedung/${building.id}/ruangan/${roomId}`,
          'DELETE',
          null,
          true
        );
        fetchRooms();
        showAlert('Ruangan berhasil dihapus');
      } catch (error) {
        showAlert(error.message || 'Gagal menghapus ruangan', 'error');
      }
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary/70" />
            <h2 className="card-title">{building.nama}</h2>
          </div>
          <button
            onClick={showAddRoomModal}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Ruangan
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Nama Ruangan</th>
                <th>Lantai</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <DoorClosed className="w-4 h-4 text-primary/70" />
                      <span className="font-medium">{room.nama}</span>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-ghost">Lantai {room.lantai}</div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => showEditRoomModal(room)}
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
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
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <div className="text-center py-8">
                      <DoorClosed className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                      <p className="text-base-content/60">Belum ada ruangan di gedung ini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      <dialog id={`modal-add-room-${building.id}`} className="modal modal-bottom sm:modal-middle">
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
                min="1"
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
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Room Modal */}
      <dialog id={`modal-edit-room-${building.id}`} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Edit Ruangan</h3>
          <form onSubmit={handleEditRoom}>
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
                min="1"
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
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default RoomManagement;