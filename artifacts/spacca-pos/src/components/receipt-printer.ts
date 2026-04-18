import { format } from "date-fns";

const CURRENCY = "E\u00a3";

function fmt(n: number) {
  return `${CURRENCY}${n.toFixed(2)}`;
}

interface Customization {
  slotLabel: string;
  optionLabel: string;
}

interface OrderItem {
  id: number;
  drinkName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialNotes?: string | null;
  customizations: Customization[];
}

interface CompletedOrder {
  id: number;
  orderNumber: string;
  baristaName: string;
  customerName?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountTendered?: number | null;
  changeDue?: number | null;
  createdAt: string;
  items: OrderItem[];
}

const BASE_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; background: #fff; padding: 8px; width: 280px; }
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
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin: 4px 0 2px; }
  @media print { @page { margin: 0; size: 80mm auto; } }
`;

function openPrintWindow(html: string) {
  const win = window.open("", "_blank", "width=400,height=600,toolbar=0,menubar=0,location=0");
  if (!win) { alert("Please allow pop-ups for printing"); return; }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt</title><style>${BASE_STYLE}</style></head><body>${html}</body></html>`);
  win.document.close();
  win.onload = () => { win.print(); win.onafterprint = () => win.close(); };
}

export function printCustomerReceipt(order: CompletedOrder) {
  const date = format(new Date(order.createdAt), "MMM d, yyyy  h:mm a");
  const payLabel = order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1);

  const itemRows = order.items.map(item => {
    const customs = item.customizations.map(c =>
      `<div class="indent">· ${c.slotLabel}: ${c.optionLabel}</div>`
    ).join("");
    const notes = item.specialNotes ? `<div class="note">  "${item.specialNotes}"</div>` : "";
    const qty = item.quantity > 1 ? ` x${item.quantity}` : "";
    return `
      <div class="row bold"><span class="label">${item.drinkName}${qty}</span><span class="value">${fmt(item.lineTotal)}</span></div>
      ${customs}
      ${notes}
    `;
  }).join('<div style="margin-bottom:4px"></div>');

  const change = order.changeDue != null && order.changeDue > 0
    ? `<div class="row"><span class="label">Change:</span><span class="value bold">${fmt(order.changeDue)}</span></div>` : "";

  const tendered = order.amountTendered != null
    ? `<div class="row"><span class="label">Tendered:</span><span class="value">${fmt(order.amountTendered)}</span></div>` : "";

  const discount = order.discount > 0
    ? `<div class="row"><span class="label">Discount:</span><span class="value">-${fmt(order.discount)}</span></div>` : "";

  openPrintWindow(`
    <div class="center" style="margin-bottom:6px">
      <div class="huge" style="letter-spacing:3px">SPACCA</div>
      <div style="font-size:10px;color:#555;margin-top:2px">Café POS</div>
    </div>
    <div class="divider"></div>
    <div class="row"><span class="label">Order:</span><span class="value bold">#${order.orderNumber}</span></div>
    <div class="row"><span class="label">Date:</span><span class="value">${date}</span></div>
    <div class="row"><span class="label">Barista:</span><span class="value">${order.baristaName}</span></div>
    ${order.customerName ? `<div class="row"><span class="label">Customer:</span><span class="value">${order.customerName}</span></div>` : ""}
    <div class="divider"></div>
    <div class="section-title">Items</div>
    ${itemRows}
    <div class="divider"></div>
    ${discount}
    <div class="row bold big"><span class="label">TOTAL:</span><span class="value">${fmt(order.total)}</span></div>
    <div class="row"><span class="label">Payment:</span><span class="value">${payLabel}</span></div>
    ${tendered}
    ${change}
    <div class="divider"></div>
    <div class="center" style="margin-top:8px;font-size:11px;color:#555">Thank you for your visit!</div>
    <div class="center" style="font-size:10px;color:#777;margin-top:2px">spacca.coffee</div>
    <div style="height:24px"></div>
  `);
}

export function printAgentReceipts(order: CompletedOrder) {
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  let ticketNum = 0;

  const pages = order.items.flatMap(item => {
    const copies: string[] = [];
    for (let q = 0; q < item.quantity; q++) {
      ticketNum++;
      const customs = item.customizations.length
        ? item.customizations.map(c =>
            `<div class="row"><span class="label" style="color:#555">${c.slotLabel}</span><span class="value bold">${c.optionLabel}</span></div>`
          ).join("")
        : `<div class="indent" style="color:#aaa">No customizations</div>`;
      const notes = item.specialNotes ? `
        <div class="divider"></div>
        <div class="section-title">Special Notes</div>
        <div style="font-style:italic;padding:2px 0">"${item.specialNotes}"</div>
      ` : "";
      copies.push(`
        <div class="center bold" style="font-size:10px;letter-spacing:2px;margin-bottom:4px">SPACCA</div>
        <div class="divider"></div>
        <div class="row">
          <span class="label" style="font-size:10px;color:#555">#${order.orderNumber}</span>
          <span class="value bold" style="font-size:10px">Ticket ${ticketNum}/${totalItems}</span>
        </div>
        ${order.customerName ? `<div class="center" style="font-size:10px;color:#555">Customer: ${order.customerName}</div>` : ""}
        <div class="divider"></div>
        <div class="center huge" style="margin:6px 0;letter-spacing:1px">${item.drinkName.toUpperCase()}</div>
        <div class="divider"></div>
        <div class="section-title">Customizations</div>
        ${customs}
        ${notes}
        <div class="divider"></div>
        <div class="row" style="font-size:10px;color:#777"><span class="label">Barista: ${order.baristaName}</span><span class="value">${fmt(item.unitPrice)}</span></div>
        <div style="height:16px"></div>
        <div style="page-break-after:always"></div>
      `);
    }
    return copies;
  });

  openPrintWindow(pages.join(""));
}
