import QRCode from "qrcode";
import bwipjs from "bwip-js";
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
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

type InvoiceOrder = Record<string, unknown>;

type InvoiceFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

type InvoiceColors = ReturnType<typeof createColors>;

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 50;
const RIGHT = PAGE_WIDTH - 50;
const CONTENT_WIDTH = RIGHT - LEFT;

function createColors() {
  return {
    black: rgb(0.035, 0.035, 0.035),
    charcoal: rgb(0.16, 0.16, 0.16),
    darkGrey: rgb(0.31, 0.31, 0.31),
    mediumGrey: rgb(0.47, 0.47, 0.47),
    lightGrey: rgb(0.965, 0.965, 0.965),
    borderGrey: rgb(0.86, 0.86, 0.86),
    white: rgb(1, 1, 1),
    statusFill: rgb(0.995, 0.965, 0.84),
    statusBorder: rgb(0.86, 0.7, 0.24),
    statusText: rgb(0.43, 0.31, 0.03),
  };
}

function cleanText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: unknown) {
  return `INR ${numberValue(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function titleCase(value: unknown, fallback = "N/A") {
  const text = cleanText(value);
  if (!text) return fallback;

  return text
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function shortenToWidth(
  value: string,
  font: PDFFont,
  size: number,
  maximumWidth: number,
) {
  if (font.widthOfTextAtSize(value, size) <= maximumWidth) return value;

  let text = value;
  while (
    text.length > 1 &&
    font.widthOfTextAtSize(`${text}...`, size) > maximumWidth
  ) {
    text = text.slice(0, -1);
  }

  return `${text.trimEnd()}...`;
}

function wrapText(
  value: string,
  font: PDFFont,
  size: number,
  maximumWidth: number,
) {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maximumWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = shortenToWidth(word, font, size, maximumWidth);
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawWrappedText({
  page,
  value,
  x,
  y,
  width,
  font,
  size,
  lineHeight,
  color,
  maximumLines,
}: {
  page: PDFPage;
  value: string;
  x: number;
  y: number;
  width: number;
  font: PDFFont;
  size: number;
  lineHeight: number;
  color: ReturnType<typeof rgb>;
  maximumLines?: number;
}) {
  let lines = wrapText(value, font, size, width);

  if (maximumLines && lines.length > maximumLines) {
    lines = lines.slice(0, maximumLines);
    const last = lines.length - 1;
    lines[last] = shortenToWidth(lines[last], font, size, width);
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

function parseLegacyAddress(order: InvoiceOrder) {
  const rawAddress = cleanText(order.address);
  const lines = rawAddress
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const metadataPattern = /^(notes|payment method|razorpay payment id)\s*:/i;

  const visibleLines = lines.filter((line) => !metadataPattern.test(line));
  const pinLine = visibleLines.find((line) => /^pin\s*:/i.test(line));
  const pinFromAddress = pinLine?.replace(/^pin\s*:\s*/i, "").trim();

  const paymentLine = lines.find((line) => /^payment method\s*:/i.test(line));
  const paymentFromAddress = paymentLine
    ?.replace(/^payment method\s*:\s*/i, "")
    .trim();

  const razorpayLine = lines.find((line) =>
    /^razorpay payment id\s*:/i.test(line),
  );
  const razorpayFromAddress = razorpayLine
    ?.replace(/^razorpay payment id\s*:\s*/i, "")
    .trim();

  const addressWithoutPin = visibleLines.filter(
    (line) => !/^pin\s*:/i.test(line),
  );

  return {
    address: addressWithoutPin.join(", "),
    pincode: cleanText(order.pincode) || pinFromAddress || "",
    paymentMethod:
      cleanText(order.payment_method) || paymentFromAddress || "N/A",
    paymentReference:
      cleanText(order.razorpay_payment_id) || razorpayFromAddress || "",
  };
}

function normaliseOrder(order: InvoiceOrder) {
  const legacy = parseLegacyAddress(order);
  const city = cleanText(order.city);
  const state = cleanText(order.state);

  const addressParts = [legacy.address, city, state]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  return {
    customerName: cleanText(order.customer_name, "Customer"),
    phone: cleanText(order.phone, "N/A"),
    email: cleanText(order.email, "N/A"),
    address: addressParts.join(", ") || "Address not available",
    pincode: legacy.pincode,
    paymentMethod: titleCase(legacy.paymentMethod),
    paymentStatus: titleCase(order.payment_status, "Pending"),
    orderStatus: titleCase(order.order_status, "Pending"),
    paymentReference:
      legacy.paymentReference && legacy.paymentReference.toLowerCase() !== "n/a"
        ? legacy.paymentReference
        : legacy.paymentMethod.toLowerCase() === "cod"
          ? "Cash on Delivery"
          : "N/A",
    total: numberValue(order.total),
    discount: Math.max(0, numberValue(order.discount_amount)),
    shipping: Math.max(0, numberValue(order.shipping_amount)),
  };
}

async function createVerificationImages(pdf: PDFDocument, orderId: string) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const orderUrl = `${baseUrl}/account/orders/${orderId}`;

  const qrDataUrl = await QRCode.toDataURL(orderUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 360,
  });

  const qrImage = await pdf.embedPng(
    Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64"),
  );

  const barcodeBuffer = await bwipjs.toBuffer({
    bcid: "code128",
    text: orderId.toUpperCase(),
    scale: 3,
    height: 12,
    includetext: false,
    backgroundcolor: "FFFFFF",
    paddingwidth: 0,
    paddingheight: 0,
  });

  return {
    qrImage,
    barcodeImage: await pdf.embedPng(barcodeBuffer),
  };
}

async function loadBrandLogo(pdf: PDFDocument) {
  const candidates = [
    "public/images/qun-logo-horizontal.png",
    "public/images/logo.png",
  ];

  for (const candidate of candidates) {
    try {
      const originalBuffer = await readFile(
        path.join(process.cwd(), candidate)
      );

      const sourceImage = sharp(originalBuffer).ensureAlpha();
      const metadata = await sourceImage.metadata();

      if (!metadata.width || !metadata.height) {
        continue;
      }

      // Preserve the original transparent areas.
      const alphaChannel = await sourceImage
        .clone()
        .extractChannel("alpha")
        .toBuffer();

      // Create a pure-white version only for the PDF invoice.
      const whiteLogoBuffer = await sharp({
        create: {
          width: metadata.width,
          height: metadata.height,
          channels: 3,
          background: {
            r: 255,
            g: 255,
            b: 255,
          },
        },
      })
        .joinChannel(alphaChannel)
        .png()
        .toBuffer();

      return await pdf.embedPng(whiteLogoBuffer);
    } catch (error) {
      console.warn(`Could not load invoice logo: ${candidate}`, error);
    }
  }

  return undefined;
}
function drawHeader({
  page,
  fonts,
  colors,
  invoiceNumber,
  invoiceDate,
  brandLogo,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  invoiceNumber: string;
  invoiceDate: string;
  brandLogo?: PDFImage;
}) {
  const headerHeight = 135;

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - headerHeight,
    width: PAGE_WIDTH,
    height: headerHeight,
    color: colors.black,
  });

  if (brandLogo) {
    const dimensions = brandLogo.scale(1);
    const maximumWidth = 150;
    const maximumHeight = 58;
    const scale = Math.min(
      maximumWidth / dimensions.width,
      maximumHeight / dimensions.height,
    );

    page.drawImage(brandLogo, {
      x: LEFT,
      y: PAGE_HEIGHT - 103,
      width: dimensions.width * scale,
      height: dimensions.height * scale,
    });
  } else {
    page.drawText("QUN", {
      x: LEFT,
      y: PAGE_HEIGHT - 70,
      size: 31,
      font: fonts.bold,
      color: colors.white,
    });

    page.drawText("PREMIUM STREETWEAR", {
      x: LEFT,
      y: PAGE_HEIGHT - 94,
      size: 8.5,
      font: fonts.regular,
      color: rgb(0.72, 0.72, 0.72),
    });
  }

  const title = "TAX INVOICE";
  page.drawText(title, {
    x: RIGHT - fonts.bold.widthOfTextAtSize(title, 19),
    y: PAGE_HEIGHT - 62,
    size: 19,
    font: fonts.bold,
    color: colors.white,
  });

  const tagWidth = 205;
  const tagHeight = 28;
  const tagX = RIGHT - tagWidth;
  const tagY = PAGE_HEIGHT - 118;

  page.drawRectangle({
    x: tagX,
    y: tagY,
    width: tagWidth,
    height: tagHeight,
    color: colors.white,
  });

  const invoiceText = shortenToWidth(
    invoiceNumber,
    fonts.bold,
    9.5,
    tagWidth - 18,
  );

  page.drawText(invoiceText, {
    x: tagX + tagWidth - fonts.bold.widthOfTextAtSize(invoiceText, 9.5) - 9,
    y: tagY + 10,
    size: 9.5,
    font: fonts.bold,
    color: colors.black,
  });

  page.drawText(invoiceDate, {
    x: RIGHT - fonts.regular.widthOfTextAtSize(invoiceDate, 8.5),
    y: tagY - 17,
    size: 8.5,
    font: fonts.regular,
    color: rgb(0.72, 0.72, 0.72),
  });

  page.drawLine({
    start: { x: LEFT, y: PAGE_HEIGHT - headerHeight + 1 },
    end: { x: RIGHT, y: PAGE_HEIGHT - headerHeight + 1 },
    thickness: 0.7,
    color: rgb(0.22, 0.22, 0.22),
  });
}

function drawCard({
  page,
  x,
  y,
  width,
  height,
  colors,
}: {
  page: PDFPage;
  x: number;
  y: number;
  width: number;
  height: number;
  colors: InvoiceColors;
}) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.985, 0.985, 0.985),
    borderColor: colors.borderGrey,
    borderWidth: 0.7,
  });
}

function drawStatusPill({
  page,
  text,
  x,
  y,
  width,
  fonts,
  colors,
}: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  width: number;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
}) {
  const height = 24;
  const radius = height / 2;

  const drawRoundedLayer = (
    layerX: number,
    layerY: number,
    layerWidth: number,
    layerHeight: number,
    color: ReturnType<typeof rgb>,
  ) => {
    const layerRadius = layerHeight / 2;

    page.drawRectangle({
      x: layerX + layerRadius,
      y: layerY,
      width: Math.max(0, layerWidth - layerHeight),
      height: layerHeight,
      color,
    });

    page.drawCircle({
      x: layerX + layerRadius,
      y: layerY + layerRadius,
      size: layerRadius,
      color,
    });

    page.drawCircle({
      x: layerX + layerWidth - layerRadius,
      y: layerY + layerRadius,
      size: layerRadius,
      color,
    });
  };

  // Gold outer layer and cream inner layer create a subtle premium border.
  drawRoundedLayer(x, y, width, height, colors.statusBorder);
  drawRoundedLayer(
    x + 0.8,
    y + 0.8,
    width - 1.6,
    height - 1.6,
    colors.statusFill,
  );

  const label = shortenToWidth(text.toUpperCase(), fonts.bold, 7.5, width - 20);
  const labelWidth = fonts.bold.widthOfTextAtSize(label, 7.5);

  page.drawText(label, {
    x: x + Math.max(10, (width - labelWidth) / 2),
    y: y + 8.2,
    size: 7.5,
    font: fonts.bold,
    color: colors.statusText,
  });
}

function drawInformationCards({
  page,
  fonts,
  colors,
  order,
  orderId,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  order: ReturnType<typeof normaliseOrder>;
  orderId: string;
}) {
  const top = PAGE_HEIGHT - 170;
  const gap = 15;
  const cardWidth = (CONTENT_WIDTH - gap) / 2;
  const cardHeight = 184;
  const cardY = top - cardHeight;
  const rightX = LEFT + cardWidth + gap;

  drawCard({
    page,
    x: LEFT,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    colors,
  });
  drawCard({
    page,
    x: rightX,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    colors,
  });

  page.drawText("BILLING DETAILS", {
    x: LEFT + 16,
    y: top - 24,
    size: 8.5,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(order.customerName, {
    x: LEFT + 16,
    y: top - 51,
    size: 13.5,
    font: fonts.bold,
    color: colors.black,
  });

  let billingY = drawWrappedText({
    page,
    value: order.address,
    x: LEFT + 16,
    y: top - 76,
    width: cardWidth - 32,
    font: fonts.regular,
    size: 8.5,
    lineHeight: 12,
    color: colors.darkGrey,
    maximumLines: 2,
  });

  if (order.pincode) {
    page.drawText(`PIN: ${order.pincode}`, {
      x: LEFT + 16,
      y: billingY - 1,
      size: 8.5,
      font: fonts.regular,
      color: colors.darkGrey,
    });
  }

  page.drawText("PHONE", {
    x: LEFT + 16,
    y: cardY + 42,
    size: 6.8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(order.phone, {
    x: LEFT + 16,
    y: cardY + 27,
    size: 8.2,
    font: fonts.regular,
    color: colors.black,
  });

  page.drawText("EMAIL", {
    x: LEFT + 110,
    y: cardY + 42,
    size: 6.8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(
    shortenToWidth(order.email, fonts.regular, 8.2, cardWidth - 126),
    {
      x: LEFT + 110,
      y: cardY + 27,
      size: 8.2,
      font: fonts.regular,
      color: colors.black,
    },
  );

  page.drawText("ORDER DETAILS", {
    x: rightX + 16,
    y: top - 24,
    size: 8.5,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText("ORDER ID", {
    x: rightX + 16,
    y: top - 52,
    size: 6.8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(
    shortenToWidth(orderId.toUpperCase(), fonts.regular, 8, cardWidth - 32),
    {
      x: rightX + 16,
      y: top - 68,
      size: 8,
      font: fonts.regular,
      color: colors.black,
    },
  );

  const detailsLeftX = rightX + 16;
  const detailsRightX = rightX + 136;
  const detailsRightWidth = cardWidth - 152;

  page.drawText("PAYMENT METHOD", {
    x: detailsLeftX,
    y: top - 91,
    size: 6.8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(
    shortenToWidth(order.paymentMethod.toUpperCase(), fonts.bold, 8.3, 105),
    {
      x: detailsLeftX,
      y: top - 108,
      size: 8.3,
      font: fonts.bold,
      color: colors.black,
    },
  );

  page.drawText("PAYMENT STATUS", {
    x: detailsRightX,
    y: top - 91,
    size: 6.8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  drawStatusPill({
    page,
    text: order.paymentStatus,
    x: detailsRightX,
    y: top - 122,
    width: detailsRightWidth,
    fonts,
    colors,
  });

  page.drawLine({
    start: { x: rightX + 16, y: top - 139 },
    end: { x: rightX + cardWidth - 16, y: top - 139 },
    thickness: 0.45,
    color: colors.borderGrey,
  });

  page.drawText("ORDER STATUS", {
    x: detailsLeftX,
    y: top - 154,
    size: 6.8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  drawStatusPill({
    page,
    text: order.orderStatus,
    x: detailsLeftX,
    y: top - 181,
    width: cardWidth - 32,
    fonts,
    colors,
  });

  return cardY - 25;
}

function drawSectionHeading({
  page,
  fonts,
  colors,
  title,
  y,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  title: string;
  y: number;
}) {
  page.drawText(title, {
    x: LEFT,
    y,
    size: 8.5,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawLine({
    start: { x: LEFT, y: y - 9 },
    end: { x: RIGHT, y: y - 9 },
    thickness: 0.6,
    color: colors.borderGrey,
  });

  return y - 18;
}

function drawProductTable({
  page,
  fonts,
  colors,
  items,
  orderTotal,
  startY,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  items: OrderItem[];
  orderTotal: number;
  startY: number;
}) {
  const headerHeight = 32;
  const rowHeight = 36;
  const visibleItems = items.length
    ? items.slice(0, 5)
    : [{ name: "Order item", size: "-", quantity: 1, price: orderTotal }];

  const columns = {
    product: LEFT + 14,
    size: LEFT + 275,
    quantity: LEFT + 330,
    unitPriceRight: LEFT + 434,
    totalRight: RIGHT - 12,
  };

  page.drawRectangle({
    x: LEFT,
    y: startY - headerHeight,
    width: CONTENT_WIDTH,
    height: headerHeight,
    color: colors.black,
  });

  const headers = [
    ["PRODUCT", columns.product],
    ["SIZE", columns.size],
    ["QTY", columns.quantity],
    ["UNIT PRICE", columns.unitPriceRight - 51],
    ["TOTAL", columns.totalRight - 30],
  ] as const;

  headers.forEach(([label, x]) => {
    page.drawText(label, {
      x,
      y: startY - 20,
      size: 7.8,
      font: fonts.bold,
      color: colors.white,
    });
  });

  let rowY = startY - headerHeight;

  visibleItems.forEach((item, index) => {
    rowY -= rowHeight;

    page.drawRectangle({
      x: LEFT,
      y: rowY,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: index % 2 === 0 ? colors.lightGrey : colors.white,
      borderColor: colors.borderGrey,
      borderWidth: 0.45,
    });

    const quantity = Math.max(1, numberValue(item.quantity, 1));
    const price = numberValue(item.price);
    const total = price * quantity;
    const productName = cleanText(item.product_name || item.name, "Product");

    page.drawText(shortenToWidth(productName, fonts.regular, 8.3, 245), {
      x: columns.product,
      y: rowY + 13,
      size: 8.3,
      font: fonts.regular,
      color: colors.black,
    });

    page.drawText(cleanText(item.size, "-"), {
      x: columns.size + 5,
      y: rowY + 13,
      size: 8.3,
      font: fonts.regular,
      color: colors.black,
    });

    page.drawText(String(quantity), {
      x: columns.quantity + 7,
      y: rowY + 13,
      size: 8.3,
      font: fonts.regular,
      color: colors.black,
    });

    const unitText = money(price);
    page.drawText(unitText, {
      x: columns.unitPriceRight - fonts.regular.widthOfTextAtSize(unitText, 8),
      y: rowY + 13,
      size: 8,
      font: fonts.regular,
      color: colors.black,
    });

    const totalText = money(total);
    page.drawText(totalText, {
      x: columns.totalRight - fonts.regular.widthOfTextAtSize(totalText, 8),
      y: rowY + 13,
      size: 8,
      font: fonts.regular,
      color: colors.black,
    });
  });

  return {
    visibleItems,
    bottomY: rowY,
    hiddenItemCount: Math.max(0, items.length - visibleItems.length),
  };
}

function drawPaymentAndTotals({
  page,
  fonts,
  colors,
  order,
  items,
  startY,
  hiddenItemCount,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  order: ReturnType<typeof normaliseOrder>;
  items: OrderItem[];
  startY: number;
  hiddenItemCount: number;
}) {
  const gap = 15;
  const leftWidth = 250;
  const rightX = LEFT + leftWidth + gap;
  const rightWidth = CONTENT_WIDTH - leftWidth - gap;
  const cardHeight = 112;
  const cardY = startY - cardHeight;

  drawCard({
    page,
    x: LEFT,
    y: cardY,
    width: leftWidth,
    height: cardHeight,
    colors,
  });
  drawCard({
    page,
    x: rightX,
    y: cardY,
    width: rightWidth,
    height: cardHeight,
    colors,
  });

  page.drawText("PAYMENT REFERENCE", {
    x: LEFT + 16,
    y: startY - 24,
    size: 8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(
    shortenToWidth(order.paymentReference, fonts.regular, 8.5, leftWidth - 32),
    {
      x: LEFT + 16,
      y: startY - 45,
      size: 8.5,
      font: fonts.regular,
      color: colors.black,
    },
  );

  page.drawText("METHOD", {
    x: LEFT + 16,
    y: cardY + 31,
    size: 6.8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(
    shortenToWidth(
      order.paymentMethod.toUpperCase(),
      fonts.bold,
      8.7,
      leftWidth - 112,
    ),
    {
      x: LEFT + 96,
      y: cardY + 29,
      size: 8.7,
      font: fonts.bold,
      color: colors.black,
    },
  );

  if (hiddenItemCount > 0) {
    page.drawText(`+ ${hiddenItemCount} additional item(s)`, {
      x: LEFT + 16,
      y: cardY + 12,
      size: 7,
      font: fonts.regular,
      color: colors.mediumGrey,
    });
  }

  page.drawText("ORDER SUMMARY", {
    x: rightX + 16,
    y: startY - 24,
    size: 8,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  const itemSubtotal = items.reduce((sum, item) => {
    return (
      sum + numberValue(item.price) * Math.max(1, numberValue(item.quantity, 1))
    );
  }, 0);

  const subtotal =
    itemSubtotal || order.total + order.discount - order.shipping;
  const rows = [
    ["Subtotal", money(subtotal)],
    ["Shipping", order.shipping > 0 ? money(order.shipping) : "FREE"],
    ["Discount", order.discount > 0 ? `- ${money(order.discount)}` : money(0)],
  ];

  let rowY = startY - 45;
  for (const [label, value] of rows) {
    page.drawText(label, {
      x: rightX + 16,
      y: rowY,
      size: 7.7,
      font: fonts.regular,
      color: colors.mediumGrey,
    });

    page.drawText(value, {
      x: rightX + rightWidth - 16 - fonts.regular.widthOfTextAtSize(value, 7.7),
      y: rowY,
      size: 7.7,
      font: fonts.regular,
      color: colors.black,
    });

    rowY -= 17;
  }

  const grandTotalY = cardY - 15;

page.drawRectangle({
  x: rightX,
  y: grandTotalY,
  width: rightWidth,
  height: 31,
  color: rgb(0, 0, 0),
});

  page.drawText("GRAND TOTAL", {
  x: rightX + 16,
  y: grandTotalY + 11,
    size: 10,
    font: fonts.bold,
    color: colors.white,
  });

  const totalText = money(
    order.total || subtotal - order.discount + order.shipping,
  );
  page.drawText(totalText, {
    x: rightX + rightWidth - 16 - fonts.bold.widthOfTextAtSize(totalText, 9.5),
    y: grandTotalY + 11,
    size: 10,
    font: fonts.bold,
    color: colors.white,
  });

  return grandTotalY - 28;
}

function drawVerificationSection({
  page,
  fonts,
  colors,
  orderId,
  invoiceNumber,
  invoiceDate,
  siteUrl,
  qrImage,
  barcodeImage,
  startY,
}: {
  page: PDFPage;
  fonts: InvoiceFonts;
  colors: InvoiceColors;
  orderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  siteUrl: string;
  qrImage: PDFImage;
  barcodeImage: PDFImage;
  startY: number;
}) {
  const height = 104;
  const y = Math.max(115, Math.min(startY - height, 160));

  page.drawRectangle({
    x: LEFT,
    y,
    width: CONTENT_WIDTH,
    height,
    color: rgb(0.985, 0.985, 0.985),
    borderColor: colors.borderGrey,
    borderWidth: 0.7,
  });

  page.drawText("ORDER VERIFICATION", {
    x: LEFT + 14,
    y: y + height - 19,
    size: 7.5,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  const qrSize = 58;
  page.drawImage(qrImage, {
    x: LEFT + 14,
    y: y + 14,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("Scan to verify this invoice", {
    x: LEFT + 83,
    y: y + 66,
    size: 8.2,
    font: fonts.bold,
    color: colors.black,
  });

  page.drawText("Confirm authenticity or view", {
    x: LEFT + 83,
    y: y + 49,
    size: 7.2,
    font: fonts.regular,
    color: colors.mediumGrey,
  });

  page.drawText("the order securely online.", {
    x: LEFT + 83,
    y: y + 34,
    size: 7.2,
    font: fonts.regular,
    color: colors.mediumGrey,
  });

  page.drawText("INVOICE", {
    x: LEFT + 83,
    y: y + 18,
    size: 6.1,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(shortenToWidth(invoiceNumber, fonts.bold, 6.6, 100), {
    x: LEFT + 125,
    y: y + 18,
    size: 6.6,
    font: fonts.bold,
    color: colors.darkGrey,
  });

  const barcodeX = LEFT + 265;
  const barcodeWidth = RIGHT - barcodeX - 14;

  page.drawImage(barcodeImage, {
    x: barcodeX,
    y: y + 50,
    width: barcodeWidth,
    height: 30,
  });

  page.drawText("GENERATED", {
    x: barcodeX,
    y: y + 35,
    size: 6,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(invoiceDate, {
    x: barcodeX + 55,
    y: y + 35,
    size: 6.4,
    font: fonts.regular,
    color: colors.darkGrey,
  });

  page.drawText("VERIFY", {
    x: barcodeX,
    y: y + 21,
    size: 6,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(
    shortenToWidth(siteUrl, fonts.regular, 6.2, barcodeWidth - 40),
    {
      x: barcodeX + 40,
      y: y + 21,
      size: 6.2,
      font: fonts.regular,
      color: colors.darkGrey,
    },
  );

  page.drawText("ORDER ID", {
    x: barcodeX,
    y: y + 8,
    size: 6,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  page.drawText(
    shortenToWidth(
      orderId.toUpperCase(),
      fonts.regular,
      5.8,
      barcodeWidth - 46,
    ),
    {
      x: barcodeX + 43,
      y: y + 8,
      size: 5.8,
      font: fonts.regular,
      color: colors.darkGrey,
    },
  );
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
    start: { x: LEFT, y: 82 },
    end: { x: RIGHT, y: 82 },
    thickness: 0.7,
    color: colors.borderGrey,
  });

  page.drawText("Thank you for choosing QUN.", {
    x: LEFT,
    y: 60,
    size: 9.5,
    font: fonts.bold,
    color: colors.black,
  });

  page.drawText(
    "This is a computer-generated invoice and does not require a signature.",
    {
      x: LEFT,
      y: 43,
      size: 7.2,
      font: fonts.regular,
      color: colors.mediumGrey,
    },
  );

  const brand = "QUN  |  PREMIUM STREETWEAR";
  page.drawText(brand, {
    x: RIGHT - fonts.bold.widthOfTextAtSize(brand, 7.2),
    y: 60,
    size: 7.2,
    font: fonts.bold,
    color: colors.mediumGrey,
  });

  const support = "support@qun.store";
  page.drawText(support, {
    x: RIGHT - fonts.regular.widthOfTextAtSize(support, 6.7),
    y: 43,
    size: 6.7,
    font: fonts.regular,
    color: colors.mediumGrey,
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
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
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: orderItems, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("id", { ascending: true });

    if (itemError) {
      console.error("Invoice item error:", itemError);
      return NextResponse.json(
        { error: "Unable to load order items", details: itemError.message },
        { status: 500 },
      );
    }

    const items = (orderItems || []) as OrderItem[];
    const normalisedOrder = normaliseOrder(order as InvoiceOrder);

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    const fonts: InvoiceFonts = {
      regular: await pdf.embedFont(StandardFonts.Helvetica),
      bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    };
    const colors = createColors();
    const brandLogo = await loadBrandLogo(pdf);

    const { qrImage, barcodeImage } = await createVerificationImages(
      pdf,
      orderId,
    );

    const invoiceNumber =
      cleanText((order as InvoiceOrder).invoice_number) ||
      `QUN-${orderId.slice(0, 8).toUpperCase()}`;

    const invoiceDateValue =
      cleanText((order as InvoiceOrder).invoice_created_at) ||
      cleanText((order as InvoiceOrder).created_at) ||
      new Date().toISOString();

    const invoiceDate = new Date(invoiceDateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    drawHeader({
      page,
      fonts,
      colors,
      invoiceNumber,
      invoiceDate,
      brandLogo,
    });

    let currentY = drawInformationCards({
      page,
      fonts,
      colors,
      order: normalisedOrder,
      orderId,
    });

    currentY = drawSectionHeading({
      page,
      fonts,
      colors,
      title: "ORDER ITEMS",
      y: currentY,
    });

    const { visibleItems, bottomY, hiddenItemCount } = drawProductTable({
      page,
      fonts,
      colors,
      items,
      orderTotal: normalisedOrder.total,
      startY: currentY,
    });

    currentY = drawPaymentAndTotals({
      page,
      fonts,
      colors,
      order: normalisedOrder,
      items: visibleItems,
      startY: bottomY - 18,
      hiddenItemCount,
    });

    const publicSiteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ).replace(/\/$/, "");

    drawVerificationSection({
      page,
      fonts,
      colors,
      orderId,
      invoiceNumber,
      invoiceDate,
      siteUrl: publicSiteUrl,
      qrImage,
      barcodeImage,
      startY: currentY,
    });

    drawFooter({ page, fonts, colors });

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
      { status: 500 },
    );
  }
}