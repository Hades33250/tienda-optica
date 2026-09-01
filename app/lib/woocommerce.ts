import "server-only";

type WooImage = {
  id: number;
  src: string;
  alt: string;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable" | string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: "instock" | "outofstock" | "onbackorder" | string;
  stock_quantity: number | null;
  short_description: string;
  description: string;
  images: WooImage[];
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
};

const storeUrl = process.env.WOOCOMMERCE_URL;
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

if (!storeUrl || !consumerKey || !consumerSecret) {
  throw new Error(
    "Faltan las variables de entorno de WooCommerce en Easypanel."
  );
}

function createAuthorizationHeader() {
  const credentials = `${consumerKey}:${consumerSecret}`;

  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

export async function getWooProducts(): Promise<WooProduct[]> {
  const response = await fetch(
    `${storeUrl}/wp-json/wc/v3/products?status=publish&per_page=24`,
    {
      headers: {
        Authorization: createAuthorizationHeader(),
      },
      next: {
        revalidate: 300,
        tags: ["woocommerce-products"],
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `No fue posible obtener productos de WooCommerce. HTTP ${response.status}`
    );
  }

  return response.json();
}
