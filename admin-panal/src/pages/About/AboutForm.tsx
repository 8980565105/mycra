// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft } from "lucide-react";
// import { toast } from "sonner";
// import { useBasePath } from "@/hooks/useBasePath";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import {
//     addContentItem,
//     updateContentItem,
// } from "@/features/about/aboutThunk";

// export default function AboutForm() {
//     const dispatch = useDispatch<AppDispatch>();
//     const navigate = useNavigate();
//     const { id } = useParams<{ id: string }>();
//     const isEditMode = Boolean(id);
//     const basePath = useBasePath();
//     const { content } = useSelector((s: RootState) => s.aboutPage);
//     const [title, setTitle] = useState("");
//     const [desc, setDesc] = useState("");
//     const [image, setImage] = useState("");
//     const [order, setOrder] = useState(0);
//     const [status, setStatus] = useState(true);

//     useEffect(() => {
//         if (isEditMode && id) {
//             const item = content.find((c) => c._id === id);
//             if (item) {
//                 setTitle(item.title);
//                 setDesc(item.desc || "");
//                 setImage(item.image || "");
//                 setOrder(item.order);
//                 setStatus(item.status === "active");
//             }
//         }
//     }, [id, isEditMode, content]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         const fd = new FormData();
//         fd.append("title", title);
//         fd.append("desc", desc);
//         fd.append("image", image);
//         fd.append("order", String(order));
//         fd.append("status", status ? "active" : "inactive");

//         try {
//             let result;

//             if (isEditMode && id) {
//                 result = await dispatch(updateContentItem({ itemId: id, data: fd }));
//             } else {
//                 result = await dispatch(addContentItem(fd));
//             }

//             if (
//                 addContentItem.fulfilled.match(result) ||
//                 updateContentItem.fulfilled.match(result)
//             ) {
//                 toast.success(
//                     isEditMode ? "About section updated successfully!" : "About section created successfully!",
//                 );
//                 navigate(`${basePath}/about`);
//             } else {
//                 toast.error((result.payload as string) || "Something went wrong");
//             }
//         } catch {
//             toast.error("Server Error");
//         }
//     };

//     return (
//         <div className="p-6 mx-auto">
//             <div className="flex items-center gap-4 mb-6">
//                 <Link to={`${basePath}/about`}>
//                     <Button variant="ghost" size="icon">
//                         <ArrowLeft className="h-4 w-4" />
//                     </Button>
//                 </Link>

//                 <div>
//                     <h1 className="text-3xl font-bold">
//                         {isEditMode ? "Edit About Section" : "Add About Section"}
//                     </h1>
//                     <p className="text-gray-500">
//                         {isEditMode ? "Update About content" : "Create About content section"}
//                     </p>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
//                 {/* LEFT */}
//                 <div className="lg:col-span-2 space-y-6">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Content</CardTitle>
//                         </CardHeader>

//                         <CardContent className="space-y-4">
//                             <div>
//                                 <Label>Title *</Label>
//                                 <Input
//                                     value={title}
//                                     onChange={(e) => setTitle(e.target.value)}
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <Label>Description</Label>
//                                 <Input
//                                     value={desc}
//                                     onChange={(e) => setDesc(e.target.value)}
//                                 />
//                             </div>

//                             <div>
//                                 <Label>Image URL</Label>
//                                 <Input
//                                     value={image}
//                                     onChange={(e) => setImage(e.target.value)}
//                                     placeholder="Paste image URL"
//                                 />
//                             </div>

//                             <div>
//                                 <Label>Order</Label>
//                                 <Input
//                                     type="number"
//                                     value={order}
//                                     onChange={(e) => setOrder(Number(e.target.value))}
//                                 />
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* RIGHT */}
//                 <div className="space-y-6">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Status</CardTitle>
//                         </CardHeader>

//                         <CardContent>
//                             <div className="flex justify-between items-center">
//                                 <Label>Active</Label>
//                                 <Switch
//                                     checked={status}
//                                     onCheckedChange={(val) => setStatus(val)}
//                                 />
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <div className="flex gap-3">
//                         <Button type="submit" className="flex-1">
//                             {isEditMode ? "Update" : "Create"}
//                         </Button>

//                         <Link to={`${basePath}/about`} className="flex-1">
//                             <Button variant="outline" className="w-full">
//                                 Cancel
//                             </Button>
//                         </Link>
//                     </div>
//                 </div>
//             </form>
//         </div>
//     );
// }