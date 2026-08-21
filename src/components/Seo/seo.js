import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image }) => {
  const brand = "Mycra";
  const finalTitle = title ? `${brand} | ${title}` : brand;
  const finalDescription =
    description ||
    "Mycra - Explore our curated collection of stylish clothing and accessories.";

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
