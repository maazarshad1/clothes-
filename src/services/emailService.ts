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

  const itemList = order.items
    .map((item) => `${item.quantity}x ${item.name}${item.size ? ` (Size: ${item.size})` : ''} - $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const templateParams = {
    to_name: order.customerName,
    to_email: order.email,
    order_id: order.id,
    order_date: order.date,
    items: itemList,
    total_amount: `$${order.total.toFixed(2)}`,
    shipping_address: `${order.address}, ${order.city}, ${order.postalCode}`,
    tracking_link: `${window.location.origin}/track-order?orderId=${order.id}`,
    admin_email: 'maazq12345678@gmail.com', // Notifying admin as well if template supports it
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
