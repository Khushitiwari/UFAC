import { motion } from 'framer-motion';
import { fadeIn, scaleIn } from '../../utils/motion.js';

const LoadingSpinner = ({ size = 40, label = 'Loading...' }) => (
  <motion.div
    role="status"
    aria-label={label}
    initial={scaleIn.initial}
    animate={scaleIn.animate}
    exit={scaleIn.exit}
    transition={scaleIn.transition}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '0.75rem',
    }}
  >
    <motion.div
      initial={fadeIn.initial}
      animate={{ ...fadeIn.animate, rotate: 360 }}
      transition={{
        rotate: { duration: 0.7, repeat: Infinity, ease: 'linear' },
        opacity: fadeIn.transition,
      }}
      style={{
        width: size,
        height: size,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
      }}
    />
    <motion.span
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={{ ...fadeIn.transition, delay: 0.08 }}
      style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}
    >
      {label}
    </motion.span>
  </motion.div>
);

export default LoadingSpinner;
