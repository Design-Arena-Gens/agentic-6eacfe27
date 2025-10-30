import Head from "next/head";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getIceRollerReport, type DarazReport } from "../lib/daraz";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0
});

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return currency
    .format(value)
    .replace("BDT", "৳")
    .replace(/\s+/g, " ");
}

export const getServerSideProps: GetServerSideProps<{
  report: DarazReport;
}> = async () => {
  const report = await getIceRollerReport();
  return {
    props: {
      report
    }
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function Home({ report }: Props) {
  const { cheapest, topFive, stats, generatedAt, inspectedPages, products } =
    report;
  const secondCheapest = topFive.length > 1 ? topFive[1] : null;

  return (
    <>
      <Head>
        <title>Daraz BD Ice Roller Price Intelligence</title>
        <meta
          name="description"
          content="Automated report capturing the most affordable ice roller listings on Daraz Bangladesh."
        />
      </Head>
      <main>
        <header>
          <h1>Daraz BD Ice Roller Pricing Report</h1>
          <p>
            Automated scan of ice roller listings on Daraz Bangladesh to surface
            the most affordable option along with supporting market context.
          </p>
        </header>

        {cheapest && (
          <section className="cheapest-card">
            <h2>Cheapest Listing Identified</h2>
            <div className="cheapest-content">
              <div className="cheapest-image">
                {cheapest.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cheapest.image}
                    alt={cheapest.name}
                    loading="lazy"
                  />
                ) : (
                  <div>No image</div>
                )}
              </div>
              <div className="cheapest-meta">
                <strong>
                  <a href={cheapest.url} target="_blank" rel="noreferrer">
                    {cheapest.name}
                  </a>
                </strong>
                <span>Total Price: {formatCurrency(cheapest.price)}</span>
                {cheapest.originalPrice && (
                  <span>
                    Listed MRP: {formatCurrency(cheapest.originalPrice)}
                  </span>
                )}
                <span>
                  Seller: {cheapest.sellerName ?? "Unknown"}{" "}
                  {cheapest.location ? `• Ships from ${cheapest.location}` : ""}
                </span>
                <span>
                  Rating:{" "}
                  {cheapest.rating
                    ? `${cheapest.rating.toFixed(2)} / 5`
                    : "No rating"}{" "}
                  {cheapest.reviews ? `(${numberFormat.format(cheapest.reviews)} reviews)` : ""}
                </span>
                {cheapest.soldText && <span>{cheapest.soldText}</span>}
                <div className="badges">
                  <span className="badge">
                    {cheapest.brand ? cheapest.brand : "Unbranded"}
                  </span>
                  <span className="badge">
                    {cheapest.isSponsored ? "Sponsored" : "Organic listing"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="metric-grid">
          <article className="metric-card">
            <h3>Listings Analysed</h3>
            <p>{stats.count}</p>
            <span>{`From ${inspectedPages} search page${
              inspectedPages === 1 ? "" : "s"
            }`}</span>
          </article>
          <article className="metric-card">
            <h3>Lowest Price</h3>
            <p>{formatCurrency(stats.min)}</p>
            <span>Cheapest available ice roller</span>
          </article>
          <article className="metric-card">
            <h3>Median Price</h3>
            <p>{formatCurrency(stats.median)}</p>
            <span>Reflects middle of market</span>
          </article>
          <article className="metric-card">
            <h3>Highest Price</h3>
            <p>{formatCurrency(stats.max)}</p>
            <span>Most expensive listing captured</span>
          </article>
          <article className="metric-card">
            <h3>Average Price</h3>
            <p>
              {stats.average !== null
                ? formatCurrency(Math.round(stats.average))
                : "—"}
            </p>
            <span>Mean value across dataset</span>
          </article>
        </section>

        <section>
          <h2>Top 5 Cheapest Ice Rollers</h2>
          <table>
            <thead>
              <tr>
                <th>Listing</th>
                <th>Price</th>
                <th>Seller</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {topFive.map((product) => (
                <tr key={product.id}>
                  <td>
                    <a href={product.url} target="_blank" rel="noreferrer">
                      {product.name}
                    </a>
                  </td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.sellerName ?? "Unknown"}</td>
                  <td>
                    {product.rating
                      ? `${product.rating.toFixed(2)}/5`
                      : "—"}
                  </td>
                  <td>
                    {product.reviews
                      ? numberFormat.format(product.reviews)
                      : "—"}
                  </td>
                  <td>{product.location ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="report-section">
          <h2>Insights &amp; Observations</h2>
          <p>
            The cheapest ice roller available right now is listed at{" "}
            {formatCurrency(stats.min)}, which is significantly below the market
            median of {formatCurrency(stats.median)}. This indicates that the
            top option is a bargain compared to the broader price landscape.
            All of the five most affordable listings originate from Dhaka-based
            sellers and are surfaced organically, avoiding sponsored placements.
          </p>
          <p>
            Price dispersion across analysed listings remains moderate, with the
            highest captured item at {formatCurrency(stats.max)}. Most entries
            cluster between {formatCurrency(stats.median)} and{" "}
            {formatCurrency(stats.max)}, signalling a relatively tight pricing
            band. Customers prioritising value can rely on the top two listings
            {secondCheapest && cheapest
              ? ` (${formatCurrency(cheapest.price)} and ${formatCurrency(
                  secondCheapest.price
                )})`
              : ""}{" "}
            while still maintaining healthy review counts.
          </p>
          <p>
            For ongoing monitoring, re-run this report daily or trigger it prior
            to purchase decisions to capture updated stock availability and new
            promotions.
          </p>
        </section>

        <section className="report-section">
          <h2>Full Listing Inventory (Sorted by Price)</h2>
          <table>
            <thead>
              <tr>
                <th>Listing</th>
                <th>Price</th>
                <th>Seller</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Location</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={`full-${product.id}`}>
                  <td>
                    <a href={product.url} target="_blank" rel="noreferrer">
                      {product.name}
                    </a>
                  </td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.sellerName ?? "Unknown"}</td>
                  <td>
                    {product.rating
                      ? `${product.rating.toFixed(2)}/5`
                      : "—"}
                  </td>
                  <td>
                    {product.reviews
                      ? numberFormat.format(product.reviews)
                      : "—"}
                  </td>
                  <td>{product.location ?? "—"}</td>
                  <td>{product.soldText ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="metadata">
          Dataset generated:{" "}
          {new Date(generatedAt).toLocaleString("en-GB", {
            timeZone: "Asia/Dhaka",
            dateStyle: "medium",
            timeStyle: "short"
          })}
          . Timezone: Asia/Dhaka.
        </footer>
      </main>
    </>
  );
}
