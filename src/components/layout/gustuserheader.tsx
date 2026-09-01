import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function GustUserHeader() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { label: "Sell Online", href: "#" },
        { label: "Fees and Commission", href: "#" },
        { label: "Grow", href: "#" },
        { label: "Learn", href: "#" },
    ];

    return (
        <>
            <header className="border-b border-slate-200 relative z-40">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="flex items-center justify-center text-slate-700 hover:text-[#1D4ED8] lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1D4ED8] text-white font-bold text-lg">
                                M
                            </div>
                            <div className="leading-tight">
                                <div className="text-lg font-extrabold text-slate-900">Mycra</div>
                                <div className="-mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                                    Seller Hub
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 lg:flex">
                        {navLinks.map((link) => (
                            <a key={link.label} href={link.href} className="hover:text-[#1D4ED8]">
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-sm font-semibold text-slate-800 hover:text-[#1D4ED8]"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300"
                        >
                            Start Selling
                        </button>
                    </div>
                </div>
            </header>

            {menuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            <div
                className={`fixed left-0 top-0 z-50 h-full w-72 max-w-[80%] transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1D4ED8] text-white font-bold text-lg">
                            M
                        </div>
                        <div className="leading-tight">
                            <div className="text-lg font-extrabold text-slate-900">Mycra</div>
                            <div className="-mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                                Seller Hub
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="text-slate-500 hover:text-slate-800"
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                <nav className="flex flex-col gap-1 px-3 py-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-[#1D4ED8]"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="mt-2 flex flex-col gap-3 border-t border-slate-200 px-5 py-5">
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            navigate("/login");
                        }}
                        className="w-full rounded-md border border-slate-300 py-2.5 text-sm font-semibold text-slate-800 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            navigate("/register");
                        }}
                        className="w-full rounded-md bg-amber-400 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-300"
                    >
                        Start Selling
                    </button>
                </div>
            </div>
        </>
    )
}