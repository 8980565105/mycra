import React from "react";
import { Binoculars, Sparkles, TrendingUp, Headset } from "lucide-react";
import whysellerimg from "../../assets/whysellerimg.webp"
const features = [
  {
    icon: Binoculars,
    title: "Opportunity",
    desc: "45 crore+ of customers across 19000+ pincodes, and access to shopping festivals like The Big Billion Days, and more.",
  },
  {
    icon: Sparkles,
    title: "Ease of Doing Business",
    desc: "Create your Mycra seller account in under 10 minutes with just 1 product and a valid GSTIN number.",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    desc: "Sellers see an average 2.8X spike in growth, 2.3X more visibility, and up to 5X growth in The Big Billion Days Sale.",
  },
  {
    icon: Headset,
    title: "Additional Support",
    desc: "Account management services, exclusive training programs, business insights, catalogue/photoshoot support, and more.",
  },
];

export default function WhySellOnMycra() {
  return (
    <section className="bg-white pb-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
            Why do <span className="text-[#2874F0]">sellers love selling on Mycra?</span>
          </h2>
          <p className="mt-4 max-w-xl text-slate-600">
            45 crore+ customers across India trust{" "}
            <span className="text-[#2874F0]">Mycra.com</span> to be their number 1
            online shopping destination. It is no surprise that more than a million
            sellers trust their products to be made available 24×7 on Mycra.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[#2874F0]">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <img src={whysellerimg} alt="img" className="" />
        </div>
      </div>
    </section>
  );
}