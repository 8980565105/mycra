import React from "react";
import { Package, TrendingUp } from "lucide-react";
import hero from "../../assets/hero banner.webp"

export default function Hero() {
    const stats = [
        { value: "14 Lakh+", label: "Seller community" },
        { value: "24x7", label: "Online Business" },
        { value: "7", label: "days* payment" },
        { value: "19000+", label: "Pincodes served" },
    ];

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-40 via-white to-sky-40">


            <div className="mx-auto max-w-6xl ">
                <img src={hero} alt="hero banner"
                    className="w-full h-auto orject-contant" />
            </div>

            <div className="mx-auto max-w-6xl px-6 my-5">
                <div className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                    <ul className="flex flex-col divide-y divide-slate-200 py-6 sm:flex-row sm:divide-y-0 sm:py-8">
                        {stats.map((stat, i) => (
                            <React.Fragment key={stat.label}>
                                <li className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-center sm:py-0">
                                    <div className="text-2xl font-extrabold text-[#2874F0] md:text-3xl">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-slate-600">{stat.label}</div>
                                </li>
                                {i < stats.length - 1 && (
                                    <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            </div>

        </section>
    );
}