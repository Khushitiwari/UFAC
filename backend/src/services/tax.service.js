/**
 * Simple tax calculation helper.
 * @param {number} amount
 * @param {number} [rate=0.08]
 */
export const calculateTax = (amount, rate = 0.08) => {
  const tax = Math.round(amount * rate * 100) / 100;
  return { amount, rate, tax, total: amount + tax };
};

export default { calculateTax };
