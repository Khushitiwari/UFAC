import { AnimatePresence, motion } from 'framer-motion';
import { fadeIn, fadeSlideUp } from './reportMotion.js';

const ReportLoadTransition = ({ loading, hasData, skeleton, children }) => (
  <AnimatePresence mode="wait">
    {loading && !hasData ? (
      <motion.div
        key="report-skeleton"
        {...fadeIn}
        className="report-load-skeleton"
      >
        {skeleton}
      </motion.div>
    ) : (
      <motion.div
        key="report-content"
        {...fadeSlideUp}
        className={`report-load-content ${loading ? 'is-refreshing' : ''}`}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export default ReportLoadTransition;
