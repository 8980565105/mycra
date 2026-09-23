import React, { useEffect, useMemo } from "react";
// import SectionHeading from "../ui/SectionHeading";
import Row from "../ui/Row";
import ArrowRight from "../icons/ArrowRight";
import shoesimg from "../../assets/shoes.png";
import winterimg from "../../assets/winter-clothes.png";
import watchimg from "../../assets/watch.png";
import earringsimg from "../../assets/earrings.png";
import { useDispatch, useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";
import { useNavigate } from "react-router-dom";
import FlowerIcon from "../icons/FlowerIcon";
import { fetchtypes } from "../../features/types/typeThunk";

const ImageCard = ({
  name,
  typeName,
  img,
  description,
  textColor = "text-black",
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
          {typeName || "Product Type"}
        </h3>
        <p className="text-[12px] sm:text-[14px] flex items-center gap-1 mt-4">
          {description}
          <ArrowRight className="w-[6px] h-[11px]" />
        </p>
      </div>
    </div>
  );
};

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

export default function NewArrivals() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const { types = [] } = useSelector((state) => state.types);

  const newarrivalProducts = useMemo(() => {
    return (products || []).filter(
      (product) => product?.status === "active" && product?.is_new_arrival === true
    );
  }, [products]);

    useEffect(() => {
      dispatch(fetchtypes());
    }, [dispatch]);
    const typeMap = useMemo(() => {
    return types.reduce((acc, type) => {
      if (type?._id) {
        acc[String(type._id)] = type?.name || "";
      }

      return acc;
    }, {});
  }, [types]);


  const newArrivalsItem = newarrivalProducts.map((p) => {
      const typeId = p?.type_id?._id ?? p?.type_id ?? null;
      const typeName = p?.type_id?.name ?? typeMap[String(typeId)] ?? "Product Type";

      return {
        id: p._id,
        name: p?.category?.name ?? "Product",
        typeName,
        img: getImageUrl(p?.images),
      };
      })
    // : staticNewArrivals.map((item, index) => ({
    //     ...item,
    //     id: `static-${index}`,
    //   }));

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  const layoutConfig = [
    { col: 1, height: "h-[500px] md:h-[578px]", textColor: "text-black" },
    { col: 2, height: "h-[250px] sm:h-[300px] md:h-[285px]", textColor: "text-white" },
    { col: 2, height: "h-[250px] sm:h-[300px] md:h-[285px]", textColor: "text-white" },
    { col: 3, height: "h-[500px] md:h-[578px]", textColor: "text-black" },
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
      <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
        <div className="w-[18px] md:w-[50px] border-t border-black"></div>

        <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
          <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
            New Arrivals
          </h2>
          <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
        </div>

        <div className="w-[18px] md:w-[50px] border-t border-black"></div>
      </div>

      

      <Row className="grid grid-cols-1 md:grid-cols-[1fr_1.36fr_1fr] gap-2">
        {Object.entries(groupedItems).map(([col, items]) => (
          <div key={`col-${col}`} className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className={`${item.height} overflow-hidden`}>
                <ImageCard
                  name={item.name}
                  typeName={item.typeName}
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