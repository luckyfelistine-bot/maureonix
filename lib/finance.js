const fetch = require('node-fetch');

class FinanceHub {
  constructor() { this.portfolios = global.db.portfolios ||= {}; }

  async stock(sym) {
    try {
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym.toUpperCase()}?interval=1d&range=1d`);
      const d = await r.json();
      const meta = d.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice;
      const prev = meta?.previousClose || meta?.chartPreviousClose;
      const change = prev ? (((price-prev)/prev)*100).toFixed(2) : '0.00';
      return { price: price?.toFixed(2), change, prev: prev?.toFixed(2), currency: meta?.currency || 'USD' };
    } catch(e) { throw new Error('Stock API limit'); }
  }

  tip(amount, pct = 15, people = 1) {
    const tip = amount * (pct/100);
    const total = amount + tip;
    return { subtotal: amount.toFixed(2), tip: tip.toFixed(2), total: total.toFixed(2), each: (total/people).toFixed(2) };
  }

  split(items, tax = 8, tip = 15) {
    // items: array of {item, price, who: []}
    const sub = items.reduce((a,b) => a + (b.price||0), 0);
    const taxAmt = sub * (tax/100);
    const tipAmt = sub * (tip/100);
    const total = sub + taxAmt + tipAmt;
    return { subtotal: sub.toFixed(2), tax: taxAmt.toFixed(2), tip: tipAmt.toFixed(2), total: total.toFixed(2) };
  }

  emi(principal, rate, months) {
    const r = rate / 12 / 100;
    const e = (principal * r * Math.pow(1+r, months)) / (Math.pow(1+r, months)-1);
    const total = e * months;
    return { emi: e.toFixed(2), total: total.toFixed(2), interest: (total-principal).toFixed(2) };
  }

  savings(goal, monthly, rate = 5) {
    const r = rate/100/12;
    let months = 0; let bal = 0;
    while (bal < goal && months < 600) { bal = (bal + monthly) * (1+r); months++; }
    return { months, years: (months/12).toFixed(1), total: bal.toFixed(2) };
  }

  addPortfolio(userId, type, sym, qty, price) {
    this.portfolios[userId] ||= [];
    this.portfolios[userId].push({ type, sym: sym.toUpperCase(), qty: parseFloat(qty), buy: parseFloat(price), date: Date.now() });
  }
  getPortfolio(userId) { return this.portfolios[userId] || []; }
}

module.exports = new FinanceHub();