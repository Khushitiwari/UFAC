import { motion } from 'framer-motion';
import { fadeIn } from '../../utils/motion.js';

const PageSkeleton = () => (
  <motion.div
    className="page-skeleton"
    aria-hidden="true"
    initial={fadeIn.initial}
    animate={fadeIn.animate}
    transition={fadeIn.transition}
  >
    <div className="skeleton-bar skeleton-title" />
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="skeleton-bar" style={{ width: '40%', marginBottom: '1rem' }} />
      <div className="skeleton-bar" style={{ width: '100%', marginBottom: '0.75rem' }} />
      <div className="skeleton-bar" style={{ width: '92%' }} />
    </div>
  </motion.div>
);

export default PageSkeleton;
