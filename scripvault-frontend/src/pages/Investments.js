import React, { useEffect, useState } from 'react';
import { getInvestments, deleteInvestment, sellInvestment } from '../services/investmentService';
import { getTransactions } from '../services/transactionService';
import styles from './Investments.module.css';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Selling Stocks / ETFs
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [unitsToSell, setUnitsToSell] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [isSubmittingSell, setIsSubmittingSell] = useState(false);
  const [sellError, setSellError] = useState('');

  // Helper functions for formatting
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '₹ --';
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '--%';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  // Fetch investments and transactions data on component mount
  useEffect(() => {
    const fetchInvestmentsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, txData] = await Promise.all([
          getInvestments(),
          getTransactions().catch(() => [])
        ]);
        const processedData = (data || []).map(item => {
          const gainLoss = item.marketValue - item.investedValue;
          const gainLossPercent = item.investedValue > 0 ? (gainLoss / item.investedValue) * 100 : 0;
          return {
            ...item,
            gainLoss,
            gainLossPercent,
          };
        });
        setInvestments(processedData);
        setTransactions(txData || []);
      } catch (err) {
        console.error("Failed to fetch investments:", err);
        setError("Failed to load investments. Please try again later.");
        setInvestments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestmentsData();
  }, []);

  // Real-time SSE price stream connection to simulate live market fluctuations
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/api/explore/stream');

    eventSource.onmessage = (event) => {
      try {
        const updates = JSON.parse(event.data);
        if (!updates || !Array.isArray(updates)) return;

        const updateMap = new Map();
        updates.forEach(u => {
          if (u.id) updateMap.set(u.id.toString(), u);
          if (u.symbol) updateMap.set(u.symbol.toUpperCase(), u);
        });

        setInvestments(prevInvestments =>
          prevInvestments.map(item => {
            const symKey = item.symbol ? item.symbol.toUpperCase() : '';
            const upd = updateMap.get(item._id?.toString()) || updateMap.get(symKey);
            if (upd && upd.currentPrice && upd.currentPrice > 0) {
              const newUnitPrice = upd.currentPrice;
              const newMarketValue = item.quantity * newUnitPrice;
              const newGainLoss = newMarketValue - item.investedValue;
              const newGainLossPercent = item.investedValue > 0 ? (newGainLoss / item.investedValue) * 100 : 0;
              return {
                ...item,
                simulatedUnitPrice: newUnitPrice,
                marketValue: newMarketValue,
                gainLoss: newGainLoss,
                gainLossPercent: newGainLossPercent
              };
            }
            return item;
          })
        );
      } catch (err) {
        console.error('Error parsing SSE stream in Investments:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Investments SSE stream error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Handle Delete logic
  const handleDelete = async (id, name) => {
    setMessage('');
    try {
      await deleteInvestment(id);
      setInvestments(prev => prev.filter(item => item._id !== id));
      setMessage(`'${name}' removed from portfolio. ✅`);
    } catch (err) {
      console.error("Failed to delete investment:", err);
      setMessage(`Failed to remove investment from portfolio: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 4000);
  };

  // Open Sell Modal - Prefills with currently changed simulated price
  const handleOpenSellModal = (item) => {
    setSelectedInvestment(item);
    setUnitsToSell('1');
    const currentPricePerUnit = item.simulatedUnitPrice || (item.quantity > 0 ? (item.marketValue / item.quantity) : item.amount);
    setSellPrice(currentPricePerUnit.toFixed(2));
    setSellError('');
  };

  // Close Sell Modal
  const handleCloseSellModal = () => {
    setSelectedInvestment(null);
    setUnitsToSell('');
    setSellPrice('');
    setSellError('');
  };

  // Submit Sell Transaction
  const handleConfirmSell = async (e) => {
    e.preventDefault();
    if (!selectedInvestment) return;

    const numUnits = Number(unitsToSell);
    const pricePerUnit = Number(sellPrice);

    if (isNaN(numUnits) || numUnits <= 0) {
      setSellError('Please enter a valid quantity greater than 0.');
      return;
    }

    if (numUnits > selectedInvestment.quantity) {
      setSellError(`Quantity exceeds available units (${selectedInvestment.quantity}).`);
      return;
    }

    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      setSellError('Please enter a valid sell price.');
      return;
    }

    setIsSubmittingSell(true);
    setSellError('');
    setMessage('');

    try {
      const res = await sellInvestment(selectedInvestment._id, {
        unitsToSell: numUnits,
        sellPrice: pricePerUnit
      });

      if (res.soldOut) {
        setInvestments(prev => prev.filter(item => item._id !== selectedInvestment._id));
      } else if (res.updatedInvestment) {
        setInvestments(prev => prev.map(item => {
          if (item._id === selectedInvestment._id) {
            const updated = res.updatedInvestment;
            const gainLoss = updated.marketValue - updated.investedValue;
            const gainLossPercent = updated.investedValue > 0 ? (gainLoss / updated.investedValue) * 100 : 0;
            return {
              ...updated,
              gainLoss,
              gainLossPercent
            };
          }
          return item;
        }));
      }

      setMessage(res.message || `Successfully sold ${numUnits} units of ${selectedInvestment.name}. ✅`);
      handleCloseSellModal();
      getTransactions().then(txs => setTransactions(txs || [])).catch(() => {});
    } catch (err) {
      console.error("Error selling units:", err);
      setSellError(err.message || 'Failed to complete sell transaction.');
    } finally {
      setIsSubmittingSell(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Calculate overall portfolio summary
  const totalInvested = (investments || []).reduce((sum, item) => sum + (item.investedValue || 0), 0);
  const totalMarketValue = (investments || []).reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const totalRealizedPnL = (transactions || [])
    .filter(t => t.transactionType === 'SELL')
    .reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
  const overallGainLoss = totalMarketValue - totalInvested;
  const overallGainLossPercent = totalInvested > 0 ? (overallGainLoss / totalInvested) * 100 : 0;
  const isOverallPositive = overallGainLoss >= 0;

  // Real-time calculations for Sell Modal preview
  const avgPurchasePrice = selectedInvestment && selectedInvestment.quantity > 0
    ? (selectedInvestment.investedValue / selectedInvestment.quantity)
    : 0;
  const currentUnitsNum = Number(unitsToSell) || 0;
  const currentSellPriceNum = Number(sellPrice) || 0;
  const previewCostReduced = currentUnitsNum * avgPurchasePrice;
  const previewProceeds = currentUnitsNum * currentSellPriceNum;
  const previewPnL = previewProceeds - previewCostReduced;
  const isPreviewProfit = previewPnL >= 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.portfolioHeader}>
          <h1 className={styles.portfolioTitle}>My Portfolio</h1>
          <p className={styles.portfolioSubtitle}>Track your current holdings, sell stocks/ETFs, and monitor performance</p>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && (
          <p className={`${styles.message} ${message.includes('Failed') || message.includes('error') ? styles.error : styles.success}`}>
            {message}
          </p>
        )}

        {/* Overall Portfolio Summary Card */}
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>Overall Portfolio Performance</h3>
          {loading ? (
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.skeletonTextSmall}></div>
                <div className={styles.skeletonTextMedium}></div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.skeletonTextSmall}></div>
                <div className={styles.skeletonTextMedium}></div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.skeletonTextSmall}></div>
                <div className={styles.skeletonTextMedium}></div>
              </div>
            </div>
          ) : (
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Invested</span>
                <span className={styles.summaryValue}>{formatCurrency(totalInvested)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Current Value</span>
                <span className={styles.summaryValue}>{formatCurrency(totalMarketValue)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Unrealized Gain/Loss</span>
                <span className={`${styles.summaryValue} ${isOverallPositive ? styles.positive : styles.negative}`}>
                  {overallGainLoss >= 0 ? '+' : ''}{formatCurrency(overallGainLoss)} ({formatPercentage(overallGainLossPercent)})
                </span>
              </div>
              {totalRealizedPnL !== 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Realized Profit / Loss</span>
                  <span className={`${styles.summaryValue} ${totalRealizedPnL >= 0 ? styles.positive : styles.negative}`}>
                    {totalRealizedPnL >= 0 ? '+' : ''}{formatCurrency(totalRealizedPnL)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Individual Investments Grid */}
        <div className={styles.investmentsGrid}>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className={styles.skeletonInvestmentCard}>
                <div className={styles.skeletonCardHeader}>
                  <div className={styles.skeletonCircle}></div>
                  <div className={styles.skeletonTextGroup}>
                    <div className={styles.skeletonTextMedium}></div>
                    <div className={styles.skeletonTextSmall}></div>
                  </div>
                  <div className={styles.skeletonRemoveButton}></div>
                </div>
                <div className={styles.skeletonCardDetailsGrid}>
                  <div className={styles.skeletonDetailItem}>
                    <div className={styles.skeletonTextSmall}></div>
                    <div className={styles.skeletonTextMedium}></div>
                  </div>
                  <div className={styles.skeletonDetailItem}>
                    <div className={styles.skeletonTextSmall}></div>
                    <div className={styles.skeletonTextMedium}></div>
                  </div>
                  <div className={styles.skeletonDetailItem}>
                    <div className={styles.skeletonTextSmall}></div>
                    <div className={styles.skeletonTextMedium}></div>
                  </div>
                </div>
              </div>
            ))
          ) : investments.length === 0 ? (
            <p className={styles.noInvestmentsMessage}>You have no active investments in your portfolio. Start exploring!</p>
          ) : (
            investments.map(item => {
              const isPositive = item.gainLoss >= 0;

              return (
                <div key={item._id} className={styles.investmentCard}>
                  <div className={styles.cardHeader}>
                    <img
                      src={item.logo || `https://placehold.co/40x40/6c757d/white?text=${item.name.substring(0, 4).toUpperCase()}`}
                      alt={`${item.name} Logo`}
                      className={styles.cardLogo}
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/6c757d/white?text=${item.name.substring(0, 4).toUpperCase()}`; }}
                    />
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>{item.name}</h3>
                      <p className={styles.cardSubtitle}>{item.type} ({item.frequency})</p>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handleOpenSellModal(item)}
                        className={styles.sellButton}
                        title={item.type === 'Mutual Fund' ? "Redeem / Sell units at NAV" : "Sell shares/units"}
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardDetailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        {item.type === 'Mutual Fund' ? 'NAV (Price/Unit)' : 'Price / Share'}
                      </span>
                      <span className={styles.detailValue}>
                        ₹{parseFloat(item.simulatedUnitPrice || (item.quantity > 0 ? (item.marketValue / item.quantity) : item.amount)).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        {item.type === 'Mutual Fund' ? 'Balance Units' : 'Quantity'}
                      </span>
                      <span className={styles.detailValue}>{item.quantity} units</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Invested</span>
                      <span className={styles.detailValue}>{formatCurrency(item.investedValue)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Market Value</span>
                      <span className={styles.detailValue}>{formatCurrency(item.marketValue)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Gain/Loss</span>
                      <span className={`${styles.detailValue} ${isPositive ? styles.positive : styles.negative}`}>
                        {item.gainLoss >= 0 ? '+' : ''}{formatCurrency(item.gainLoss)} ({formatPercentage(item.gainLossPercent)})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Sell Modal */}
      {selectedInvestment && (
        <div className={styles.modalOverlay} onClick={handleCloseSellModal}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                🏷️ Sell {selectedInvestment.type}: {selectedInvestment.name}
              </h2>
              <button className={styles.modalClose} onClick={handleCloseSellModal}>&times;</button>
            </div>

            <form onSubmit={handleConfirmSell}>
              <div className={styles.modalBody}>
                {sellError && <p className={styles.errorMessage}>{sellError}</p>}

                {/* Holding Summary */}
                <div className={styles.holdingSummaryBox}>
                  <div className={styles.summaryBoxItem}>
                    <span className={styles.summaryBoxLabel}>Total Quantity Owned</span>
                    <span className={styles.summaryBoxValue}>{selectedInvestment.quantity} units</span>
                  </div>
                  <div className={styles.summaryBoxItem}>
                    <span className={styles.summaryBoxLabel}>
                      {selectedInvestment.type === 'Mutual Fund' ? 'Purchase NAV Point' : 'Avg. Purchase Price'}
                    </span>
                    <span className={styles.summaryBoxValue}>₹{avgPurchasePrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Input: Units to Sell */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {selectedInvestment.type === 'Mutual Fund' ? 'Units to Redeem / Sell' : 'Quantity to Sell'}
                  </label>
                  <div className={styles.inputWithMax}>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      max={selectedInvestment.quantity}
                      value={unitsToSell}
                      onChange={(e) => setUnitsToSell(e.target.value)}
                      placeholder="Enter quantity"
                      className={styles.formInput}
                      required
                    />
                    <button
                      type="button"
                      className={styles.maxButton}
                      onClick={() => setUnitsToSell(String(selectedInvestment.quantity))}
                    >
                      Sell All
                    </button>
                  </div>
                </div>

                {/* Input: Sell Price per Unit / NAV - Locked to Live Central Market Price */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{selectedInvestment.type === 'Mutual Fund' ? 'Redemption NAV Point Rate (₹)' : 'Sell Price per Share (₹)'}</span>
                    <span style={{ fontSize: '0.78rem', color: '#dd6b20', fontWeight: '600' }}>🔒 Live Market Rate</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={sellPrice}
                    readOnly={true}
                    placeholder="Live market price"
                    className={styles.formInput}
                    style={{ backgroundColor: '#edf2f7', cursor: 'not-allowed', color: '#2d3748', fontWeight: '600' }}
                    required
                  />
                </div>

                {/* Dynamic Transaction Preview */}
                {currentUnitsNum > 0 && currentSellPriceNum > 0 && (
                  <div className={isPreviewProfit ? styles.previewBox : styles.previewBoxLoss}>
                    <div className={styles.previewRow}>
                      <span>Total Sale Proceeds:</span>
                      <strong>₹{previewProceeds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className={styles.previewRow}>
                      <span>Invested Amount Reduced:</span>
                      <span>-₹{previewCostReduced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className={styles.previewRow}>
                      <span>Remaining Balance Units:</span>
                      <span><strong>{Math.max(0, selectedInvestment.quantity - currentUnitsNum).toFixed(4)} units</strong></span>
                    </div>
                    <div className={styles.previewRowTotal}>
                      <span>Estimated Profit / Loss:</span>
                      <span className={isPreviewProfit ? styles.profitText : styles.lossText}>
                        {isPreviewProfit ? '+' : ''}₹{previewPnL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseSellModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmSellBtn}
                  disabled={isSubmittingSell || currentUnitsNum <= 0 || currentUnitsNum > selectedInvestment.quantity}
                >
                  {isSubmittingSell ? 'Processing...' : 'Confirm Sell'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;
