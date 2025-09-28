import React, { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '../../store/Order';
import { useUserStore } from '../../store/User';
import AllOrdersOrderCard from './AllOrdersOrderCard';
import './AllOrders.scss';

const AllOrders = () => {
  const { allBakerOrders, newOrders, completedOrders, fetchBakerOrders } = useOrderStore();
  const { token } = useUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedCakeId, setExpandedCakeId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // New state for status filter
  const [filterDate, setFilterDate] = useState(''); // New state for date filter

  useEffect(() => {
    if (token) {
      fetchBakerOrders(token);
    }
  }, [token, fetchBakerOrders]);

  const allOrdersCombined = useMemo(() => {
    // Ensure unique orders if there's overlap, though ideally new, completed, allBakerOrders are distinct buckets
    const combined = [...newOrders, ...completedOrders, ...allBakerOrders];
    const uniqueOrderIds = new Set();
    const uniqueOrders = combined.filter(order => {
      if (uniqueOrderIds.has(order._id)) {
        return false;
      }
      uniqueOrderIds.add(order._id);
      return true;
    });
    // Sort by createdAt date, newest first
    return uniqueOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [newOrders, completedOrders, allBakerOrders]);

  const totalOrders = allOrdersCombined.length;
  const pendingOrdersCount = newOrders.length;
  const inProgressOrdersCount = allBakerOrders.length; // allBakerOrders are already filtered for in-progress
  const totalRevenue = allOrdersCombined.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  const filteredOrders = useMemo(() => {
    let orders = allOrdersCombined;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      orders = orders.filter(
        (order) =>
          order._id.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.customerName?.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.user?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.deliveryInfo?.phone?.includes(lowerCaseSearchTerm)
      );
    }

    if (filterStatus !== 'all') {
      orders = orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (filterDate) {
      const searchDate = new Date(filterDate).toDateString();
      orders = orders.filter(order => new Date(order.createdAt).toDateString() === searchDate);
    }

    return orders;
  }, [allOrdersCombined, searchTerm, filterStatus, filterDate]);

  const handleToggleExpandOrder = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    setExpandedCakeId(null); // Collapse any expanded cake when order collapses/expands
  };

  const handleToggleExpandCake = (cakeId) => {
    setExpandedCakeId(expandedCakeId === cakeId ? null : cakeId);
  };

  return (
    <div className="all-orders-page">
      <h1 className="page-title">All Orders</h1>
      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p>{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h4>Pending</h4>
          <p>{pendingOrdersCount}</p>
        </div>
        <div className="stat-card">
          <h4>In Progress</h4>
          <p>{inProgressOrdersCount}</p>
        </div>
        <div className="stat-card">
          <h4>Total Revenue</h4>
          <p>${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by ID, customer, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="filter-date"
        />
      </div>

      <div className="orders-list-container">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <AllOrdersOrderCard
              key={order._id}
              order={order}
              isExpanded={expandedOrderId === order._id}
              onToggleExpandOrder={handleToggleExpandOrder}
              expandedCakeId={expandedCakeId}
              onToggleExpandCake={handleToggleExpandCake}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;