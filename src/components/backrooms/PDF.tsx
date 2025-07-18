import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { TOrder } from '@/db/orders';
import { COMPANY_EMAIL, COMPANY_NAME, COMPANY_PHONE } from '@/utils/constants';

const generateInvoice = (order: TOrder & { id: string }) => {
  // Standard receipt width (80mm) and initial height
  const receiptWidth = 80;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [receiptWidth, 297] // A4 length initially
  });
  
  doc.setFont("helvetica", "normal");
  
  const primaryColor = [41, 37, 96];
  const secondaryColor = [51, 51, 51];
  let currentY = 10; // Track vertical position
  
  // Center text helper
  const centerText = (text: string, y: number, fontSize: number) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    const x = (receiptWidth - textWidth) / 2;
    doc.text(text, x, y);
  };
  
  // Header section
  doc.setFont("helvetica", "bold");
  centerText(COMPANY_NAME, currentY, 16);
  currentY += 6;
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  centerText(COMPANY_EMAIL, currentY, 8);
  currentY += 4;
  centerText(COMPANY_PHONE, currentY, 8);
  currentY += 8;
  
  // Divider line
  doc.setLineWidth(0.1);
  doc.line(5, currentY, receiptWidth - 5, currentY);
  currentY += 8;
  
  // Order details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  centerText(`INVOICE #${order.id}`, currentY, 10);
  currentY += 6;
  
  const orderDate = new Date(order.createTimestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  centerText(orderDate, currentY, 8);
  currentY += 4;
  centerText(`Payment ID: ${order.paymentId}`, currentY, 8);
  currentY += 4;
  
  // Customer details
  doc.line(5, currentY, receiptWidth - 5, currentY);
  currentY += 6;
  
  doc.setFontSize(8);
  const deets = doc.splitTextToSize(
    `${order.deliveryDetails.name}, ${order.deliveryDetails.address}, ${order.deliveryDetails.city}, ${order.deliveryDetails.state} - ${order.deliveryDetails.postalCode}
Phone: ${order.deliveryDetails.phone}
Email: ${order.deliveryDetails.email}`, 64);
  doc.text(deets, 5, currentY);
  currentY += 20;
  
  // Items table
  doc.line(5, currentY, receiptWidth - 5, currentY);
  currentY += 5;
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text('ITEM', 5, currentY);
  doc.text('SIZE', 35, currentY);
  doc.text('QTY', 45, currentY);
  doc.text('PRICE', 55, currentY);
  doc.text('TOTAL', receiptWidth - 5, currentY, { align: 'right' });
  currentY += 4;
  
  doc.line(5, currentY, receiptWidth - 5, currentY);
  currentY += 5;
  
  // Items
  doc.setFont("helvetica", "normal");
  order.items.forEach(item => {
    const itemTotal = item.itemPrice * item.quantity;
    
    const nameLines = doc.splitTextToSize(item.itemName, 28);
    doc.text(nameLines, 5, currentY);
    
    doc.text(item.size, 35, currentY);
    doc.text(item.quantity.toString(), 45, currentY);
    doc.text(`${item.itemPrice.toLocaleString('en-IN')}`, 55, currentY);
    doc.text(`${itemTotal.toLocaleString('en-IN')}`, receiptWidth - 5, currentY, { align: 'right' });
    
    currentY += nameLines.length * 4 + 2;
  });
  
  currentY += 2;
  doc.line(5, currentY, receiptWidth - 5, currentY);
  currentY += 5;
  
  const subtotal = order.items.reduce((acc, item) => acc + (item.itemPrice * item.quantity), 0);
  const total = subtotal;
  
  doc.text('Subtotal:', 45, currentY);
  doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, receiptWidth - 5, currentY, { align: 'right' });
  currentY += 4;
  
  doc.line(45, currentY, receiptWidth - 5, currentY);
  currentY += 4;
  
  doc.setFont("helvetica", "bold");
  doc.text('TOTAL:', 45, currentY);
  doc.text(`Rs. ${total.toLocaleString('en-IN')}`, receiptWidth - 5, currentY, { align: 'right' });
  currentY += 8;
  
  // Footer
  doc.line(5, currentY, receiptWidth - 5, currentY);
  currentY += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  currentY += 4;
  centerText("thanks for shopping with us!", currentY, 8);
  
  // Save the PDF directly
  doc.save(`invoice-${order.id}.pdf`);
};

export default generateInvoice;