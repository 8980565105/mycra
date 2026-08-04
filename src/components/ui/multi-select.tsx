import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
    subLabel?: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select...", className }: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    // useEffect: React.useEffect(() => {
    //     const handleClickOutside = (e: MouseEvent) => {
    //         if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    //     };
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => document.removeEventListener("mousedown", handleClickOutside);
    // }, []) as any;
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggle = (value: string) => {
        if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
        else onChange([...selected, value]);
    };

    const remove = (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((v) => v !== value));
    };

    const selectedOptions = options.filter((o) => selected.includes(o.value));

    return (
        <div ref={ref} className={cn("relative", className)}>
            <div
                onClick={() => setOpen((p) => !p)}
                className="flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {selectedOptions.length === 0 && <span className="text-gray-400">{placeholder}</span>}
                {selectedOptions.map((opt) => (
                    <span
                        key={opt.value}
                        className="flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs"
                    >
                        {opt.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={(e) => remove(opt.value, e)} />
                    </span>
                ))}
                <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
            </div>

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-md">
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">No options</div>
                    )}
                    {options.map((opt) => {
                        const isChecked = selected.includes(opt.value);
                        return (
                            <div
                                key={opt.value}
                                onClick={() => toggle(opt.value)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-blue-50",
                                    isChecked && "bg-blue-50 text-blue-900 font-medium"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                                        isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"
                                    )}
                                >
                                    {isChecked && <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-col">
                                    <span>{opt.label}</span>
                                    {opt.subLabel && <span className="text-xs text-gray-400">{opt.subLabel}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}