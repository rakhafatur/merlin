import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './HomePage.css';
import bgImage from '../../../assets/bg-home-blue.png';
import heroImage from '../../../assets/bg-home.png'; // Bisa diganti hero MERLIN nanti

function HomePageDesktop() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const firstName = user?.nama?.split(' ')[0] || 'kamu';
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <div className="home-content">
        <div className="home-card">
          <div className="home-text">
            <motion.h1
              className="home-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            >
              Hi, {firstName}!
            </motion.h1>

            <motion.p
              className="home-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            >
              Selamat datang di <span className="gold-text">MERLIN</span> ✨<br />
              Pantau performa merchant, transaksi, dan rekomendasi promo dalam satu dashboard cerdas.
            </motion.p>

            <motion.div
              className="home-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="home-action-label">Mulai dari mana hari ini?</p>
              <div className="home-pills">
                <span className="pill" onClick={() => navigate('/dashboard')}>🎯 Merchant Engine</span>
              </div>
            </motion.div>
          </div>

          <div className="divider"></div>

          <motion.div
            className="home-image"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <img src={heroImage} alt="MERLIN Hero" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HomePageDesktop;