type OrderItem = {
  name: string;
  size: string;
  quantity: number;
  price: number;
};

type OrderConfirmationEmailProps = {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  total: number;
};

export function orderConfirmationEmail({
  customerName,
  orderId,
  items,
  total,
}: OrderConfirmationEmailProps) {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.name}<br/>
            <span style="color:#666;">Size: ${item.size}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:right;">
            ₹${item.price * item.quantity}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #111;">
      <h1 style="letter-spacing: 6px; text-align: center;">QUN</h1>

      <h2>Your order is confirmed 🎉</h2>

      <p>Hi ${customerName},</p>

      <p>Thank you for shopping with QUN. We've received your order.</p>

      <p><strong>Order ID:</strong> ${orderId}</p>

      <table style="width:100%; border-collapse: collapse; margin-top: 24px;">
        <thead>
          <tr>
            <th style="text-align:left; padding: 12px; border-bottom: 2px solid #111;">Item</th>
            <th style="text-align:center; padding: 12px; border-bottom: 2px solid #111;">Qty</th>
            <th style="text-align:right; padding: 12px; border-bottom: 2px solid #111;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h3 style="text-align:right; margin-top: 24px;">Total: ₹${total}</h3>

      <p style="margin-top: 32px;">
        We'll notify you again once your order has been shipped.
      </p>

      <p>Thanks for choosing QUN.</p>

      <p><strong>Team QUN</strong></p>
    </div>
  `;
}