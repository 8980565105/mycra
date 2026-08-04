import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBasePath } from "@/hooks/useBasePath";
import { getUserTracking } from "@/features/users/usersThunk";

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
                {icon}
                <span>{title}</span>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Row({ label, value, valueClass = "" }: { label: string; value: React.ReactNode; valueClass?: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-medium text-gray-900 ${valueClass}`}>{value}</span>
        </div>
    );
}

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

const daysAgoLabel = (n: number | null) => (n === null ? "N/A" : n === 0 ? "Today" : `${n} day${n > 1 ? "s" : ""} ago`);

export default function UserView() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        dispatch(getUserTracking(id))
            .unwrap()
            .then((res: any) => setData(res))
            .catch((err: any) => setError(err || "Failed to load"))
            .finally(() => setLoading(false));
    }, [dispatch, id]);

    if (loading) return <div className="p-6 text-gray-500">Loading user tracking data...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!data) return null;

    const { user, accountTracking, deviceLocation, recentLogins, purchaseAnalytics, shoppingBehavior, engagement, riskFraud, clvRfm, pageVisitHistory, couponWallet } = data;

    const riskColor = riskFraud.level === "High" ? "text-red-600" : riskFraud.level === "Medium" ? "text-amber-600" : "text-green-600";
    const engagementColor = engagement.level === "Active" ? "text-green-600" : engagement.level === "Moderate" ? "text-amber-600" : "text-gray-500";

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link to={`${basePath}/users`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{user.name}</h1>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card icon="🛡️" title="Account Tracking">
                    <Row label="Registration Date" value={fmtDate(accountTracking.registration_date)} />
                    <Row label="Registration type" value={accountTracking.registration_type} />
                    <Row label="Last Login" value={fmtDate(accountTracking.last_login)} />
                    <Row label="Login Count" value={accountTracking.login_count} />
                    <Row label="Account Status" value={accountTracking.account_status} valueClass="text-green-600" />
                </Card>

                <Card icon="📱" title="Device & Location">
                    {deviceLocation ? (
                        <>
                            <Row label="Device Type" value={deviceLocation.device_type} />
                            <Row label="Browser" value={deviceLocation.browser} />
                            <Row label="Operating System" value={deviceLocation.os} />
                            <Row label="IP Address" value={deviceLocation.ip} />
                            <Row label="Location" value={[deviceLocation.location?.city, deviceLocation.location?.state, deviceLocation.location?.country].filter(Boolean).join(", ") || "N/A"} />
                            <Row label="Pincode" value={deviceLocation.location?.pincode || "N/A"} />
                            {deviceLocation.location?.lat && (

                                <a className="text-blue-600 text-sm underline"
                                    href={`https://maps.google.com/?q=${deviceLocation.location.lat},${deviceLocation.location.lng}`}
                                    target="_blank" rel="noreferrer"
                                >
                                    View on Google Maps
                                </a>
                            )}
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-2">Recent Login History</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {recentLogins?.map((l: any) => (
                                        <div key={l._id} className="flex justify-between text-xs text-gray-500">
                                            <span>{l.device_type} · {l.browser} · {l.os}</span>
                                            <span>{fmtDate(l.createdAt)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">No login records yet</p>
                    )}
                </Card>

                <Card icon="📈" title="Purchase Analytics">
                    <Row label="Total Orders" value={purchaseAnalytics.total_orders} />
                    <Row label="Total Spending" value={`₹${purchaseAnalytics.total_spending}`} />
                    <Row label="Average Order Value" value={`₹${purchaseAnalytics.avg_order_value}`} />
                    <Row label="Last Order Date" value={fmtDate(purchaseAnalytics.last_order_date)} />
                    <Row label="Cancelled Orders" value={purchaseAnalytics.cancelled_orders} valueClass="text-red-500" />
                    <Row label="Returned Orders" value={purchaseAnalytics.returned_orders} />
                    <Row label="Refunded Orders" value={purchaseAnalytics.refunded_orders} />
                </Card>

                <Card icon="🛒" title="Shopping Behavior">
                    <Row label="Total Items Purchased" value={shoppingBehavior.total_items_purchased} />
                    <Row label="Average Items per Order" value={shoppingBehavior.avg_items_per_order} />
                    <Row label="Most Purchased Product" value={shoppingBehavior.most_purchased_product} />
                    <Row label="Preferred Shopping Day" value={shoppingBehavior.preferred_day} />
                    <Row label="Preferred Shopping Time" value={shoppingBehavior.preferred_time} />
                    <Row label="Purchase Frequency" value={shoppingBehavior.purchase_frequency} />
                    <Row label="Cart Abandoned" value={shoppingBehavior.cart_abandoned ? "Yes" : "No"} valueClass={shoppingBehavior.cart_abandoned ? "text-red-500" : "text-green-600"} />
                </Card>

                <Card icon="⚡" title="Engagement">
                    <Row label="Engagement Level" value={engagement.level} valueClass={engagementColor} />
                    <Row label="Engagement Score" value={`${engagement.score}/100`} valueClass="text-blue-600" />
                    <Row label="Days Since Last Login" value={daysAgoLabel(engagement.days_since_last_login)} />
                    <Row label="Login Frequency" value={engagement.login_frequency} />
                    <Row label="Logins (Last 30 Days)" value={engagement.logins_last_30_days} />
                    <Row label="Days Since Last Order" value={daysAgoLabel(engagement.days_since_last_order)} />
                    <Row label="Wishlist Items" value={engagement.wishlist_items} />
                    <Row label="Cart Items" value={engagement.cart_items} />
                    {engagement.signals?.length > 0 && (
                        <div className="pt-2">
                            <p className="text-xs text-gray-400 mb-2">Signals</p>
                            <div className="flex flex-wrap gap-2">
                                {engagement.signals.map((s: string, i: number) => (
                                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                <Card icon="⚠️" title="Risk & Fraud Detection">
                    <Row label="Risk Score" value={`${riskFraud.score}/100`} valueClass={riskColor} />
                    <Row label="Risk Level" value={riskFraud.level} valueClass={riskColor} />
                    {riskFraud.flags?.length > 0 && (
                        <div className="pt-2">
                            <p className="text-xs text-gray-400 mb-2">Flags</p>
                            <div className="flex flex-wrap gap-2">
                                {riskFraud.flags.map((f: string, i: number) => (
                                    <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">{f}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                <Card icon="📍" title="Customer Value (CLV / RFM)">
                    <Row label="Customer Lifetime Value (≈ Total Spending)" value={`₹${clvRfm.clv}`} />
                    <Row label="Frequency (Total Orders)" value={clvRfm.frequency} />
                    <Row label="Recency (Last Order)" value={clvRfm.recency ? new Date(clvRfm.recency).toLocaleDateString("en-IN") : "N/A"} />
                </Card>

                <Card icon="🌐" title="Page Visit History">
                    <Row label="Total Page Views" value={pageVisitHistory.total_page_views} />
                    <Row label="Unique Pages Visited" value={pageVisitHistory.unique_pages_visited} />
                    <Row label="Most Visited Page" value={pageVisitHistory.most_visited_page} />
                    <Row label="Last Visited Page" value={pageVisitHistory.last_visited_page} />
                    <Row label="Last Visit Time" value={fmtDate(pageVisitHistory.last_visit_time)} />
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">Recent Pages</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {pageVisitHistory.recent_pages?.map((p: any) => (
                                <div key={p._id} className="flex justify-between text-xs text-gray-500">
                                    <span>{p.page}</span>
                                    <span>{fmtDate(p.createdAt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
}