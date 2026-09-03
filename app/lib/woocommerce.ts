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
  image: WooImage | null;
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

const rawStoreUrl = process.env.WOOCOMMERCE_URL || "";
const storeUrl = rawStoreUrl.replace(/\/+$/, "");

const consumerKey =
  process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();

const consumerSecret =
  process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

if (!storeUrl || !consumerKey || !consumerSecret) {
  throw new Error(
    "Faltan las variables de entorno de WooCommerce en Easypanel."
  );
}

function getAuthorizationHeader() {
  const credentials = `${consumerKey}:${consumerSecret}`;

  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

async function wooFetch<T>(endpoint: string): Promise<T> {
  const url = `${storeUrl}/wp-json/wc/v3${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: getAuthorizationHeader(),
      },
      cache: "no-store",
    });

    const body = await response.text();

    if (!response.ok) {
      throw new Error(
        `WooCommerce respondió HTTP ${response.status}: ${body.slice(0, 300)}`
      );
    }

    try {
      return JSON.parse(body) as T;
    } catch {
      throw new Error(
        `WooCommerce devolvió una respuesta que no es JSON: ${body.slice(0, 300)}`
      );
    }
  } catch (error) {
    const errorWithCause = error as Error & {
      cause?: {
        code?: string;
        message?: string;
      };
    };

    const detail =
      error instanceof Error
        ? error.message
        : "Error de red desconocido";

    const cause = errorWithCause.cause
      ? ` Causa: ${errorWithCause.cause.code || ""} ${
          errorWithCause.cause.message || ""
        }`
      : "";

    throw new Error(
      `No se pudo conectar con WooCommerce en ${url}. ${detail}${cause}`
    );
  }
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
