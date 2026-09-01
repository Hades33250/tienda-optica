type Product = {
  name: string;
  category: string;
  price: string;
  description: string;
  features: string[];
};

const products: Record<string, Product> = {
  "armazon-clasico-negro": {
    name: "Armazón Clásico Negro",
    category: "Armazón graduable",
    price: "$1,299 MXN",
    description:
      "Armazón versátil y cómodo para uso diario. Ideal para personalizar con diferentes tipos de micas graduadas.",
    features: [
      "Diseño clásico",
      "Color negro",
      "Compatible con micas graduadas",
      "Ideal para uso diario",
    ],
  },

  "armazon-transparente": {
    name: "Armazón Transparente",
    category: "Armazón graduable",
    price: "$1,499 MXN",
    description:
      "Armazón ligero y moderno con acabado transparente. Una opción adaptable para diferentes estilos.",
    features: [
      "Diseño moderno",
      "Acabado transparente",
      "Compatible con micas graduadas",
      "Estructura ligera",
    ],
  },

  "lentes-solares-urban": {
    name: "Lentes Solares Urban",
    category: "Lentes de sol",
    price: "$1,799 MXN",
    description:
      "Lentes solares para proteger tus ojos y complementar tu estilo en exteriores.",
    features: [
      "Protección solar",
      "Diseño urbano",
      "Uso exterior",
      "Montura cómoda",
    ],
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
  const product = products[slug];

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-3xl font-bold">
          Producto no encontrado
        </h1>

        <p className="mt-4 text-slate-600">
          El producto que buscas no existe o ya no está disponible.
        </p>

        <a
          href="/"
          className="mt-8 inline-block rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white"
        >
          Volver al inicio
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-[#eaf6f5] text-8xl">
          👓
        </div>

        <section>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
            {product.category}
          </p>

          <h1 className="mt-4 text-4xl font-bold text-slate-900">
            {product.name}
          </h1>

          <p className="mt-5 text-2xl font-bold text-slate-800">
            {product.price}
          </p>

          <p className="mt-6 leading-7 text-slate-600">
            {product.description}
          </p>

          <h2 className="mt-8 text-xl font-bold">
            Características
          </h2>

          <ul className="mt-4 space-y-3 text-slate-600">
            {product.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-10 w-full rounded-lg bg-teal-700 px-6 py-4 font-bold text-white transition hover:bg-teal-800"
          >
            Personalizar mis lentes
          </button>

          <a
            href="/"
            className="mt-4 block text-center text-sm font-semibold text-teal-700"
          >
            ← Volver al catálogo
          </a>
        </section>
      </div>
    </main>
  );
}
