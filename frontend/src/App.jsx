import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Match from './pages/Match';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col relative">
        {/* Background Orbs */}
        <div className="orb orb-primary w-[600px] h-[600px] -top-40 -left-40" />
        <div className="orb orb-secondary w-[500px] h-[500px] top-1/2 -right-40" />
        <div className="orb orb-accent w-[400px] h-[400px] bottom-0 left-1/2" />
        
        <Navbar />
        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/match" element={<Match />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(20, 20, 40, 0.9)',
              backdropFilter: 'blur(20px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#34D399',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#F87171',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;