// Currency and metric formatting utilities with Indian Rupees (₹ Crores / Lakhs) support

export function formatCurrency(amount, countryCode = 'IND') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.0 Cr';
  }
  const val = parseFloat(amount);
  
  // Default to INR (Crores and Lakhs)
  if (!countryCode || countryCode === 'IND' || countryCode === 'ALL') {
    if (Math.abs(val) < 1.0 && Math.abs(val) > 0) {
      return `₹${(val * 100).toFixed(1)} Lakhs`;
    }
    return `₹${val.toFixed(1)} Cr`;
  }
  
  if (countryCode === 'USA') {
    return `$${val.toFixed(1)}M USD`;
  }
  if (countryCode === 'BRA') {
    return `R$ ${(val * 5.2).toFixed(1)}M BRL`;
  }
  if (countryCode === 'ZAF') {
    return `R ${(val * 18.5).toFixed(1)}M ZAR`;
  }
  if (countryCode === 'CHN') {
    return `¥ ${(val * 7.2).toFixed(1)}M CNY`;
  }
  if (countryCode === 'RUS') {
    return `₽ ${(val * 90).toFixed(1)}M RUB`;
  }
  
  // Default fallback
  if (Math.abs(val) < 1.0 && Math.abs(val) > 0) {
    return `₹${(val * 100).toFixed(1)} Lakhs`;
  }
  return `₹${val.toFixed(1)} Cr`;
}

export function getCurrencyUnitLabel(countryCode = 'IND') {
  if (!countryCode || countryCode === 'IND' || countryCode === 'ALL') {
    return 'INR (₹ Crores)';
  }
  if (countryCode === 'USA') return 'USD ($ Millions)';
  if (countryCode === 'BRA') return 'BRL (R$ Millions)';
  if (countryCode === 'ZAF') return 'ZAR (Rand Millions)';
  if (countryCode === 'CHN') return 'CNY (¥ Millions)';
  if (countryCode === 'RUS') return 'RUB (₽ Millions)';
  return 'INR (₹ Crores)';
}

export function getCurrencySymbol(countryCode = 'IND') {
  if (!countryCode || countryCode === 'IND' || countryCode === 'ALL') return '₹';
  if (countryCode === 'USA') return '$';
  if (countryCode === 'BRA') return 'R$';
  if (countryCode === 'ZAF') return 'R';
  if (countryCode === 'CHN') return '¥';
  if (countryCode === 'RUS') return '₽';
  return '₹';
}

