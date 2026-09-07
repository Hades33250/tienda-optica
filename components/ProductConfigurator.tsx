"use client";

import { useMemo, useState } from "react";

export type ProductOption = {
  id: number;
  name?: string;
  price?: string;
  regularPrice?: string;
  stockStatus?: string;
  image?: string;
 attributes?: {
  name?: string;
  slug?: string;
  option?: string;
  value?: string;
}[];
};

type LensOption = {
  id: string;
  name: string;
  price: number;
};

type ProductConfiguratorProps = {
  productName: string;
  productUrl: string;
  basePrice: number;
  currencySymbol?: string;
  variations?: ProductOption[];
};

const lensOptions: LensOption[] = [
  {
    id: "cr39-antirreflejante",
    name: "CR-39 monofocal con antirreflejante",
    price: 800,
  },
  {
    id: "cr39-filtro-azul",
    name: "CR-39 monofocal con filtro azul",
    price: 1200,
  },
  {
    id: "cr39-fotocromatico",
    name: "CR-39 fotocromático con filtro azul",
    price: 1500,
  },
  {
    id: "policarbonato-antirreflejante",
    name: "Policarbonato con antirreflejante",
    price: 1000,
  },
  {
    id: "policarbonato-filtro-azul",
    name: "Policarbonato con filtro azul",
    price: 1400,
  },
  {
    id: "alto-indice",
    name: "Alto índice",
    price: 1500,
  },
  {
    id: "bifocal-ft-antirreflejante",
    name: "Bifocal FT con antirreflejante",
    price: 1600,
  },
  {
    id: "bifocal-ft-filtro-azul",
    name: "Bifocal FT con filtro azul",
    price: 1800,
  },
  {
    id: "bifocal-ft-fotocromatico",
    name: "Bifocal FT fotocromático con filtro azul",
    price: 2200,
  },
  {
    id: "bifocal-blend-antirreflejante",
    name: "Bifocal Blend con antirreflejante",
    price: 1300,
  },
  {
    id: "bifocal-blend-filtro-azul",
    name: "Bifocal Blend con filtro azul",
    price: 1900,
  },
  {
    id: "bifocal-blend-fotocromatico",
    name: "Bifocal Blend fotocromático con filtro azul",
    price: 2300,
  },
  {
    id: "progresivo-antirreflejante",
    name: "Progresivo con antirreflejante",
    price: 1900,
  },
  {
    id: "progresivo-filtro-azul",
    name: "Progresivo con filtro azul",
    price: 2100,
  },
  {
    id: "progresivo-fotocromatico",
    name: "Progresivo fotocromático con filtro azul",
    price: 2500,
  },
];

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

function variationLabel(variation: ProductOption) {
  const attributes = variation.attributes
    ?.map((attribute) => {
      const attributeName =
        attribute.name ||
        (attribute as { slug?: string }).slug ||
        "Atributo";

      const attributeValue =
        attribute.option ||
        (attribute as { value?: string }).value ||
        "";

      if (!attributeValue || attributeValue === "undefined") {
        return "";
      }

      return `${attributeName}: ${attributeValue}`;
    })
    .filter(Boolean)
    .join(" · ");

  return decodeHtml(
    attributes || variation.name || `Opción ${variation.id}`
  );
}

function parseVariationPrice(value?: string) {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return numericValue;
}

export default function ProductConfigurator({
  productName,
  productUrl,
  basePrice,
  currencySymbol = "$",
  variations = [],
}: ProductConfiguratorProps) {
  const availableVariations = variations.filter(
    (variation) => variation.stockStatus !== "outofstock"
  );

  const [purchaseType, setPurchaseType] = useState<"frame" | "prescription">(
    "frame"
  );
  const [selectedLensId, setSelectedLensId] = useState("");
  const [selectedVariationId, setSelectedVariationId] = useState(
    availableVariations[0]?.id?.toString() || ""
  );
  const [needsExam, setNeedsExam] = useState(false);

  const selectedLens = lensOptions.find(
    (option) => option.id === selectedLensId
  );

  const selectedVariation = availableVariations.find(
    (variation) => variation.id.toString() === selectedVariationId
  );

  const selectedVariationPrice = parseVariationPrice(
    selectedVariation?.price
  );

  const framePrice = selectedVariationPrice ?? basePrice;
  const lensPrice =
    purchaseType === "prescription" ? selectedLens?.price || 0 : 0;
  const total = framePrice + lensPrice;

  const whatsappUrl = useMemo(() => {
    const lines = [
      "Hola, quiero solicitar información sobre unos lentes.",
      "",
      `Armazón: ${decodeHtml(productName)}`,
      selectedVariation
        ? `Variación: ${variationLabel(selectedVariation)}`
        : "Variación: No aplica",
      `Modalidad: ${
        purchaseType === "prescription"
          ? "Armazón con lentes graduados"
          : "Solo armazón"
      }`,
      purchaseType === "prescription"
        ? `Mica: ${selectedLens?.name || "Por elegir"}`
        : "Mica: No aplica",
      `Precio armazón: ${formatMoney(framePrice, currencySymbol)}`,
      purchaseType === "prescription"
        ? `Precio mica: ${formatMoney(lensPrice, currencySymbol)}`
        : "Precio mica: $0.00 MXN",
      `Total estimado: ${formatMoney(total, currencySymbol)}`,
      `Examen visual: ${
        needsExam ? "Sí, deseo agendarlo" : "No por ahora"
      }`,
      "",
      `Producto: ${productUrl}`,
    ];

    return `https://wa.me/525618452614?text=${encodeURIComponent(
      lines.join("\n")
    )}`;
  }, [
    currencySymbol,
    framePrice,
    lensPrice,
    needsExam,
    productName,
    productUrl,
    purchaseType,
    selectedLens?.name,
    selectedVariation,
    total,
  ]);

  return (
    <section className="lens-configurator">
      <h2>Personaliza tus lentes</h2>

      {availableVariations.length > 0 && (
        <div className="configurator-field">
          <label htmlFor="frame-variation">Color o variación</label>

          <select
            id="frame-variation"
            value={selectedVariationId}
            onChange={(event) => setSelectedVariationId(event.target.value)}
          >
            {availableVariations.map((variation) => {
              const variationPrice = parseVariationPrice(variation.price);

              return (
                <option key={variation.id} value={variation.id}>
                  {variationLabel(variation)}
                  {variationPrice !== null
                    ? ` — ${formatMoney(variationPrice, currencySymbol)}`
                    : ""}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <fieldset className="configurator-field">
        <legend>¿Cómo deseas comprarlo?</legend>

        <label className="configurator-choice">
          <input
            type="radio"
            name="purchase-type"
            value="frame"
            checked={purchaseType === "frame"}
            onChange={() => setPurchaseType("frame")}
          />
          Solo armazón
        </label>

        <label className="configurator-choice">
          <input
            type="radio"
            name="purchase-type"
            value="prescription"
            checked={purchaseType === "prescription"}
            onChange={() => setPurchaseType("prescription")}
          />
          Armazón con lentes graduados
        </label>
      </fieldset>

      {purchaseType === "prescription" && (
        <div className="configurator-field">
          <label htmlFor="lens-type">Tipo de mica y tratamiento</label>

          <select
            id="lens-type"
            value={selectedLensId}
            onChange={(event) => setSelectedLensId(event.target.value)}
          >
            <option value="">Selecciona una opción</option>

            {lensOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} — {formatMoney(option.price, currencySymbol)}
              </option>
            ))}
          </select>

          <p className="configurator-note">
            El precio de la mica ya incluye el tratamiento indicado.
          </p>
        </div>
      )}

      <label className="configurator-choice configurator-exam">
        <input
          type="checkbox"
          checked={needsExam}
          onChange={(event) => setNeedsExam(event.target.checked)}
        />
        Quiero agendar un examen visual
      </label>

      <div className="configurator-total" aria-live="polite">
        <div>
          <span>Armazón</span>
          <strong>{formatMoney(framePrice, currencySymbol)}</strong>
        </div>

        {purchaseType === "prescription" && (
          <div>
            <span>Mica seleccionada</span>
            <strong>{formatMoney(lensPrice, currencySymbol)}</strong>
          </div>
        )}

        <div className="configurator-total-final">
          <span>Total estimado</span>
          <strong>{formatMoney(total, currencySymbol)}</strong>
        </div>
      </div>

      {purchaseType === "prescription" && !selectedLens && (
        <p className="configurator-warning">
          Selecciona un tipo de mica para completar tu cotización.
        </p>
      )}

      <a
        className="button button-primary configurator-whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
      >
        Solicitar cotización por WhatsApp
      </a>

      <p className="configurator-disclaimer">
        El total es estimado y puede confirmarse después de revisar tu
        graduación.
      </p>
    </section>
  );
}
