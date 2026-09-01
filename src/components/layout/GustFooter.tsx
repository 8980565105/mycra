import React from "react";
import {
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Twitter,
    ArrowUp,
    Link,
} from "lucide-react";
import googlePlay from "../../assets/googlePlay.png"
import appleStore from "../../assets/appleStore.png"

const categories = [
    ["Sell Mobile Online", "Sell Shoes Online", "Sell Paintings Online", "Sell Beauty Products Online"],
    ["Sell Clothes Online", "Sell Jewellery Online", "Sell Watch Online", "Sell Toys Online"],
    ["Sell Sarees Online", "Sell Tshirts Online", "Sell Books Online", "Sell Appliances Online"],
    ["Sell Electronics Online", "Sell Furniture Online", "Sell Home Products Online", "Sell Shirts Online"],
    ["Sell Women Clothes Online", "Sell Makeup Online", "Sell Kurtis Online", "Sell Indian Clothes Online"],
];

const linkColumns = [
    {
        title: "Sell Online",
        links: ["Create Account", "List Products", "Storage & Shipping", "Fees & Commission", "Help & Support"],
    },
    {
        title: "Grow Your Business",
        links: ["Insights & Tools", "Flipkart Ads", "Flipkart Value Services", "Shopping Festivals"],
    },
    {
        title: "Learn More",
        links: ["FAQs", "Seller Success Stories", "Seller Blogs"],
    },
];

export default function GustFooter() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <footer className="relative bg-[#3a3a3a] text-slate-300">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <h2 className="text-center text-3xl font-extrabold text-white md:text-4xl">
                    Popular categories to sell across India
                </h2>

                <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((col, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            {col.map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-sm text-slate-300 hover:text-white hover:underline"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="my-10 border-t border-slate-600" />

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {linkColumns.map((col) => (
                        <div key={col.title}>
                            <h3 className="mb-4 text-base font-bold text-white">{col.title}</h3>
                            <ul className="flex flex-col gap-3">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-slate-300 hover:text-white hover:underline">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                   
                    <div>
                        <h3 className="mb-4 text-base font-bold text-white">Download Mobile App</h3>
                       
                        <div className="flex flex-col gap-3">
                            <a
                                href="https://play.google.com/store/games?hl=en_IN&pli=1"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={googlePlay}
                                    alt="Google Play"
                                    className="cursor-pointer"
                                />
                            </a>
                            <a
                                href="https://www.apple.com/in/app-store/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={appleStore}
                                    alt="App Store"
                                    className="cursor-pointer"
                                />
                            </a>
                        </div>

                        <h3 className="mb-4 mt-6 text-base font-bold text-white">Stay Connected</h3>
                        <div className="flex gap-3">
                            {[Facebook, Instagram, Linkedin, Youtube, Twitter].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#3a3a3a] hover:bg-slate-200"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-600">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-400 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1D4ED8] text-xs font-bold text-white">
                            M
                        </div>
                        <span>© 2026 Mycra. All Rights Reserved</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Use</a>
                    </div>
                </div>
            </div>

            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg hover:bg-slate-100"
            >
                <ArrowUp size={16} />
                Go to Top
            </button>
        </footer>
    );
}