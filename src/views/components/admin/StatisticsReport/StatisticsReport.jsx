import { useEffect, useState } from 'react';
import { getStatisticsApi } from '../../../../services/statisticsService';
import styles from './StatisticsReport.module.css';

export default function StatisticsReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await getStatisticsApi();
        setData(stats);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu thống kê');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xử lý',
      paid: 'Đã thanh toán',
      shipped: 'Đang giao hàng',
      delivered: 'Đã giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: styles.statusPending,
      paid: styles.statusPaid,
      shipped: styles.statusShipped,
      delivered: styles.statusDelivered,
      completed: styles.statusCompleted,
      cancelled: styles.statusCancelled
    };
    return classes[status] || '';
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu thống kê...</div>;
  }

  if (error) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  if (!data) {
    return <div className={styles.empty}>Không có dữ liệu</div>;
  }

  const { overview, ordersByStatus, topProducts, revenueByMonth, recentOrders } = data;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Báo cáo thống kê</h1>
      </div>

      {/* Overview Cards */}
      <div className={styles.overviewGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tổng đơn hàng</div>
            <div className={styles.statValue}>{overview.totalOrders}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tổng doanh thu</div>
            <div className={styles.statValue}>{formatCurrency(overview.totalRevenue)}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Doanh thu tháng này</div>
            <div className={styles.statValue}>{formatCurrency(overview.monthRevenue)}</div>
            <div className={styles.statGrowth}>
              {overview.revenueGrowth > 0 ? '↑' : overview.revenueGrowth < 0 ? '↓' : '→'} 
              {Math.abs(overview.revenueGrowth)}%
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tổng người dùng</div>
            <div className={styles.statValue}>{overview.totalUsers}</div>
            <div className={styles.statSubtext}>+{overview.newUsersThisMonth} tháng này</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛍️</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tổng sản phẩm</div>
            <div className={styles.statValue}>{overview.totalProducts}</div>
            <div className={styles.statSubtext}>{overview.activeProducts} đang hoạt động</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Đánh giá trung bình</div>
            <div className={styles.statValue}>
              {overview.averageRating ? overview.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className={styles.statSubtext}>{overview.totalReviews} đánh giá</div>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Đơn hàng theo trạng thái */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Đơn hàng theo trạng thái</h2>
          <div className={styles.statusGrid}>
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className={styles.statusCard}>
                <div className={`${styles.statusBadge} ${getStatusClass(status)}`}>
                  {getStatusLabel(status)}
                </div>
                <div className={styles.statusCount}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top sản phẩm bán chạy */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Top sản phẩm bán chạy</h2>
          <div className={styles.topProductsList}>
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productRank}>#{index + 1}</div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productStats}>
                      Đã bán: {product.totalSold} | 
                      Doanh thu: {formatCurrency(product.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Doanh thu theo tháng */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Doanh thu theo tháng (12 tháng gần nhất)</h2>
        <div className={styles.revenueTable}>
          <table>
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Số đơn</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {revenueByMonth && revenueByMonth.length > 0 ? (
                revenueByMonth.map((item, index) => (
                  <tr key={index}>
                    <td>{item.month}</td>
                    <td>{item.orders}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.empty}>Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Đơn hàng gần đây */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Đơn hàng gần đây</h2>
        <div className={styles.recentOrdersTable}>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>
                      {order.user?.fullName || order.user?.username || 'N/A'}
                      <br />
                      <span className={styles.userEmail}>
                        {order.user?.email || ''}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.empty}>Chưa có đơn hàng gần đây</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

