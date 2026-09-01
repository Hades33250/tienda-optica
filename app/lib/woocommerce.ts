import "server-only";

export type WooImage = {
  id: number;
  src: string;
  alt: string;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WooAttribute = {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
};

export type WooVariation = {
  id: number;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: number | null;
  image: WooImage;
  attributes: {
    id: number;
    name: string;
    option: string;
  }[];
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  type: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: number | null;
  short_description: string;
  description: string;
  images: WooImage[];
  categories: WooCategory[];
  attributes: WooAttribute[];
  variations: number[];
};

const storeUrl = process.env.WOOCOMMERCE_URL;
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

if (!storeUrl || !consumerKey || !consumerSecret) {
  throw new Error(
    "Faltan las variables de entorno de WooCommerce."
  );
}

function getAuthorizationHeader() {
  const credentials = `${consumerKey}:${consumerSecret}`;

  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

async function wooFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(
    `${storeUrl}/wp-json/wc/v3${endpoint}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: getAuthorizationHeader(),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `WooCommerce HTTP ${response.status}: ${responseText.slice(0, 300)}`
    );
  }

  return response.json();
}

export async function getWooProducts(): Promise<WooProduct[]> {
  return wooFetch<WooProduct[]>(
    "/products?status=publish&per_page=24"
  );
}

export async function getWooProductBySlug(
  slug: string
): Promise<WooProduct | null> {
  const products = await wooFetch<WooProduct[]>(
    `/products?slug=${encodeURIComponent(slug)}&status=publish`
  );

  return products[0] || null;
}

export async function getWooVariations(
  productId: number
): Promise<WooVariation[]> {
  return wooFetch<WooVariation[]>(
    `/products/${productId}/variations?per_page=100`
  );
}
