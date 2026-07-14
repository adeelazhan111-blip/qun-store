import QRCode from "qrcode";
import bwipjs from "bwip-js";
import { NextResponse } from "next/server";
import {
  PDFDocument,
  PDFImage,
  PDFPage,
  PDFFont,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderItem = {
  id?: string;
  name?: string;
  product_name?: string;
  size?: string;
  quantity?: number;
  price?: number | string;
};

type InvoiceFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

type InvoiceColors = {
  black: ReturnType<typeof rgb>;
  darkGrey: ReturnType<typeof rgb>;
  mediumGrey: ReturnType<typeof rgb>;
  lightGrey: ReturnType<typeof rgb>;
  borderGrey: ReturnType<typeof rgb>;
  white: ReturnType<typeof rgb>;
};

type InvoiceOrder = Record<string, any>;

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 50;
const RIGHT = PAGE_WIDTH - 50;

function money(value: number | string | null | undefined) {
  const amount = Number(value || 0);

  return `INR ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function cleanText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function titleCase(value: unknown) {
  const text = cleanText(value);

  if (!text) return "N/A";

  return text
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function shorten(value: string, maximumLength: number) {
  if (value.length <= maximumLength) return value;

  return `${value.slice(0, maximumLength - 3)}...`;
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maximumWidth: number
) {
  const words = cleanText(text).split(/\s+/);
  const lines: string[] = [];

  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (font.widthOfTextAtSize(testLine, fontSize) <= maximumWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

function drawWrappedText({
  page,
  text,
  x,
  y,
  maximumWidth,
  font,
  size,
  lineHeight,
  color,
  maximumLines,
}: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  maximumWidth: number;
  font: PDFFont;
  size: number;
  lineHeight: number;
  color: ReturnType<typeof rgb>;
  maximumLines?: number;
}) {
  let lines = wrapText(text, font, size, maximumWidth);

  if (maximumLines && lines.length > maximumLines) {
    lines = lines.slice(0, maximumLines);

    const finalIndex = lines.length - 1;
    lines[finalIndex] = shorten(lines[finalIndex], 55);
  }

  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - index * lineHeight,
      size,
      font,
      color,
    });
  });

  return y - lines.length * lineHeight;
}

function createColors(): InvoiceColors {
  return {
    black: rgb(0.045, 0.045, 0.045),
    darkGrey: rgb(0.25, 0.25, 0.25),
    mediumGrey: rgb(0.45, 0.45, 0.45),
    lightGrey: rgb(0.94, 0.94, 0.94),
    borderGrey: rgb(0.84, 0.84, 0.84),
    white: rgb(1, 1, 1),
  };
}

async function createVerificationImages(
  pdf: PDFDocument,
  orderId: string
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const orderUrl = `${baseUrl}/account/orders/${orderId}`;

  const qrDataUrl = await QRCode.toDataURL(orderUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 300,
  });

  const qrBase64 = qrDataUrl.replace(
    /^data:image\/png;base64,/,
    ""
  );

  const qrBytes = Buffer.from(qrBase64, "base64");
  const qrImage = await pdf.embedPng(qrBytes);

  const barcodeBuffer = await bwipjs.toBuffer({
    bcid: "code128",
    text: orderId,
    scale: 2,
    height: 10,
    includetext: false,
    backgroundcolor: "FFFFFF",
  });

  const barcodeImage = await pdf.embedPng(barcodeBuffer);

  return {
    qrImage,
    barcodeImage,
  };
}

function drawHeader({
  page,
  fonts,
  colors,
  invoiceNumber,
  invoiceDate,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  invoiceNumber: string;
  invoiceDate: string;
}) {
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 135,
    width: PAGE_WIDTH,
    height: 135,
    color: colors.black,
  });

  page.drawText("QUN", {
    x: LEFT,
    y: PAGE_HEIGHT - 72,
    size: 31,
    font: fonts.bold,
    color: colors.white,
  });

  page.drawText("PREMIUM STREETWEAR", {
    x: LEFT,
    y: PAGE_HEIGHT - 96,
    size: 9,
    font: fonts.regular,
    color: rgb(0.72, 0.72, 0.72),
  });

  const invoiceTitle = "TAX INVOICE";
  const titleWidth = fonts.bold.widthOfTextAtSize(invoiceTitle, 20);

  page.drawText(invoiceTitle, {
    x: RIGHT - titleWidth,
    y: PAGE_HEIGHT - 68,
    size: 20,
    font: fonts.bold,
    color: colors.white,
  });

  const invoiceLine = `Invoice: ${invoiceNumber}`;
  const invoiceLineWidth = fonts.regular.widthOfTextAtSize(
    invoiceLine,
    10
  );

  page.drawText(invoiceLine, {
    x: RIGHT - invoiceLineWidth,
    y: PAGE_HEIGHT - 94,
    size: 10,
    font: fonts.regular,
    color: colors.white,
  });

  const dateLine = `Date: ${invoiceDate}`;
  const dateLineWidth = fonts.regular.widthOfTextAtSize(
    dateLine,
    10
  );

  page.drawText(dateLine, {
    x: RIGHT - dateLineWidth,
    y: PAGE_HEIGHT - 112,
    size: 10,
    font: fonts.regular,
    color: colors.white,
  });
}

function drawCustomerDetails({
  page,
  fonts,
  colors,
  order,
  orderId,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  order: InvoiceOrder;
  orderId: string;
}) {
  const detailsTop = PAGE_HEIGHT - 176;
  const leftColumnWidth = 285;
  const rightColumnX = 365;

  page.drawText("BILLED TO", {
    x: LEFT,
    y: detailsTop,
    size: 10,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText("ORDER DETAILS", {
    x: rightColumnX,
    y: detailsTop,
    size: 10,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  let customerY = detailsTop - 29;

  page.drawText(cleanText(order.customer_name, "Customer"), {
    x: LEFT,
    y: customerY,
    size: 14,
    font: fonts.bold,
    color: colors.black,
  });

  customerY -= 23;

  const address = [
    cleanText(order.address),
    cleanText(order.city),
    cleanText(order.state),
    cleanText(order.pincode),
  ]
    .filter(Boolean)
    .join(", ");

  customerY = drawWrappedText({
    page,
    text: address || "Address not available",
    x: LEFT,
    y: customerY,
    maximumWidth: leftColumnWidth,
    font: fonts.regular,
    size: 9.5,
    lineHeight: 14,
    color: colors.darkGrey,
    maximumLines: 3,
  });

  customerY -= 3;

  page.drawText(`Phone: ${cleanText(order.phone, "N/A")}`, {
    x: LEFT,
    y: customerY,
    size: 9.5,
    font: fonts.regular,
    color: colors.darkGrey,
  });

  customerY -= 16;

  page.drawText(
    shorten(`Email: ${cleanText(order.email, "N/A")}`, 52),
    {
      x: LEFT,
      y: customerY,
      size: 9.5,
      font: fonts.regular,
      color: colors.darkGrey,
    }
  );

  const detailRows = [
    ["Order ID", orderId.slice(0, 13).toUpperCase()],
    ["Payment", titleCase(order.payment_method)],
    ["Payment Status", titleCase(order.payment_status)],
    ["Order Status", titleCase(order.order_status)],
  ];

  let orderY = detailsTop - 30;

  for (const [label, value] of detailRows) {
    page.drawText(`${label}:`, {
      x: rightColumnX,
      y: orderY,
      size: 9.5,
      font: fonts.bold,
      color: colors.darkGrey,
    });

    page.drawText(shorten(value, 22), {
      x: rightColumnX + 88,
      y: orderY,
      size: 9.5,
      font: fonts.regular,
      color: colors.black,
    });

    orderY -= 19;
  }
}

function drawProductTable({
  page,
  fonts,
  colors,
  items,
  order,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  items: OrderItem[];
  order: InvoiceOrder;
}) {
  const tableTop = PAGE_HEIGHT - 330;
  const tableWidth = RIGHT - LEFT;
  const headerHeight = 34;
  const rowHeight = 38;

  page.drawRectangle({
    x: LEFT,
    y: tableTop,
    width: tableWidth,
    height: headerHeight,
    color: colors.black,
  });

  const columns = {
    item: LEFT + 14,
    size: LEFT + 275,
    quantity: LEFT + 330,
    price: LEFT + 382,
    total: LEFT + 446,
  };

  const headings = [
    ["ITEM", columns.item],
    ["SIZE", columns.size],
    ["QTY", columns.quantity],
    ["PRICE", columns.price],
    ["TOTAL", columns.total],
  ] as const;

  headings.forEach(([label, x]) => {
    page.drawText(label, {
      x,
      y: tableTop + 12,
      size: 9,
      font: fonts.bold,
      color: colors.white,
    });
  });

  const displayedItems: OrderItem[] =
    items.length > 0
      ? items.slice(0, 7)
      : [
          {
            name: "Order item",
            size: "-",
            quantity: 1,
            price: Number(order.total || 0),
          },
        ];

  let rowTop = tableTop;

  displayedItems.forEach((item, index) => {
    rowTop -= rowHeight;

    page.drawRectangle({
      x: LEFT,
      y: rowTop,
      width: tableWidth,
      height: rowHeight,
      color: index % 2 === 0 ? colors.lightGrey : colors.white,
      borderColor: colors.borderGrey,
      borderWidth: 0.4,
    });

    const productName = cleanText(
      item.name || item.product_name,
      "Product"
    );

    const quantity = Math.max(1, Number(item.quantity || 1));
    const price = Number(item.price || 0);
    const lineTotal = price * quantity;

    page.drawText(shorten(productName, 39), {
      x: columns.item,
      y: rowTop + 14,
      size: 9,
      font: fonts.regular,
      color: colors.black,
    });

    page.drawText(cleanText(item.size, "-"), {
      x: columns.size + 6,
      y: rowTop + 14,
      size: 9,
      font: fonts.regular,
      color: colors.black,
    });

    page.drawText(String(quantity), {
      x: columns.quantity + 8,
      y: rowTop + 14,
      size: 9,
      font: fonts.regular,
      color: colors.black,
    });

    page.drawText(money(price), {
      x: columns.price - 8,
      y: rowTop + 14,
      size: 8.2,
      font: fonts.regular,
      color: colors.black,
    });

    page.drawText(money(lineTotal), {
      x: columns.total - 9,
      y: rowTop + 14,
      size: 8.2,
      font: fonts.regular,
      color: colors.black,
    });
  });

  return {
    displayedItems,
    rowTop,
  };
}

function drawPaymentReference({
  page,
  fonts,
  colors,
  order,
  rowTop,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  order: InvoiceOrder;
  rowTop: number;
}) {
  const paymentReference =
    cleanText(order.razorpay_payment_id) ||
    (String(order.payment_method).toLowerCase() === "cod"
      ? "Cash on Delivery"
      : "N/A");

  const referenceY = rowTop - 25;

  page.drawText("Payment reference:", {
    x: LEFT,
    y: referenceY,
    size: 8.5,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(shorten(paymentReference, 55), {
    x: LEFT + 92,
    y: referenceY,
    size: 8.5,
    font: fonts.regular,
    color: colors.darkGrey,
  });

  return referenceY;
}

function drawTotals({
  page,
  fonts,
  colors,
  order,
  items,
  referenceY,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  order: InvoiceOrder;
  items: OrderItem[];
  referenceY: number;
}) {
  const calculatedSubtotal = items.reduce((sum, item) => {
    const quantity = Math.max(1, Number(item.quantity || 1));
    const price = Number(item.price || 0);

    return sum + price * quantity;
  }, 0);

  const grandTotal = Number(order.total || calculatedSubtotal);
  const discount = Math.max(0, calculatedSubtotal - grandTotal);

  const totalsX = 350;
  const totalsRight = RIGHT;

  let totalsY = Math.min(referenceY - 55, 315);

  page.drawLine({
    start: { x: totalsX, y: totalsY + 23 },
    end: { x: totalsRight, y: totalsY + 23 },
    thickness: 0.8,
    color: colors.borderGrey,
  });

  const drawRow = (
    label: string,
    value: string,
    bold = false
  ) => {
    const font = bold ? fonts.bold : fonts.regular;
    const size = bold ? 11 : 9.5;

    page.drawText(label, {
      x: totalsX + 10,
      y: totalsY,
      size,
      font,
      color: bold ? colors.black : colors.mediumGrey,
    });

    const valueWidth = font.widthOfTextAtSize(value, size);

    page.drawText(value, {
      x: totalsRight - valueWidth - 8,
      y: totalsY,
      size,
      font,
      color: colors.black,
    });

    totalsY -= bold ? 28 : 22;
  };

  drawRow("Subtotal", money(calculatedSubtotal));

  if (discount > 0) {
    drawRow("Discount", `- ${money(discount)}`);
  }

  drawRow("Grand Total", money(grandTotal), true);
}

function drawVerificationSection({
  page,
  fonts,
  colors,
  orderId,
  qrImage,
  barcodeImage,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  orderId: string;
  qrImage: PDFImage;
  barcodeImage: PDFImage;
}) {
  const verificationTop = 205;
  const qrSize = 74;
  const qrY = verificationTop - 85;

  page.drawText("ORDER VERIFICATION", {
    x: LEFT,
    y: verificationTop,
    size: 9,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawImage(qrImage, {
    x: LEFT,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("SCAN TO VIEW ORDER", {
    x: LEFT,
    y: qrY - 13,
    size: 6.5,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  const barcodeX = LEFT + 100;
  const barcodeY = verificationTop - 48;
  const barcodeWidth = 210;
  const barcodeHeight = 42;

  page.drawImage(barcodeImage, {
    x: barcodeX,
    y: barcodeY,
    width: barcodeWidth,
    height: barcodeHeight,
  });

  page.drawText("ORDER ID", {
    x: barcodeX,
    y: barcodeY - 13,
    size: 6.5,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(orderId.toUpperCase(), {
    x: barcodeX + 45,
    y: barcodeY - 13,
    size: 6.5,
    font: fonts.regular,
    color: colors.darkGrey,
  });
}

function drawFooter({
  page,
  fonts,
  colors,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
}) {
  page.drawLine({
    start: { x: LEFT, y: 92 },
    end: { x: RIGHT, y: 92 },
    thickness: 0.8,
    color: colors.borderGrey,
  });

  page.drawText("Thank you for shopping with QUN.", {
    x: LEFT,
    y: 66,
    size: 11,
    font: fonts.bold,
    color: colors.black,
  });

  page.drawText(
    "This is a computer-generated invoice and does not require a signature.",
    {
      x: LEFT,
      y: 47,
      size: 8,
      font: fonts.regular,
      color: colors.mediumGrey,
    }
  );

  page.drawText("QUN | Premium Streetwear", {
    x: RIGHT - 116,
    y: 47,
    size: 8,
    font: fonts.regular,
    color: colors.mediumGrey,
  });
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ orderId: string }>;
  }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Invoice order error:", orderError);

      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const { data: orderItems, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemError) {
      console.error("Invoice item error:", itemError);

      return NextResponse.json(
        {
          error: "Unable to load order items",
          details: itemError.message,
        },
        { status: 500 }
      );
    }

    const items = (orderItems || []) as OrderItem[];

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    const fonts: InvoiceFonts = {
      regular: await pdf.embedFont(StandardFonts.Helvetica),
      bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    };

    const colors = createColors();

    const { qrImage, barcodeImage } =
      await createVerificationImages(pdf, orderId);

    const invoiceNumber =
      cleanText(order.invoice_number) ||
      `QUN-${orderId.slice(0, 8).toUpperCase()}`;

    const invoiceDateValue =
      order.invoice_created_at ||
      order.created_at ||
      new Date().toISOString();

    const invoiceDate = new Date(invoiceDateValue).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    drawHeader({
      page,
      fonts,
      colors,
      invoiceNumber,
      invoiceDate,
    });

    drawCustomerDetails({
      page,
      fonts,
      colors,
      order,
      orderId,
    });

    const { displayedItems, rowTop } = drawProductTable({
      page,
      fonts,
      colors,
      items,
      order,
    });

    const referenceY = drawPaymentReference({
      page,
      fonts,
      colors,
      order,
      rowTop,
    });

    drawTotals({
      page,
      fonts,
      colors,
      order,
      items: displayedItems,
      referenceY,
    });

    drawVerificationSection({
      page,
      fonts,
      colors,
      orderId,
      qrImage,
      barcodeImage,
    });

    drawFooter({
      page,
      fonts,
      colors,
    });

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}