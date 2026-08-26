import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    fetchStoreDashboard,
    getStoreById
} from "@/features/stores/storesThunk";
import { StatsCard } from "@/components/ui/StatsCard";
import { useBasePath } from '@/hooks/useBasePath'
export default function StoreView() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();

    const store = useSelector(
        (state: RootState) => state.stores.store
    );
    const dashboard = useSelector(
        (state: RootState) => state.stores.dashboard
    );
    useEffect(() => {
        if (id) {
            dispatch(getStoreById(id));
            dispatch(fetchStoreDashboard(id));
        }
    }, [dispatch, id]);
    const analytics = dashboard?.analytics;
    const summaryStats = [
        { title: "Total Products", value: analytics?.totalProducts ?? 0 },
        { title: "Total Orders", value: analytics?.totalOrders ?? 0 },
        { title: "Total Users", value: analytics?.totalUsers ?? 0 },
        { title: "Total Revenue", value: `₹${analytics?.totalRevenue ?? 0}` },
        { title: "Pending Orders", value: analytics?.pendingOrders ?? 0 },
        { title: "Processing Orders", value: analytics?.processingOrders ?? 0 },
        { title: "Packed Orders", value: analytics?.packedOrders ?? 0 },
        { title: "Ready to Ship", value: analytics?.readyToShipOrders ?? 0 },
        { title: "Shipped Orders", value: analytics?.shippedOrders ?? 0 },
        { title: "In Transit Orders", value: analytics?.inTransitOrders ?? 0 },
        { title: "Delivered Orders", value: analytics?.deliveredOrders ?? 0 },
        { title: "Cancelled Orders", value: analytics?.cancelledOrders ?? 0 },
        { title: "RTO Orders", value: analytics?.rtoOrders ?? 0 },
        { title: "Returned Orders", value: analytics?.returnOrders ?? 0 },
        { title: "Refunded Orders", value: analytics?.refundedOrders ?? 0 },
    ];
    return (
        <>
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <Link to={`${basePath}/stores`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-700">
                            View {store?.name} Store
                        </h1>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {summaryStats.map((s) => (
                        <Card key={s.title} className="shadow-sm border rounded-xl flex flex-col justify-center">

                            <CardHeader className='!pb-0'>
                                <CardTitle className='text-center'>
                                    {s.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 pb-4 text-center text-2xl font-bold">
                                {s.value}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Store Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
                            <StatsCard
                                title="Customers"
                                count={analytics?.totalUsers ?? 0}
                                list={analytics?.customersList ?? []}
                                keyName="name"
                            />
                            <StatsCard
                                title="Products"
                                count={analytics?.totalProducts ?? 0}
                                list={analytics?.ProductsWise ?? []}
                                keyName='name'
                            />
                        </div>
                    </CardContent>
                </Card>
                {analytics?.recentOrderItems?.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Recent Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="py-2 pr-4">Product</th>
                                            <th className="py-2 pr-4">Category</th>
                                            <th className="py-2 pr-4">Qty</th>
                                            <th className="py-2 pr-4">Order Status</th>
                                            <th className="py-2 pr-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.recentOrderItems.map((item: any, idx: number) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="py-2 pr-4">{item.productName || "-"}</td>
                                                <td className="py-2 pr-4">{item.categoryName}</td>
                                                <td className="py-2 pr-4">{item.quantity}</td>
                                                <td className="py-2 pr-4 capitalize">{item.orderStatus}</td>
                                                <td className="py-2 pr-4">
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    )
}