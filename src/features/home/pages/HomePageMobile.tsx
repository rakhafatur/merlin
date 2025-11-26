import './HomePage.css';
import bgImage from '../../../assets/bg-home.png';
import { motion } from 'framer-motion';

function HomePageMobile() {
  return (
    <div className="home-wrapper">
      <img src={bgImage} alt="background" className="home-bg-mobile" />
      <div className="home-overlay">
        <motion.h1
          className="home-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        >
          MERLIN
        </motion.h1>

        <motion.p
          className="home-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          Under Maintenance ⚠️
        </motion.p>

        <motion.p
          className="home-sub-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          Fitur mobile sedang dalam pengembangan. Mohon bersabar!
        </motion.p>
      </div>
    </div>
  );
}

export default HomePageMobile;
