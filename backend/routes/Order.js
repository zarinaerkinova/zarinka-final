import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '../middleware/auth.js'
import onlyBakers from '../middleware/onlyBakers.js'
import Notification from '../models/Notification.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

const router = express.Router()

// Create a standard order
router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryInfo, deliveryMethod, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const ordersByBaker = new Map();

    for (const item of items) {
      if (item.product) {
        const productData = await Product.findById(item.product);
        if (!productData) {
          return res.status(404).json({ message: `Product with id ${item.product} not found` });
        }

        const bakerId = productData.createdBy.toString();
        if (!ordersByBaker.has(bakerId)) {
          ordersByBaker.set(bakerId, {
            items: [],
            totalPrice: 0,
          });
        }

        const bakerOrder = ordersByBaker.get(bakerId);

        const orderItem = {
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          customizedIngredients: item.customizedIngredients,
          price: item.price,
        };

        bakerOrder.items.push(orderItem);
        bakerOrder.totalPrice += item.price * item.quantity;
      }
      // NOTE: Custom cakes without a product/baker are not handled here.
      // You might want to assign them to a default baker or handle them differently.
    }

    const createdOrders = [];

    for (const [bakerId, orderData] of ordersByBaker.entries()) {
      const bakerUser = await User.findById(bakerId);
      const autoAccept = bakerUser?.orderSettings?.autoAccept || false;

      const orderPayload = {
        user: req.user.id,
        baker: bakerId,
        items: orderData.items,
        totalPrice: orderData.totalPrice,
        deliveryMethod: deliveryMethod || 'delivery',
        paymentMethod: paymentMethod || 'cash',
        orderNumber: uuidv4(),
        status: autoAccept ? 'accepted' : 'pending',
      };

      if (deliveryMethod === 'delivery') {
        orderPayload.deliveryInfo = deliveryInfo;
      } else {
        orderPayload.deliveryInfo = {
          name: deliveryInfo.name,
          phone: deliveryInfo.phone
        };
      }

      const order = await Order.create(orderPayload);
      createdOrders.push(order);

      // Notify the user about their order
      await Notification.create({
        userId: req.user.id,
        message: `Ваш заказ #${order.orderNumber} успешно оформлен!`,
        type: 'order_placed',
        orderId: order._id,
      });

      // Notify the baker about a new order
      await Notification.create({
        userId: bakerId,
        message: `У вас новый заказ #${order.orderNumber} от ${req.user.name || 'клиента'}!`,
        type: 'order_placed',
        orderId: order._id,
      });
    }

    res.status(201).json(createdOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Create a custom order
router.post('/custom', auth, async (req, res) => {
  try {
    const { details, deliveryInfo, deliveryMethod, paymentMethod } = req.body;

    if (!details || !deliveryInfo) {
      return res.status(400).json({ message: 'Incomplete custom order data' });
    }

    // Find a baker to assign the custom order to
    const baker = await User.findOne({ role: 'baker' });
    if (!baker) {
      return res.status(500).json({ message: 'No bakers available to handle custom orders.' });
    }

    const order = await Order.create({
      orderType: 'custom',
      user: req.user.id,
      items: [
        {
          isCustomized: true,
          name: details.name || 'Custom Cake',
          description: details.description,
          price: details.price,
          quantity: 1,
          customizedIngredients: details.ingredients,
        },
      ],
      totalPrice: details.price,
      deliveryInfo,
      deliveryMethod: deliveryMethod || 'delivery',
      paymentMethod: paymentMethod || 'cash',
      orderNumber: uuidv4(),
      baker: baker._id,
    });

    await Notification.create({
      userId: req.user.id,
      message: `Ваш индивидуальный заказ #${order.orderNumber} успешно оформлен!`,
      type: 'order_placed',
      orderId: order._id,
    });

    await Notification.create({
      userId: baker._id,
      message: `У вас новый индивидуальный заказ #${order.orderNumber} от ${req.user.name}!`,
      type: 'order_placed',
      orderId: order._id,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get user's own orders (all orders including pending)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all orders for an admin/baker
router.get('/baker-orders', auth, onlyBakers, async (req, res) => {
  try {
    console.log('🔍 Fetching all orders for baker ID:', req.user.id)
    const orders = await Order.find({ baker: req.user.id })
      .populate('items.product')
      .populate('user', 'name email phone')
      .lean();

    console.log(
      '📦 Raw orders found:',
      orders.length,
      'for baker:',
      req.user.id
    );

    const validOrders = orders.filter(order => {
      if (!order.user || !order.items) return false
      return order.items.every(
        item => item.product || (item.name && typeof item.price === 'number')
      )
    });

    console.log('✅ Valid orders after filtering:', validOrders.length)
    res.json(validOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get new orders for a baker
router.get('/baker/new', auth, onlyBakers, async (req, res) => {
  try {
    console.log('🔍 Fetching new orders for baker ID:', req.user.id)
    const orders = await Order.find({ baker: req.user.id, status: 'pending' })
      .populate('items.product')
      .populate('user', 'name email phone')
      .lean();
    console.log('📦 Found orders:', orders.length, 'for baker:', req.user.id);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get completed orders for a baker
router.get('/baker/completed', auth, onlyBakers, async (req, res) => {
  try {
    const orders = await Order.find({
      baker: req.user.id,
      status: { $in: ['delivered'] },
    })
      .populate('items.product')
      .populate('user', 'name email phone')
      .lean();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.put('/:orderId/status', auth, onlyBakers, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      'user',
      'name email phone'
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.baker.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. You are not authorized to update this order.',
      });
    }

    order.status = status;
    await order.save();

    if (order.user) {
      let notificationMessage = '';
      let notificationType = '';

      if (status === 'accepted') {
        notificationMessage = `Ваш заказ #${order.orderNumber} принят! Мы свяжемся с вами для подтверждения деталей.`;
        notificationType = 'order_accepted';
      } else if (status === 'preparing') {
        notificationMessage = `Ваш заказ #${order.orderNumber} готовится! Мы уже начали работу над ним.`;
        notificationType = 'order_preparing';
      } else if (status === 'delivered') {
        notificationMessage = `Ваш заказ #${order.orderNumber} выполнен и готов к выдаче/доставке!`;
        notificationType = 'order_completed';
      } else if (status === 'shipped') {
        notificationMessage = `Ваш заказ #${order.orderNumber} отправлен! Ожидайте доставку.`;
        notificationType = 'order_shipped';
      }

      if (notificationMessage && notificationType) {
        await Notification.create({
          userId: order.user._id,
          message: notificationMessage,
          type: notificationType,
          orderId: order._id,
        });
      }
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get order by ID
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product')
      .populate('user', 'name email')
      .populate('baker', 'name bakeryName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const orderUserId = order.user?._id
      ? order.user._id.toString()
      : order.user.toString();
    const orderBakerId = order.baker?._id
      ? order.baker._id.toString()
      : order.baker.toString();
    if (orderUserId !== req.user.id && orderBakerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete user's own order (only for customers)
router.delete('/user/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find the order and check if it belongs to the current user
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the current user
    if (order.customer.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own orders.' });
    }

    // Check if order can be deleted (optional: only allow deletion of certain statuses)
    // if (order.status === 'shipped' || order.status === 'delivered') {
    //   return res.status(400).json({ message: 'Cannot delete orders that are shipped or delivered' });
    // }

    await Order.findByIdAndDelete(orderId);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete an order (only for bakers)
router.delete('/:orderId', auth, onlyBakers, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
