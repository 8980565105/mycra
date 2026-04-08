import React, { useMemo } from "react";
import Row from "../ui/Row";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import { getImageUrl } from "../utils/helper";
import prodimg from "../../assets/shopsaree4.jpg";
import prodimg1 from "../../assets/shopsaree2.jpg";

export default function CustomerAlsoViewed({
  products = [],
  currentProductId = null,
}) {
  const recentIds = getRecentlyViewed();

  const displayList = useMemo(() => {
    const byId = products.reduce((acc, p) => {
      if (p?._id) acc[p._id] = p;
      return acc;
    }, {});
    const recent = recentIds.map((id) => byId[id]).filter(Boolean);
    return (recent.length ? recent : products)
      .filter((p) => p._id !== currentProductId)
      .slice(0, 3);
  }, [products, recentIds, currentProductId]);

  const usedSideProductIds = new Set();
  const productData = displayList.map((product) => {
    const mainImageUrl = product?.variants?.[0]?.images?.[0]
      ? getImageUrl(product.variants[0].images[0])
      : prodimg;

    const categoryId =
      product?.category_id?._id ?? product?.category_id ?? null;
    const sameCategoryProducts = products.filter((p) => {
      if (!p || !categoryId) return false;
      const pCategoryId = p?.category_id?._id ?? p?.category_id ?? null;
      return (
        p._id !== product._id &&
        pCategoryId === categoryId &&
        !usedSideProductIds.has(p._id)
      );
    });
    const sideImages = sameCategoryProducts.slice(0, 2).map((p) => {
      usedSideProductIds.add(p._id);
      const imageUrl = p?.variants?.[0]?.images?.[0]
        ? getImageUrl(p.variants[0].images[0])
        : prodimg1;
      return { imageUrl, productId: p._id };
    });

    return { ...product, mainImageUrl, sideImages };
  });

  return (
    <Row className="!max-w-[1155px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px] auto-rows-fr">
      {productData.map((product, index) => (
        <div
          key={product._id || index}
          className="bg-white rounded-[3px] box-shadow overflow-hidden p-[23px] h-full flex flex-col"
        >
          <div className="grid grid-cols-[2fr_1fr] gap-[7px] mb-[12px] aspect-[21/22]">
            <a
              href={`/products/${product._id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={product.mainImageUrl}
                alt={product?.name || product?.title || "product"}
                className="w-full h-full object-cover "
              />
            </a>

            <div className="grid grid-rows-2 gap-[7px] h-full">
              {product.sideImages.map((side, idx) => (
                <a
                  href={`/products/${side.productId}`}
                  key={side.id || side.productId || idx}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={side.imageUrl}
                    alt={`related-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
          {/* <p className="text-p mb-[5px]  mt-auto">{product?.category.name}</p> */}
          {/* <p className="text-p mb-[5px] mt-auto">
            {product?.subcategory_id?.name || "No Subcategory"}
          </p> */}
          <h3 className="text-14 sec-text-color line-clamp-2">
            {product?.name || product?.title}
          </h3>
        </div>
      ))}
    </Row>
  );
}
