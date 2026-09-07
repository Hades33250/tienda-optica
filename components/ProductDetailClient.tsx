"use client";

import { useState } from "react";
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

function normalizeLabel(value = "") {
  return value
    .replace(/^pa_/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getVariationLabel(variation: ProductOption) {
  const attribute = variation.attributes?.find((item) => {
    const name = `${item.name || ""} ${item.slug || ""}`.toLowerCase();
    return name.includes("color") || name.includes("pa_");
  }) || variation.attributes?.[0];

  const value =
    attribute?.option ||
    attribute?.value ||
    variation.name ||
    `Opción ${variation.id}`;

  return normalizeLabel(decodeHtml(value));
}

function getColor(value: string) {
  const name = value.toLowerCase();

  if (name.includes("negro")) return "#111827";
  if (name.includes("blanco")) return "#f8fafc";
  if (name.includes("brown") || name.includes("cafe") || name.includes("café")) {
    return "#6f4e37";
  }
  if (name.includes("carey")) return "#9a642f";
  if (name.includes("dorado") || name.includes("oro")) return "#c6a227";
  if (name.includes("plata") || name.includes("silver")) return "#a8b0bb";
  if (name.includes("azul") || name.includes("blue")) return "#2563eb";
  if (name.includes("rojo") || name.includes("red")) return "#b91c1c";

  return "#94a3b8";
}

function numberOrNull(value?: string) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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

  const firstVariation = availableVariations[0];
  const [selectedVariationId, setSelectedVariationId] = useState(
    firstVariation?.id.toString() || ""
  );
  const [selectedImage, setSelectedImage] = useState(
    firstVariation?.image || mainImage?.src || images[0]?.src || ""
  );

  const selectedVariation = availableVariations.find(
    (variation) => variation.id.toString() === selectedVariationId
  );
  const selectedPrice = numberOrNull(selectedVariation?.price) ?? basePrice;
  const selectedRegularPrice =
    numberOrNull(selectedVariation?.regularPrice) ?? regularPrice;

  const variationImages = availableVariations
    .filter((variation) => variation.image)
    .map((variation) => ({
      id: `variation-${variation.id}`,
      src: variation.image as string,
      alt: getVariationLabel(variation),
    }));

  const allGalleryImages = [
    ...(selectedImage
      ? [{ id: "selected", src: selectedImage, alt: productName }]
      : []),
    ...variationImages,
    ...images,
  ].filter(
    (image, index, array) =>
      image.src && array.findIndex((item) => item.src === image.src) === index
  );

  function chooseVariation(variation: ProductOption) {
    setSelectedVariationId(variation.id.toString());

    if (variation.image) {
      setSelectedImage(variation.image);
    }
  }

  return (
    <section className="product-detail-client">
      <div className="product-gallery">
        <div className="product-main-image">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={decodeHtml(productName)}
              className="product-main-image-file"
            />
          ) : (
            <div className="product-image-placeholder">Imagen no disponible</div>
          )}
        </div>

        {allGalleryImages.length > 1 && (
          <div className="product-thumbnails">
            {allGalleryImages.map((image, index) => (
              <button
                type="button"
                key={image.id || `${image.src}-${index}`}
                className={`product-thumbnail-button ${
                  image.src === selectedImage ? "is-active" : ""
                }`}
                onClick={() => setSelectedImage(image.src)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img
                  src={image.src}
                  alt={image.alt || productName}
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
                const label = getVariationLabel(variation);
                const price = numberOrNull(variation.price);
                const oldPrice = numberOrNull(variation.regularPrice);
                const selected = variation.id.toString() === selectedVariationId;

                return (
                  <button
                    type="button"
                    key={variation.id}
                    className={`variation-swatch ${selected ? "is-selected" : ""}`}
                    onClick={() => chooseVariation(variation)}
                    aria-pressed={selected}
                  >
                    <span
                      className="variation-swatch-dot"
                      style={{ backgroundColor: getColor(label) }}
                    />

                    {variation.image ? (
                      <img
                        src={variation.image}
                        alt={label}
                        className="variation-swatch-image"
                      />
                    ) : (
                      <span className="variation-swatch-image variation-swatch-image-empty">
                        Sin foto
                      </span>
                    )}

                    <span className="variation-swatch-content">
                      <span className="variation-swatch-name">{label}</span>

                      {oldPrice && price && oldPrice > price && (
                        <del>{formatMoney(oldPrice, currencySymbol)}</del>
                      )}

                      <strong>
                        {formatMoney(price ?? basePrice, currencySymbol)}
                      </strong>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="selected-frame-price">
          {selectedRegularPrice && selectedRegularPrice > selectedPrice && (
            <del>{formatMoney(selectedRegularPrice, currencySymbol)}</del>
          )}
          <strong>{formatMoney(selectedPrice, currencySymbol)}</strong>
          <span>Precio del armazón seleccionado</span>
        </div>

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
