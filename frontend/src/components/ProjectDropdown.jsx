import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import { useProject } from '../contexts/ProjectContext';
import Swal from 'sweetalert2';

const ProjectDropdown = () => {
  const { selectedProject, setSelectedProject } = useProject();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [newProjectDate, setNewProjectDate] = useState("");
  const [newProjectLocation, setNewProjectLocation] = useState("");

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

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiRequest("/proyek", "GET", null, true);
        setProjects(data);
        if (!selectedProject && data.length > 0) {
          setSelectedProject(data[0]);
          showAlert('Project berhasil dimuat');
        }
      } catch (error) {
        showAlert(error.message || 'Gagal mengambil data project', 'error');
      }
    };

    fetchProjects();
  }, [selectedProject, setSelectedProject]);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setIsDropdownOpen(false);
    showAlert(`Project ${project.nama} dipilih`);
  };

  const handleAddProject = async () => {
    if (!newProjectName || !newProjectClient || !newProjectDate || !newProjectLocation) {
      showAlert('Semua field harus diisi', 'error');
      return;
    }

    try {
      const newProject = await apiRequest(
        "/proyek",
        "POST",
        {
          nama: newProjectName,
          pelanggan: newProjectClient,
          tanggal: newProjectDate,
          lokasi: newProjectLocation,
        },
        true
      );
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      setIsModalOpen(false);
      resetForm();
      showAlert('Project berhasil ditambahkan');
    } catch (error) {
      showAlert(error.message || 'Gagal menambahkan project', 'error');
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: 'Hapus Project?',
      text: 'Anda yakin ingin menghapus project ini? Semua data terkait project akan ikut terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/proyek/${projectId}`, "DELETE", null, true);
        const updatedProjects = projects.filter((project) => project.id !== projectId);
        setProjects(updatedProjects);
        
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProjects[0] || null);
        }
        
        showAlert('Project berhasil dihapus');
      } catch (error) {
        showAlert(error.message || 'Gagal menghapus project', 'error');
      }
    }
  };

  const resetForm = () => {
    setNewProjectName("");
    setNewProjectClient("");
    setNewProjectDate("");
    setNewProjectLocation("");
  };

  // Filter projects
  const filteredProjects = projects.filter((project) =>
    project.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left">
      {/* Project Selection Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-base-100 hover:bg-base-200 rounded-lg border border-base-300"
      >
        <span className="font-semibold text-base">
          {selectedProject ? selectedProject.nama : "Pilih Project"}
        </span>
        <ChevronDown size={18} className="text-base-content/70" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-base-100 rounded-lg shadow-xl z-50 border border-base-300">
          <div className="p-4 border-b border-base-300">
            {/* Search Bar */}
            <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg mb-3">
              <Search size={20} className="text-base-content/60" />
              <input
                type="text"
                placeholder="Cari project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-full"
              />
            </div>
            {/* Add Project Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 w-full px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors"
            >
              <Plus size={20} />
              Buat Project Baru
            </button>
          </div>

          {/* Projects List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-base-content/60">
                {searchTerm ? 'Tidak ada project yang sesuai' : 'Belum ada project'}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="flex items-center justify-between p-4 hover:bg-base-200 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-medium">{project.nama}</div>
                    <div className="text-sm text-base-content/60">
                      {project.pelanggan} • {project.lokasi}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-2 hover:bg-base-300 rounded-full transition-colors"
                  >
                    <Trash2 size={16} className="text-error" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Tambah Project Baru</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Project</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Masukkan nama project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Masukkan nama pelanggan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Project</label>
                <input
                  type="date"
                  value={newProjectDate}
                  onChange={(e) => setNewProjectDate(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lokasi Project</label>
                <input
                  type="text"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Masukkan lokasi project"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="btn btn-ghost"
              >
                Batal
              </button>
              <button
                onClick={handleAddProject}
                className="btn btn-primary"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDropdown;