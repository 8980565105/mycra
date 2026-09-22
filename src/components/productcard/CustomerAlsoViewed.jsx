import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Row from "../ui/Row";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import { getImageUrl } from "../utils/helper";
import { fetchtypes } from "../../features/types/typeThunk";
import prodimg1 from "../../assets/default_prod.jpg";

export default function CustomerAlsoViewed({
  products = [],
  currentProductId = null,
}) {
  const dispatch = useDispatch();
  const recentIds = getRecentlyViewed();
  const { types = [] } = useSelector((state) => state.types);

  useEffect(() => {
    dispatch(fetchtypes());
  }, [dispatch]);

  const typeMap = useMemo(() => {
    return types.reduce((acc, type) => {
      if (type?._id) {
        acc[String(type._id)] = type;
      }
      return acc;
    }, {});
  }, [types]);

  const currentProduct = useMemo(() => {
    return products.find(
      (product) => String(product?._id) === String(currentProductId)
    );
  }, [products, currentProductId]);

  const currentCategoryId = currentProduct?.category_id?._id ?? currentProduct?.category_id ?? null;

  const categoryProducts = useMemo(() => {
    if (!currentCategoryId) {
      return [];
    }

    return products.filter((product) => {
      if (!product?._id) {
        return false;
      }

      const productCategoryId = product?.category_id?._id ?? product?.category_id ?? null;

      return (
        String(productCategoryId) === String(currentCategoryId) &&
        String(product._id) !== String(currentProductId)
      );
    });
  }, [products, currentCategoryId, currentProductId]);

  const orderedCategoryProducts = useMemo(() => {
    if (!categoryProducts.length) {
      return [];
    }

    const productMap = categoryProducts.reduce(
      (acc, product) => {
        acc[String(product._id)] = product;
        return acc;
      },
      {}
    );

    const recentProducts = recentIds
      .map((id) => productMap[String(id)])
      .filter(Boolean);

    const recentIdsSet = new Set(
      recentProducts.map((product) => String(product._id))
    );

    const remainingProducts =  categoryProducts.filter(
        (product) => !recentIdsSet.has(
            String(product._id)
          )
      );

    return [...recentProducts,...remainingProducts];
  }, [categoryProducts, recentIds]);

  const productData = useMemo(() => {
    const usedProductIds = new Set();
    const cards = [];
    for (const product of orderedCategoryProducts) {
      if (cards.length >= 3) {
        break;
      }

      if (!product?._id) {
        continue;
      }

      const mainProductId = String(
        product._id
      );

      if (usedProductIds.has(mainProductId)) {
        continue;
      }

      const categoryId = product?.category_id?._id ?? product?.category_id ?? null;
      const typeId = product?.type_id?._id ?? product?.type_id ?? null;

      const sameTypeProducts = products.filter((relatedProduct) => {
          if (!relatedProduct?._id) {
            return false;
          }

          const relatedProductId = String(
            relatedProduct._id
          );

          const relatedCategoryId = relatedProduct?.category_id?._id ?? relatedProduct?.category_id ?? null;
          const relatedTypeId = relatedProduct?.type_id?._id ?? relatedProduct?.type_id ?? null;

          return (
            relatedProductId !== mainProductId &&
            String(relatedCategoryId) === String(categoryId) &&
            String(relatedTypeId) === String(typeId) &&
            !usedProductIds.has(
              relatedProductId
            )
          );
        });

      const selectedSideProducts = sameTypeProducts.slice(0, 2);

      usedProductIds.add(mainProductId);

      const sideImages = selectedSideProducts.map(
          (relatedProduct) => {
            const relatedProductId = String(relatedProduct._id);

            usedProductIds.add(relatedProductId);

            const image = relatedProduct?.variants?.[0] ?.images?.[0];

            return {
              imageUrl: image ? getImageUrl(image) : prodimg1,
              productId: relatedProduct._id,
              slug: relatedProduct.slug,
              isDefault: false,
            };
          }
        );

      const relatedBrands = products.filter((relatedProduct) => {
          const relatedCategoryId = relatedProduct?.category_id?._id ?? relatedProduct?.category_id ?? null;
          const relatedTypeId = relatedProduct?.type_id?._id ?? relatedProduct?.type_id ?? null;

          return (
            String(relatedCategoryId) === String(categoryId) &&
            String(relatedTypeId) === String(typeId)
          );
        })
        .map(
          (relatedProduct) => relatedProduct?.variants?.[0]?.brand_id?.name
        )
        .filter(Boolean);

      const uniqueBrands = [...new Set(relatedBrands)];
      const mainImage = product?.variants?.[0]?.images?.[0];
      const mainImageUrl = mainImage ? getImageUrl(mainImage) : prodimg1;

      cards.push({ ...product, mainImageUrl, sideImages, uniqueBrands });
    }

    return cards;
  }, [ products, orderedCategoryProducts ]);

  return (
    <Row className="!max-w-[1155px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px] auto-rows-fr">
      {productData.map((product, index) => (
        <div
          key={product._id || index}
          className="bg-white rounded-[3px] box-shadow overflow-hidden p-[23px] h-full min-h-0 flex flex-col"
        >
          <div className="grid grid-cols-[1.8fr_1.2fr] gap-[7px] mb-[12px] aspect-[99/100] min-h-0 overflow-hidden">
            <a
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block min-h-0 overflow-hidden"
            >
              <img
                src={product.mainImageUrl}
                alt={product?.name || product?.title || "product"}
                className="w-full h-full object-fit block"
              />
            </a>
            <div className="grid grid-rows-2 gap-[7px] min-h-0">
              {[0, 1].map((idx) => {
                const side = product.sideImages?.[idx];

                if (!side) {
                  return (
                    <div key={`default-${idx}`} className="block min-h-0 overflow-hidden">
                      <img src={prodimg1} alt="default product" className="w-full h-full object-fit block" />
                    </div>
                  );
                }

                return (
                  <a 
                    href={`/products/${side.slug || side.productId}`} 
                    key={side.productId || idx} 
                    target="_blank" 
                    className="block min-h-0 overflow-hidden"
                  >
                    <img src={side.imageUrl || prodimg1} alt={`related-${idx + 1}`} className="w-full h-full object-fit block" />
                  </a>
                );
              })}
            </div>
          </div>
          <p className="text-p mb-[8px]">
            {typeMap[
              String(product?.type_id?._id ?? product?.type_id ?? "")
            ]?.name || "No Type"}
          </p>
          <h3 className="text-14 sec-text-color w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">
            {product?.uniqueBrands?.length
              ? product.uniqueBrands.join(", ")
              : "No Brand"}
          </h3>
        </div>
      ))}
    </Row>
  );
}