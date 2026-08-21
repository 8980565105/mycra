import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPolicyPageBySlug } from "../features/Policypages/policypagesThunk";

function PolicyPage({ slug }) {
    const dispatch = useDispatch();

    const {
        currentPage,
        loading,
        error,
    } = useSelector((state) => state.policyPages);

    useEffect(() => {
        if (slug) {
            dispatch(fetchPolicyPageBySlug(slug));
        }
    }, [dispatch, slug]);

    if (loading) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <p>Loading Policy...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <p className="text-red-500">
                        {error}
                    </p>
                </div>
            </section>
        );
    }

    if (!currentPage) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <p>Policy not found.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16">
            <div className="container mx-auto max-w-5xl px-4">
                <h1 className="mb-8 text-3xl font-bold">
                    {currentPage.page_name}
                </h1>
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: currentPage.description || "",
                    }}
                />
            </div>
        </section>
    );
}

export default PolicyPage;
