import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import PageSkeleton from './PageSkeleton.jsx';
import { pageVariants } from '../../utils/motion.js';

const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="page-transition"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Suspense fallback={<PageSkeleton />}>
          {outlet}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
