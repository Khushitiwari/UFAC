import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell.jsx';
import { staggerContainer, staggerItem } from '../../components/reports/reportMotion.js';

const reportLinks = [
  { to: '/reports/balance-sheet', title: 'Balance Sheet', desc: 'Assets, liabilities, and capital as of a date', icon: '◫' },
  { to: '/reports/profit-loss', title: 'Profit & Loss', desc: 'Income and expenses for a period', icon: '▦' },
  { to: '/reports/budget', title: 'Budget Variance', desc: 'Planned vs actual by analytic account', icon: '◈' },
];

const ReportsIndexPage = () => (
  <PageShell title="Reports" subtitle="Financial statements and variance analysis">
    <motion.div
      className="report-link-grid"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {reportLinks.map((item) => (
        <motion.div key={item.to} variants={staggerItem}>
          <Link to={item.to} className="report-link-card">
            <motion.span
              className="report-link-icon"
              aria-hidden="true"
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            >
              {item.icon}
            </motion.span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  </PageShell>
);

export default ReportsIndexPage;
