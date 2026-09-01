const products = {
  "armazon-clasico-negro": {
    name: "Armazón Clásico Negro",
    category: "Armazón graduable",
    price: "$1,299 MXN",
    description:
      "Armazón clásico y versátil para uso diario. Puedes personalizarlo con diferentes tipos de micas graduadas.",
  },

  "armazon-transparente": {
    name: "Armazón Transparente",
    category: "Armazón graduable",
    price: "$1,499 MXN",
    description:
      "Diseño moderno, ligero y fácil de combinar con diferentes estilos.",
  },

  "lentes-solares-urban": {
    name: "Lentes Solares Urban",
    category: "Lentes de sol",
    price: "$1,799 MXN",
    description:
      "Lentes solares para complementar tu estilo y proteger tus ojos en exteriores.",
  },
};

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = products[slug as keyof typeof products];

  if (!product) {
    return (
      <main className="product-page">
        <h1>Producto no encontrado</h1>

        <p>
          El producto que buscas no existe o ya no está disponible.
        </p>

        <a href="/">Volver al inicio</a>
      </main>
    );
  }

  return (
    <main className="product-page">
      <a href="/" className="back-link">
        ← Volver al catálogo
      </a>

      <section className="product-detail">
        <div className="product-detail-image">
          👓
        </div>

        <div className="product-detail-content">
          <p className="product-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p className="price">{product.price}</p>

          <p className="product-description">
            {product.description}
          </p>

          <h2>Personaliza tus lentes</h2>

          <label htmlFor="lens-type">
            Tipo de mica
          </label>

          <select id="lens-type" name="lens-type">
            <option value="organica">
              Mica orgánica
            </option>

            <option value="antirreflejante">
              Mica antirreflejante
            </option>

            <option value="filtro-azul">
              Mica con filtro azul
            </option>
          </select>

          <button type="button" className="button button-primary">
            Agregar al carrito
          </button>
        </div>
      </section>
    </main>
  );
}
