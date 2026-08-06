import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/transactionService';
import styles from './Transactions.module.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL'

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '₹ --';
    return `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransactions();
        setTransactions(data || []);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
        setError(err.message || "Failed to load transaction audit logs.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (filter === 'BUY') return t.transactionType === 'BUY';
    if (filter === 'SELL') return t.transactionType === 'SELL';
    return true;
  });

  // Calculate summary metrics
  const totalCount = transactions.length;
  const buyVolume = transactions
    .filter(t => t.transactionType === 'BUY')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const sellVolume = transactions
    .filter(t => t.transactionType === 'SELL')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalRealizedPnL = transactions
    .filter(t => t.transactionType === 'SELL')
    .reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>📜 Transaction Audit Logs</h1>
          <p className={styles.subtitle}>Complete historical record of all your buy and sell transactions</p>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Summary Grid */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Executions</span>
            <span className={styles.summaryValue}>{loading ? '--' : totalCount}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Buy Capital</span>
            <span className={styles.summaryValue}>{loading ? '--' : formatCurrency(buyVolume)}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Sell Proceeds</span>
            <span className={styles.summaryValue}>{loading ? '--' : formatCurrency(sellVolume)}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Realized P&L</span>
            <span className={`${styles.summaryValue} ${totalRealizedPnL >= 0 ? styles.positive : styles.negative}`}>
              {loading ? '--' : `${totalRealizedPnL >= 0 ? '+' : ''}${formatCurrency(totalRealizedPnL)}`}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterContainer}>
          <button
            className={`${styles.filterTab} ${filter === 'ALL' ? styles.activeFilterTab : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All Logs ({transactions.length})
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'BUY' ? styles.activeFilterTab : ''}`}
            onClick={() => setFilter('BUY')}
          >
            BUY Orders ({transactions.filter(t => t.transactionType === 'BUY').length})
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'SELL' ? styles.activeFilterTab : ''}`}
            onClick={() => setFilter('SELL')}
          >
            SELL Orders ({transactions.filter(t => t.transactionType === 'SELL').length})
          </button>
        </div>

        {/* Transactions Table Card */}
        <div className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '1rem' }}>
              <div className={styles.skeletonRow}></div>
              <div className={styles.skeletonRow}></div>
              <div className={styles.skeletonRow}></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No transaction audit logs found</div>
              <p>Your buy and sell orders will be recorded here automatically.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Quantity / Units</th>
                  <th>Price / NAV</th>
                  <th>Total Amount</th>
                  <th>Realized P&L</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => {
                  const isBuy = tx.transactionType === 'BUY';
                  const isPnLPositive = (tx.realizedPnL || 0) >= 0;

                  return (
                    <tr key={tx._id}>
                      <td>
                        <span className={isBuy ? styles.badgeBuy : styles.badgeSell}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td>
                        <span className={styles.assetName}>{tx.assetName}</span>
                        <span className={styles.assetSymbol}>{tx.symbol}</span>
                      </td>
                      <td>{tx.type}</td>
                      <td>{tx.quantity} units</td>
                      <td>₹{parseFloat(tx.pricePerUnit || 0).toFixed(2)}</td>
                      <td><strong>{formatCurrency(tx.totalAmount)}</strong></td>
                      <td>
                        {!isBuy ? (
                          <span className={isPnLPositive ? styles.positive : styles.negative}>
                            {tx.realizedPnL >= 0 ? '+' : ''}{formatCurrency(tx.realizedPnL)}
                          </span>
                        ) : (
                          <span style={{ color: '#a0aec0' }}>--</span>
                        )}
                      </td>
                      <td>{formatDate(tx.date || tx.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
