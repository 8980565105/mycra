import React from "react";
import SectionHeading from "../ui/SectionHeading";
import Row from "../ui/Row";
import ArrowRight from "../icons/ArrowRight";
import shoesimg from "../../assets/shoes.png";
import winterimg from "../../assets/winter-clothes.png";
import watchimg from "../../assets/watch.png";
import earringsimg from "../../assets/earrings.png";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";
import { useNavigate } from "react-router-dom";

// ---------------- IMAGE CARD ----------------
const ImageCard = ({
  name,
  img,
  description,
  textColor = "text-black",
  category,
}) => {
  const navigate = useNavigate();
  const isWhiteText = textColor === "text-white";
  const lineColor = isWhiteText ? "bg-white" : "bg-black";
  const lineTop = isWhiteText ? "top-[30px]" : "top-[70px]";

  const handleClick = () => {
    navigate("/shop");
  };

  return (
    <div
      className="relative overflow-hidden cursor-pointer group h-full w-full"
      onClick={handleClick}
    >
      <img src={img} alt={name} className="w-full h-full object-fit" />

      <div className={`${textColor} ${lineTop} p-2 absolute left-[15px] `}>
        <span
          className={`absolute left-0 -translate-x-[20px] w-[40px] h-[1px]  ${lineColor}`}
        />

        <h3 className="text-[20px] sm:text-[30px] mt-5 font-semibold leading">
          {name}
        </h3>
        <p className="text-[12px] sm:text-[14px] flex items-center gap-1 mt-4">
          {description}
          <ArrowRight className="w-[6px] h-[11px]" />
        </p>
      </div>
    </div>
  );
};

// ---------------- STATIC DATA ----------------
const staticNewArrivals = [
  {
    name: "Earings",
    img: earringsimg,
    description: "Shop Now",
    textColor: "text-black",
  },
  {
    name: "Shoes",
    img: shoesimg,
    description: "Shop Now",
    textColor: "text-white",
  },
  {
    name: "Watch",
    img: watchimg,
    description: "shop Now",
    textColor: "text-white",
  },
  {
    name: "Winter Cloths",
    img: winterimg,
    description: "Shop Now",
    textColor: "text-black",
  },
];

// ---------------- NEW ARRIVALS SECTION ----------------
export default function NewArrivals() {
  const { products, loading } = useSelector((state) => state.products);

  const newArrivalsItem = products.length
    ? products.map((p) => ({
        id: p._id,
        name: p.category?.name ?? "Product",
        img: getImageUrl(p.images),
      }))
    : staticNewArrivals.map((item, index) => ({
        ...item,
        id: `static-${index}`,
      }));

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  const layoutConfig = [
    { col: 1, height: "h-[578px] md:h-[578px]", textColor: "text-black" },
    { col: 2, height: "h-[578px] md:h-[285px]", textColor: "text-white" },
    { col: 2, height: "h-[578px] md:h-[285px]", textColor: "text-white" },
    { col: 3, height: "h-[578px] md:h-[578px]", textColor: "text-black" },
  ];

  const groupedItems = layoutConfig.reduce((acc, config, index) => {
    const item = newArrivalsItem[index];
    if (!item) return acc;

    acc[config.col] ||= [];
    acc[config.col].push({ ...item, ...config });

    return acc;
  }, {});

  return (
    <section className="w-full py-[25px] md:py-[50px]">
      <Row className="flex flex-col items-center">
        <SectionHeading page="Home" order={3} />
      </Row>

      <Row className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {Object.entries(groupedItems).map(([col, items]) => (
          <div key={`col-${col}`} className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className={`${item.height} overflow-hidden`}>
                <ImageCard
                  name={item.name}
                  description="Shop Now"
                  img={item.img}
                  textColor={item.textColor}
                />
              </div>
            ))}
          </div>
        ))}
      </Row>
    </section>
  );
}
