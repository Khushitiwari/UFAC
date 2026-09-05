import { AnimatePresence, motion } from 'framer-motion';
import { fadeIn, fadeSlideUp } from '../../utils/motion.js';

const PageLoadTransition = ({ loading, hasData, skeleton, children, className = '' }) => (
  <AnimatePresence mode="wait">
    {loading && !hasData ? (
      <motion.div
        key="page-loading"
        initial={fadeIn.initial}
        animate={fadeIn.animate}
        exit={fadeIn.exit}
        transition={fadeIn.transition}
        className={`page-load-skeleton ${className}`.trim()}
      >
        {skeleton}
      </motion.div>
    ) : (
      <motion.div
        key="page-content"
        initial={fadeSlideUp.initial}
        animate={fadeSlideUp.animate}
        exit={fadeSlideUp.exit}
        transition={fadeSlideUp.transition}
        className={`page-load-content ${loading ? 'is-refreshing' : ''} ${className}`.trim()}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export default PageLoadTransition;
