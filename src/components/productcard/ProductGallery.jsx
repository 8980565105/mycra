import { cloneElement, useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import { getImageUrl } from "../utils/helper";
export default function ProductGallery({
  product,
  activeVariant,
  selectedColor,
  setSelectedColor,
}) {
  const [currentImage, setCurrentImage] = useState(null);

  const variants = product?.variants || [];

  const colorOptions = useMemo(() => {
    const seen = new Map();
    variants.forEach((v) => {
      if (Array.isArray(v.attributes) && v.attributes.length > 0) {
        const colorAttr = v.attributes.find((a) => {
          const code =
            a.attributeId?.code ||
            a.attributeCode ||
            a.code ||
            a.name ||
            a.attributeId?.name;
          return code && code.toString().toLowerCase() === "color";
        });
        if (colorAttr) {
          const valObj = colorAttr.valueId || colorAttr.valueObj || {};
          const id = valObj._id || colorAttr.valueId || colorAttr._id;
          const name =
            valObj.value ||
            valObj.name ||
            colorAttr.value ||
            (typeof colorAttr.valueId === "string" ? colorAttr.valueId : null);
          const hex =
            valObj.colorHex ||
            valObj.code ||
            colorAttr.colorHex ||
            colorAttr.code ||
            name ||
            "#000000";
          if (id && name) {
            seen.set(String(id), {
              id: String(id),
              name: String(name),
              code: hex,
            });
            return;
          }
        }
      }

      if (v.color_id?._id) {
        seen.set(String(v.color_id._id), {
          id: String(v.color_id._id),
          name: v.color_id.name,
          code: v.color_id.code,
        });
      }
    });
    return Array.from(seen.values());
  }, [variants]);

  const fullImageUrls = useMemo(() => {
    if (activeVariant?.images?.length > 0) {
      return activeVariant.images.map((img) => getImageUrl(img));
    }
    if (product?.images?.length > 0) {
      return product.images.map((img) => getImageUrl(img));
    }
    return [];
  }, [activeVariant, product]);

  useEffect(() => {
    if (fullImageUrls.length > 0) {
      setCurrentImage(fullImageUrls[0]);
    } else {
      setCurrentImage(null);
    }
  }, [activeVariant?._id]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    customPaging: () => (
      <button
        type="button"
        className="!block !relative !shrink-0 !w-[9px] !h-[9px] !min-w-0 !min-h-0 !m-0 !p-0 !rounded-full !border !border-solid !border-[#D2AF9F] !bg-transparent !opacity-100 !text-[0px] !leading-none !outline-none [&::before]:!hidden [&::before]:!content-none [&::before]:!w-0 [&::before]:!h-0 [&::before]:!m-0 [&::before]:!p-0 [&::before]:!opacity-0"
      />
    ),

    appendDots: (dots) => (
      <div className="absolute bottom-[15px] left-0 w-full z-20">
        <ul className="!flex !items-center !justify-center !gap-[7px] !m-0 !p-0 !list-none">
          {dots.map((dot, index) => {
            const isActive = dot.props.className?.includes("slick-active");
            const button = dot.props.children;

            return cloneElement(
              dot,
              {
                key: index,
                className: `!flex !items-center !justify-center !relative !shrink-0 !m-0 !p-0 !list-none ${
                  isActive
                    ? "!w-[9px] !h-[9px]"
                    : "!w-[9px] !h-[9px]"
                }`,
              },
              cloneElement(button, {
                className: `!block !relative !shrink-0 !min-w-0 !min-h-0 !m-0 !p-0 !rounded-full !border !border-solid !opacity-100 !text-[0px] !leading-none !outline-none [&::before]:!hidden [&::before]:!content-none [&::before]:!w-0 [&::before]:!h-0 [&::before]:!m-0 [&::before]:!p-0 [&::before]:!opacity-0 ${
                  isActive
                    ? "!w-[9px] !h-[9px] !bg-[var(--primary-color)] !border-[var(--primary-color)]"
                    : "!w-[9px] !h-[9px] !bg-transparent !border-[#D2AF9F]"
                }`,
              })
            );
          })}
        </ul>
      </div>
    ),
};
  return (
    <div className="flex flex-col md:flex-row gap-[30px] items-start">
    <div className="w-full hidden md:flex md:sticky md:top-[110px] self-start gap-[20px] z-10">
      <div
        className="hidden md:flex md:flex-col gap-[20px] h-[727px] overflow-y-auto hide-scrollbar p-1"
        style={{
          scrollBehavior: "smooth",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {fullImageUrls.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            onClick={() => setCurrentImage(img)}
            className={`w-[160px] h-[208px] object-cover rounded-[3px] cursor-pointer transition-all duration-200 ${
              currentImage === img
                ? "ring-1 ring-[var(--primary-color)] scale-[1.02]"
                : "opacity-50 hover:opacity-100"
            }`}
          />
        ))}
      </div>

      <div className="hidden md:block flex-1">
        {currentImage ? (
          <img
            key={currentImage}
            src={currentImage}
            alt="Main product"
            className="w-full h-[727px] rounded-[10px] object-fill transition-all duration-300 ease-in-out"
          />
        ) : (
          <div className="w-full h-[727px] rounded-[10px] bg-gray-100 flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}

        <div className="flex gap-[8px] mt-[30px] justify-center">
          {colorOptions.map((color) => (
            <span
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className="w-[24px] h-[24px] rounded-full shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] transition-all cursor-pointer"
              style={{ backgroundColor: color.code }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
      <div className="block md:hidden w-full rounded-[10px]">
        {fullImageUrls.length > 0 ? (
          <Slider {...sliderSettings}>
            {fullImageUrls.map((img, index) => (
              <div key={index}>
                <img
                  src={img}
                  alt={`Slide ${index}`}
                  className="w-full h-300px sm:h-[500px] object-cover"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}
      </div>
    </div>
  );
}
