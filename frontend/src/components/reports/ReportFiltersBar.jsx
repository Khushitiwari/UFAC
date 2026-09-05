import { motion } from 'framer-motion';
import { fadeSlideUp } from './reportMotion.js';
import Button from '../common/Button.jsx';

const ReportFiltersBar = ({ children, onRefresh, loading }) => (
  <motion.div
    className="report-filters-bar"
    {...fadeSlideUp}
    transition={{ ...fadeSlideUp.transition, delay: 0.05 }}
  >
    {children}
    <Button variant="secondary" onClick={onRefresh} disabled={loading}>
      {loading ? 'Loading…' : 'Refresh'}
    </Button>
    {loading && <span className="report-refresh-indicator" aria-hidden="true" />}
  </motion.div>
);

export default ReportFiltersBar;
