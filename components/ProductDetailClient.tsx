"use client";

import { useMemo, useState } from "react";
import ProductConfigurator, {
  type ProductOption,
} from "./ProductConfigurator";

type ProductImage = {
  id?: number | string;
  src: string;
  alt?: string;
  thumbnail?: string;
};

type ProductDetailClientProps = {
  productName: string;
  productUrl: string;
  basePrice: number;
  regularPrice?: number;
  currencySymbol?: string;
  mainImage?: ProductImage;
  images?: ProductImage[];
  variations?: ProductOption[];
};

function formatMoney(value: number, currencySymbol: string) {
  return `${currencySymbol}${value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MXN`;
}

function decodeHtml(value = "") {
  return value
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function normalizeColorName(value = "") {
  return value
    .replace(/^pa_/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getVariationName(variation: ProductOption) {
  const colorAttribute = variation.attributes?.find((attribute) => {
    const name = (attribute.name || attribute.slug || "").toLowerCase();
    return name.includes("color");
  });

  const rawName =
    colorAttribute?.option ||
    colorAttribute?.value ||
    variation.attributes?.[0]?.option ||
    variation.attributes?.[0]?.value ||
    variation.name ||
    `Opción ${variation.id}`;

  return normalizeColorName(decodeHtml(rawName));
}

function getColorValue(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("negro")) return "#151515";
  if (normalized.includes("blanco")) return "#f8fafc";
  if (
    normalized.includes("brown") ||
    normalized.includes("cafe") ||
    normalized.includes("café")
  ) {
    return "#6f4e37";
  }
  if (normalized.includes("carey")) return "#8b5a2b";
  if (normalized.includes("dorado") || normalized.includes("oro")) return "#c9a227";
  if (normalized.includes("plata") || normalized.includes("silver")) return "#a7aeb8";
  if (normalized.includes("rojo") || normalized.includes("red")) return "#b42318";
  if (normalized.includes("azul") || normalized.includes("blue")) return "#1d4ed8";
  if (normalized.includes("verde") || normalized.includes("green")) return "#15803d";
  if (normalized.includes("rosa") || normalized.includes("pink")) return "#db2777";
  if (
    normalized.includes("gris") ||
    normalized.includes("gray") ||
    normalized.includes("grey")
  ) {
    return "#64748b";
  }

  return "#94a3b8";
}

function getVariationPrice(variation?: ProductOption) {
  if (!variation?.price) {
    return null;
  }

  const price = Number(variation.price);
  return Number.isFinite(price) ? price : null;
}

function getVariationRegularPrice(variation?: ProductOption) {
  if (!variation?.regularPrice) {
    return null;
  }

  const price = Number(variation.regularPrice);
  return Number.isFinite(price) ? price : null;
}

export default function ProductDetailClient({
  productName,
  productUrl,
  basePrice,
  regularPrice,
  currencySymbol = "$",
  mainImage,
  images = [],
  variations = [],
}: ProductDetailClientProps) {
  const availableVariations = variations.filter(
    (variation) => variation.stockStatus !== "outofstock"
  );

  const initialVariation = availableVariations[0];
  const initialImage =
    initialVariation?.image || mainImage?.src || images[0]?.src || null;

  const [selectedVariationId, setSelectedVariationId] = useState(
    initialVariation?.id?.toString() || ""
  );
  const [activeImage, setActiveImage] = useState<string | null>(initialImage);

  const selectedVariation = availableVariations.find(
    (variation) => variation.id.toString() === selectedVariationId
  );
  const selectedPrice = getVariationPrice(selectedVariation) ?? basePrice;
  const selectedRegularPrice =
    getVariationRegularPrice(selectedVariation) ?? regularPrice;

  const galleryImages: ProductImage[] = useMemo(() => {
    const activeImageItem: ProductImage | null = activeImage
      ? { id: "active", src: activeImage, alt: productName }
      : null;

    const allImages = activeImageItem ? [activeImageItem, ...images] : images;

    return allImages.filter(
      (image, index, array) =>
        Boolean(image?.src) &&
        array.findIndex((item) => item.src === image.src) === index
    );
  }, [activeImage, images, productName]);

  function selectVariation(variation: ProductOption) {
    setSelectedVariationId(variation.id.toString());

    if (variation.image) {
      setActiveImage(variation.image);
    }
  }

  return (
    <section className="product-detail-client">
      <div className="product-gallery">
        <div className="product-main-image">
          {activeImage ? (
            <img
              src={activeImage}
              alt={decodeHtml(productName)}
              className="product-main-image-file"
            />
          ) : (
            <div className="product-image-placeholder">Imagen no disponible</div>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="product-thumbnails" aria-label="Galería de imágenes">
            {galleryImages.map((image, index) => (
              <button
                className={`product-thumbnail-button ${
                  image.src === activeImage ? "is-active" : ""
                }`}
                type="button"
                key={image.id || image.src || index}
                onClick={() => setActiveImage(image.src)}
                aria-label={`Ver imagen ${index + 1} de ${decodeHtml(productName)}`}
              >
                <img
                  src={image.thumbnail || image.src}
                  alt={image.alt || `${decodeHtml(productName)} ${index + 1}`}
                  className="product-thumbnail-file"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-purchase-panel">
        {availableVariations.length > 0 && (
          <section className="variation-swatches" aria-label="Selecciona color">
            <h2>Color o variación</h2>

            <div className="variation-swatch-grid">
              {availableVariations.map((variation) => {
                const name = getVariationName(variation);
                const variationPrice = getVariationPrice(variation);
                const variationRegularPrice = getVariationRegularPrice(variation);
                const isSelected = variation.id.toString() === selectedVariationId;

                return (
                  <button
                    type="button"
                    key={variation.id}
                    className={`variation-swatch ${isSelected ? "is-selected" : ""}`}
                    onClick={() => selectVariation(variation)}
                    aria-pressed={isSelected}
                  >
                    <span
                      className="variation-swatch-dot"
                      style={{ backgroundColor: getColorValue(name) }}
                      aria-hidden="true"
                    />

                    {variation.image ? (
                      <img
                        src={variation.image}
                        alt={name}
                        className="variation-swatch-image"
                      />
                    ) : (
                      <span className="variation-swatch-image variation-swatch-image-empty">
                        Sin foto
                      </span>
                    )}

                    <span className="variation-swatch-content">
                      <span className="variation-swatch-name">{name}</span>

                      {variationRegularPrice &&
                        variationPrice &&
                        variationRegularPrice > variationPrice && (
                          <del>
                            {formatMoney(variationRegularPrice, currencySymbol)}
                          </del>
                        )}

                      <strong>
                        {formatMoney(variationPrice ?? basePrice, currencySymbol)}
                      </strong>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <p className="product-price product-price-client">
          {selectedRegularPrice && selectedRegularPrice > selectedPrice && (
            <del>{formatMoney(selectedRegularPrice, currencySymbol)}</del>
          )}
          <span>{formatMoney(selectedPrice, currencySymbol)}</span>
        </p>

        <p className="product-price-note">Precio del armazón seleccionado</p>

        <ProductConfigurator
          productName={productName}
          productUrl={productUrl}
          basePrice={selectedPrice}
          currencySymbol={currencySymbol}
        />
      </div>
    </section>
  );
}
