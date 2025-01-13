import { useNavigate } from 'react-router-dom';
import { Frown, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-4">
          {/* Animated sad face icon */}
          <div className="animate-bounce">
            <Frown size={64} className="text-primary" />
          </div>
        </div>
        
        {/* Large 404 text */}
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        
        {/* Error messages */}
        <h2 className="text-2xl font-semibold mb-2">Oops! Halaman Tidak Ditemukan</h2>
        <p className="text-base-content/60 mb-8">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline gap-2"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          
          {/* <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary gap-2"
          >
            <Home size={20} />
            Halaman Utama
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default NotFound;