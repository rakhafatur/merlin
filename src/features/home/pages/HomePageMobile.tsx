import { motion } from 'framer-motion';

function HomePageMobile() {
  return (
    <div
      style={{
        backgroundColor: '#003b73', // biru MERLIN
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        color: 'white',
        padding: '0 20px',
      }}
    >
      <motion.h1
        style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
      >
        MERLIN
      </motion.h1>

      <motion.p
        style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
      >
        Under Maintenance ⚠️
      </motion.p>

      <motion.p
        style={{ fontSize: '1rem', opacity: 0.9 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      >
        Fitur mobile sedang dalam pengembangan. Mohon bersabar!
      </motion.p>
    </div>
  );
}

export default HomePageMobile;