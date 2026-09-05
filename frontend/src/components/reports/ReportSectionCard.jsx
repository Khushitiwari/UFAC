import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/format.js';
import { staggerItem, tableRowVariant } from './reportMotion.js';

const ReportSectionCard = ({ title, items = [], total }) => (
  <motion.div
    className="card report-section-card"
    variants={staggerItem}
    layout
  >
    <h3>{title}</h3>
    <table className="report-section-table">
      <tbody>
        {items.map((item, index) => (
          <motion.tr
            key={item.accountId || item.name}
            className="report-section-row"
            variants={tableRowVariant}
            custom={index}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.03 }}
          >
            <td>{item.name || item.account?.name}</td>
            <td>{formatCurrency(item.balance ?? item.amount)}</td>
          </motion.tr>
        ))}
        <motion.tr
          className="report-section-total"
          variants={tableRowVariant}
          initial="initial"
          animate="animate"
          transition={{ delay: items.length * 0.03 + 0.05 }}
        >
          <td>Total {title}</td>
          <td>{formatCurrency(total)}</td>
        </motion.tr>
      </tbody>
    </table>
  </motion.div>
);

export default ReportSectionCard;
