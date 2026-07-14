import { format } from "date-fns";

function fmt(n: number) {
  return `${n.toFixed(2)} EGP`;
}

/** Escape user-supplied strings before injecting into HTML (XSS prevention) */
function esc(text: string | null | undefined): string {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

interface Customization {
  slotLabel: string;
  optionLabel: string;
  baristaSortOrder?: number | null;
  customerSortOrder?: number | null;
  producedQty?: number | string | null;
  consumedQty?: number | string | null;
}

interface OrderItem {
  id: number;
  drinkName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialNotes?: string | null;
  status: "pending" | "ready" | "refunded" | "cancelled";
  customizations: Customization[];
}

interface CompletedOrder {
  id: number;
  orderNumber: string;
  baristaName: string;
  customerName?: string | null;
  subtotal: number;
  discount: number;
  discountCode?: string | null;
  discountValue?: number | null;
  discountType?: "percentage" | "fixed" | null;
  total: number;
  paymentMethod: string;
  amountTendered?: number | null;
  changeDue?: number | null;
  createdAt: string;
  payments?: { paymentMethod: string; amount: number }[];
  items: OrderItem[];
}

const BASE_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; background: #fff; padding: 8px 8px 8px 18px; width: 280px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .big { font-size: 15px; }
  .huge { font-size: 18px; font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; margin: 2px 0; }
  .row .label { flex: 1; }
  .row .value { text-align: right; white-space: nowrap; margin-left: 8px; }
  .indent { padding-left: 12px; color: #333; margin: 1px 0; }
  .note { padding-left: 12px; font-style: italic; color: #555; }
  .refunded { text-decoration: line-through; opacity: 0.6; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin: 4px 0 2px; }
  @media print { @page { margin: 0; size: 80mm auto; } }
`;

function openPrintWindow(html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) return;

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt</title><style>${BASE_STYLE}</style></head><body>${html}</body></html>`);
  doc.close();

  // Give it a moment to load and then print
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 100);
}

/**
 * Simple drinks-only receipt: one line per drink (name × qty = price).
 * No customization/recipe details — keeps the receipt short for multi-drink orders.
 */
export function printSimpleDrinksReceipt(order: CompletedOrder) {
  if (!order.items) return;
  const date = format(new Date(order.createdAt), "MMM d, yyyy  h:mm a");
  const payLabel = order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1);

  const activeItems = order.items.filter(i => i.status !== "refunded" && i.status !== "cancelled");
  const refundedItems = order.items.filter(i => i.status === "refunded" || i.status === "cancelled");

  const itemRows = [
    ...activeItems.map(item => {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : "";
      return `
        <div class="row bold">
          <span class="label">${esc(item.drinkName)}${qty}</span>
          <span class="value">${fmt(item.lineTotal)}</span>
        </div>
        ${item.specialNotes ? `<div class="note">  "${esc(item.specialNotes)}"</div>` : ""}
      `;
    }),
    ...refundedItems.map(item => {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : "";
      return `
        <div class="row refunded">
          <span class="label">${esc(item.drinkName)}${qty} [REFUNDED]</span>
          <span class="value">${fmt(item.lineTotal)}</span>
        </div>
      `;
    }),
  ].join('<div style="margin-bottom:3px"></div>');

  const VAT_RATE = 0.14;
  const beforeVat = order.subtotal / (1 + VAT_RATE);
  const vatAmount = order.subtotal - beforeVat;

  const change = order.changeDue != null && order.changeDue > 0
    ? `<div class="row"><span class="label">Change:</span><span class="value bold">${fmt(order.changeDue)}</span></div>` : "";
  const tendered = order.amountTendered != null
    ? `<div class="row"><span class="label">Tendered:</span><span class="value">${fmt(order.amountTendered)}</span></div>` : "";
  const discount = order.discount > 0
    ? `<div class="row"><span class="label">Discount${order.discountCode ? ` (${esc(order.discountCode)})` : ""}:</span><span class="value">-${fmt(order.discount)}</span></div>` : "";

  openPrintWindow(`
    <div class="center" style="margin-bottom:6px">
      <div class="huge" style="letter-spacing:3px">SPACCA</div>
      <div style="font-size:10px;color:#555;margin-top:2px">Café POS</div>
    </div>
    <div class="divider"></div>
    <div class="row"><span class="label">Order:</span><span class="value bold">#${esc(order.orderNumber)}</span></div>
    <div class="row"><span class="label">Date:</span><span class="value">${esc(date)}</span></div>
    <div class="row"><span class="label">Barista:</span><span class="value">${esc(order.baristaName)}</span></div>
    ${order.customerName ? `<div class="row"><span class="label">Customer:</span><span class="value">${esc(order.customerName)}</span></div>` : ""}
    <div class="divider"></div>
    <div class="section-title">Items</div>
    ${itemRows}
    <div class="divider"></div>
    <div class="row"><span class="label">Before Tax:</span><span class="value">${fmt(beforeVat)}</span></div>
    ${discount}
    <div class="row"><span class="label">After Discount:</span><span class="value">${fmt(beforeVat - order.discount)}</span></div>
    <div class="row"><span class="label">Tax Amount (14%):</span><span class="value">${fmt(vatAmount)}</span></div>
    <div class="divider"></div>
    <div class="row bold big"><span class="label">TOTAL:</span><span class="value">${fmt(order.total)}</span></div>
    <div class="divider"></div>
    ${order.payments && order.payments.length > 0
      ? `<div class="section-title">Payments</div>` + order.payments.map(p =>
          `<div class="row"><span class="label">${esc(p.paymentMethod.charAt(0).toUpperCase() + p.paymentMethod.slice(1))}:</span><span class="value">${fmt(p.amount)}</span></div>`
        ).join("")
      : `<div class="row"><span class="label">Payment:</span><span class="value">${esc(payLabel)}</span></div>`
    }
    ${tendered}
    ${change}
    <div class="divider"></div>
    <div class="center" style="margin-top:8px;font-size:11px;color:#555">Thank you for your visit!</div>
    <div class="center" style="font-size:10px;color:#777;margin-top:2px">Spacca</div>
    <div class="center" style="font-size:10px;color:#777;margin-top:2px">Coffee & People</div>
    <div style="height:24px"></div>
  `);
}

export function printCustomerReceipt(order: CompletedOrder) {
  if (!order.items) return;
  const date = format(new Date(order.createdAt), "MMM d, yyyy  h:mm a");
  const payLabel = order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1);

  const itemRows = order.items.map(item => {
    const isRefunded = item.status === "refunded" || item.status === "cancelled";
    const customs = (item.customizations ?? [])
      .filter(c => (c.customerSortOrder ?? 1) > 0 && c.optionLabel?.toLowerCase() !== "none")
      .sort((a, b) => (a.customerSortOrder ?? 1) - (b.customerSortOrder ?? 1))
      .map(c => {
        // Strip parenthesized or middot quantities to not show consumedQty/producedQty on customer receipt
        const cleanedLabel = c.optionLabel
          .replace(/\s*\(\d+(?:\.\d+)?\s*[a-zA-Z]*\)/gi, "")
          .replace(/\s*·\s*\d+(?:\.\d+)?\s*[a-zA-Z]*/gi, "")
          .trim();
        return `<div class="indent">· ${esc(c.slotLabel)}: ${esc(cleanedLabel)}</div>`;
      }).join("");
    const notes = item.specialNotes ? `<div class="note">  "${esc(item.specialNotes)}"</div>` : "";
    const qty = item.quantity > 1 ? ` x${item.quantity}` : "";
    
    return `
      <div class="row bold ${isRefunded ? 'refunded' : ''}">
        <span class="label">${esc(item.drinkName)}${qty} ${isRefunded ? '[REFUNDED]' : ''}</span>
        <span class="value">${fmt(item.lineTotal)}</span>
      </div>
      ${!isRefunded ? customs : ''}
      ${!isRefunded ? notes : ''}
    `;
  }).join('<div style="margin-bottom:4px"></div>');

  const VAT_RATE = 0.14;
  const beforeVat = order.subtotal / (1 + VAT_RATE);
  const vatAmount = order.subtotal - beforeVat;

  const change = order.changeDue != null && order.changeDue > 0
    ? `<div class="row"><span class="label">Change:</span><span class="value bold">${fmt(order.changeDue)}</span></div>` : "";

  const tendered = order.amountTendered != null
    ? `<div class="row"><span class="label">Tendered:</span><span class="value">${fmt(order.amountTendered)}</span></div>` : "";

  const discount = order.discount > 0
    ? `<div class="row"><span class="label">Discount${order.discountCode ? ` (${esc(order.discountCode)})` : ""}:</span><span class="value">-${fmt(order.discount)}</span></div>` : "";

  openPrintWindow(`
    <div class="center" style="margin-bottom:6px">
      <div class="huge" style="letter-spacing:3px">SPACCA</div>
      <div style="font-size:10px;color:#555;margin-top:2px">Café POS</div>
    </div>
    <div class="divider"></div>
    <div class="row"><span class="label">Order:</span><span class="value bold">#${esc(order.orderNumber)}</span></div>
    <div class="row"><span class="label">Date:</span><span class="value">${esc(date)}</span></div>
    <div class="row"><span class="label">Barista:</span><span class="value">${esc(order.baristaName)}</span></div>
    ${order.customerName ? `<div class="row"><span class="label">Customer:</span><span class="value">${esc(order.customerName)}</span></div>` : ""}
    <div class="divider"></div>
    <div class="section-title">Items</div>
    ${itemRows}
    <div class="divider"></div>
    <div class="row"><span class="label">Before Tax:</span><span class="value">${fmt(beforeVat)}</span></div>
    ${discount}
    <div class="row"><span class="label">After Discount:</span><span class="value">${fmt(beforeVat - order.discount)}</span></div>
    <div class="row"><span class="label">Tax Amount (14%):</span><span class="value">${fmt(vatAmount)}</span></div>
    <div class="divider"></div>
    <div class="row bold big"><span class="label">TOTAL:</span><span class="value">${fmt(order.total)}</span></div>
    <div class="divider"></div>
    ${order.payments && order.payments.length > 0 
      ? `<div class="section-title">Payments</div>` + order.payments.map(p => 
          `<div class="row"><span class="label">${esc(p.paymentMethod.charAt(0).toUpperCase() + p.paymentMethod.slice(1))}:</span><span class="value">${fmt(p.amount)}</span></div>`
        ).join("")
      : `<div class="row"><span class="label">Payment:</span><span class="value">${esc(payLabel)}</span></div>`
    }
    ${tendered}
    ${change}
    <div class="divider"></div>
    <div class="center" style="margin-top:8px;font-size:11px;color:#555">Thank you for your visit!</div>
    <div class="center" style="font-size:10px;color:#777;margin-top:2px">Spacca</div>
    <div class="center" style="font-size:10px;color:#777;margin-top:2px">Coffee & People</div>
    <div style="height:24px"></div>
  `);
}

export function printAgentReceipts(order: CompletedOrder) {
  if (!order.items) return;
  const activeItems = order.items.filter(i => i.status !== "refunded" && i.status !== "cancelled");
  const totalItems = activeItems.reduce((s, i) => s + i.quantity, 0);
  let ticketNum = 0;

  const pages = activeItems.flatMap(item => {
    const copies: string[] = [];
    for (let q = 0; q < item.quantity; q++) {
      ticketNum++;
      const filteredCustoms = (item.customizations ?? [])
        .filter(c => (c.baristaSortOrder ?? 1) > 0 && c.optionLabel?.toLowerCase() !== "none")
        .sort((a, b) => (a.baristaSortOrder ?? 1) - (b.baristaSortOrder ?? 1));

      const customs = filteredCustoms.length
        ? filteredCustoms.map(c => {
            // If optionLabel already embeds a quantity (e.g. "Sugar (5g)"), use it as-is.
            // Otherwise, prefer consumedQty (the stock/processed amount) over producedQty
            // so that dry ingredients show their actual measured quantity, not the ml in cup.
            const producedQty = c.producedQty && Number(c.producedQty) > 0 ? Number(c.producedQty) : 0;
            const consumedQty = c.consumedQty && Number(c.consumedQty) > 0 ? Number(c.consumedQty) : 0;
            // Format a number to its exact value, trimming unnecessary trailing zeros
            // e.g. 9.0 → "9", 18.5 → "18.5", 150.0 → "150"
            const fmtQty = (n: number) => String(parseFloat(n.toFixed(3)));
            let qtyStr = "";
            if (!c.optionLabel.includes("(")) {
              if (producedQty > 0) {
                // When consumedQty differs significantly from producedQty (e.g. 9g beans → 18ml espresso),
                // show consumedQty (stock unit) without a unit label since we don't store it.
                // When they are similar (liquid, e.g. milk), show producedQty with ml.
                if (consumedQty > 0 && Math.abs(consumedQty - producedQty) > producedQty * 0.1) {
                  qtyStr = ` (${fmtQty(consumedQty)})`;
                } else {
                  const qtyFmt = fmtQty(producedQty);
                  const alreadyHasQty = c.optionLabel.includes(`(${qtyFmt}ml)`);
                  if (!alreadyHasQty) {
                    qtyStr = ` (${qtyFmt}ml)`;
                  }
                }
              }
            }
            return `<div class="row"><span class="label" style="color:#555">${esc(c.slotLabel)}</span><span class="value bold">${esc(c.optionLabel)}${esc(qtyStr)}</span></div>`;
          }).join("")
        : `<div class="indent" style="color:#aaa">No customizations</div>`;
      const notes = item.specialNotes ? `
        <div class="divider"></div>
        <div class="section-title">Special Notes</div>
        <div style="font-style:italic;padding:2px 0">"${esc(item.specialNotes)}"</div>
      ` : "";
      copies.push(`
        <div class="center bold" style="font-size:10px;letter-spacing:2px;margin-bottom:4px">SPACCA</div>
        <div class="divider"></div>
        <div class="row">
          <span class="label" style="font-size:10px;color:#555">#${esc(order.orderNumber)}</span>
          <span class="value bold" style="font-size:10px">Ticket ${ticketNum}/${totalItems}</span>
        </div>
        ${order.customerName ? `<div class="center" style="font-size:10px;color:#555">Customer: ${esc(order.customerName)}</div>` : ""}
        <div class="divider"></div>
        <div class="center huge" style="margin:6px 0;letter-spacing:1px">${esc(item.drinkName.toUpperCase())}</div>
        <div class="divider"></div>
        <div class="section-title">Customizations</div>
        ${customs}
        ${notes}
        <div class="divider"></div>
        <div class="row" style="font-size:10px;color:#777"><span class="label">Barista: ${esc(order.baristaName)}</span><span class="value">${fmt(item.unitPrice)}</span></div>
        <div style="height:16px"></div>
        <div style="page-break-after:always"></div>
      `);
    }
    return copies;
  });

  openPrintWindow(pages.join(""));
}
