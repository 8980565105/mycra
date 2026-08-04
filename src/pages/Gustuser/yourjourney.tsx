import React from "react";
import create from "../../assets/crate.svg"
import list from "../../assets/listing.svg"
import order from "../../assets/order.svg"
import payment from "../../assets/payment.svg"
import sipment from "../../assets/sipment.svg"

const steps = [
    {
        title: "Create",
        desc: "Register in just 10 mins with valid GST, address, & bank details",
        image: create,
    },
    {
        title: "List",
        desc: "List your products (min 1 no.) that you want to sell on Mycra.",
        image: list,
    },
    {
        title: "Orders",
        desc: "Receive orders from over 45 crore+ Mycra customers.",
        image: order,
    },
    {
        title: "Shipment",
        desc: "Mycra ensures stress free delivery of your products",
        image: payment,
    },
    {
        title: "Payment",
        desc: "Receive payment 7 days* from the date of dispatch of your order",
        image: sipment,
    },
];

export default function YourJourney() {
    return (
        <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-6">
                <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                    Your <span className="text-[#2874F0]">Journey</span> on Mycra
                </h2>
                <p className="mt-2 max-w-2xl text-slate-500">
                    Starting your online business with Mycra is easy. 14 lakh+ sellers
                    trust Mycra with their business
                </p>

                <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                    {steps.map((step) => (
                        <div key={step.title}>
                            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-sky-50">
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    className="h-full w-full object-contain p-4"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <button className="rounded-md border border-[#2874F0] px-6 py-2.5 text-sm font-semibold text-[#2874F0] hover:bg-sky-50">
                        Download Launch Kit
                    </button>
                </div>
            </div>
        </section>
    );
}