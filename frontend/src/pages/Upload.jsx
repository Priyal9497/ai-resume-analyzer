import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FileUpload from '../components/Upload/FileUpload';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = (result) => {
    toast.success('Resume uploaded successfully!');
    setTimeout(() => {
      navigate(`/analysis?resumeId=${result.resume_id}`);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-32 pb-12 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Upload Your <span className="gradient-text">Resume</span>
        </h2>
        <p className="text-lg text-white/50">
          Drop your resume in PDF, DOCX, or TXT format and let our AI do the rest.
        </p>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </motion.div>
    </div>
  );
};

export default Upload;