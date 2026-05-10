import emailjs from '@emailjs/browser';
import { Order } from '../context/StoreContext';

// Note: These should be set in your Environment Variables in Settings
// VITE_EMAILJS_SERVICE_ID
// VITE_EMAILJS_TEMPLATE_ID
// VITE_EMAILJS_PUBLIC_KEY

export const sendOrderConfirmationEmail = async (order: Order) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS environment variables are not set. Email could not be sent.');
    return;
  }

  // Calculate subtotal to derive shipping (mirroring logic in Checkout.tsx)
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = 0; // App currently doesn't track tax separated

  // Map items to match the loop in the EmailJS template screenshot
  const orders = order.items.map(item => ({
    name: item.name + (item.size ? ` (${item.size})` : ''),
    units: item.quantity,
    price: item.price.toFixed(2),
  }));

  const templateParams = {
    order_id: order.id,
    orders: orders, // For the {{#orders}} ... {{/orders}} block
    cost: {
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: order.total.toFixed(2),
    },
    // Recipient email aliases to ensure EmailJS finds the right variable
    email: order.email,
    to_email: order.email,
    customer_email: order.email,
    
    // Customer info
    to_name: order.customerName,
    customer_name: order.customerName,
    
    // Links and notifications
    tracking_link: `${window.location.origin}/track-order?orderId=${order.id}`,
    admin_notification: `New order from ${order.customerName} (${order.email})`,
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Email sent successfully!', response.status, response.text);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};
