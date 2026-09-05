import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/motion.js';

const PageShell = ({ title, subtitle, children, actions, bare = false }) => (
  <motion.div variants={staggerContainer} initial="initial" animate="animate">
    <motion.div className="page-header" variants={staggerItem}>
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions}
    </motion.div>
    <motion.div className="page-body" variants={staggerItem}>
      {bare ? children : <div className="card">{children}</div>}
    </motion.div>
  </motion.div>
);

export default PageShell;
