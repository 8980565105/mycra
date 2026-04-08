import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Save, Image, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  fetchAboutPage,
  updateHero,
  addContentItem,
  updateContentItem,
  updateContentStatus,
  deleteContentItem,
  addFeature,
  updateFeature,
  deleteFeature,
} from "@/features/about/aboutThunk";
import type { ContentItem, Feature } from "@/features/about/aboutSlice";

type ContentForm = Omit<ContentItem, "_id"> & { _id?: string };
type FeatureForm = Omit<Feature, "_id"> & { _id?: string };

const emptyContent: ContentForm = { title: "", desc: "", image: "", order: 0, status: "active" };
const emptyFeature: FeatureForm = { icon: "", title: "", desc: "", order: 0 };

export default function AboutPageManager() {
  const dispatch = useDispatch<AppDispatch>();

  const { heroTitle, heroDesc, heroImage, content, features, loading, saving } =
    useSelector((s: RootState) => s.aboutPage);

  const [hero, setHero] = useState({ heroTitle: "", heroDesc: "", heroImage: "" });
  const heroFileRef = useRef<HTMLInputElement>(null);

  const [contentDialog, setContentDialog] = useState(false);
  const [contentForm, setContentForm] = useState<ContentForm>(emptyContent);
  const contentFileRef = useRef<HTMLInputElement>(null);

  const [featureDialog, setFeatureDialog] = useState(false);
  const [featureForm, setFeatureForm] = useState<FeatureForm>(emptyFeature);

  useEffect(() => { dispatch(fetchAboutPage()); }, [dispatch]);
  useEffect(() => { setHero({ heroTitle, heroDesc, heroImage }); }, [heroTitle, heroDesc, heroImage]);

  const handleHeroSave = async () => {
    const fd = new FormData();
    fd.append("heroTitle", hero.heroTitle);
    fd.append("heroDesc", hero.heroDesc);
    if (heroFileRef.current?.files?.[0]) {
      fd.append("heroImage", heroFileRef.current.files[0]);
    } else {
      fd.append("heroImage", hero.heroImage);
    }
    const result = await dispatch(updateHero(fd));
    if (updateHero.fulfilled.match(result)) {
      toast.success("Hero updated!");
      if (heroFileRef.current) heroFileRef.current.value = "";
    } else {
      toast.error((result.payload as string) || "Failed to update hero");
    }
  };

  const openContentAdd = () => { setContentForm(emptyContent); setContentDialog(true); };
  const openContentEdit = (item: ContentItem) => { setContentForm({ ...item }); setContentDialog(true); };

  const handleContentSave = async () => {
    if (!contentForm.title.trim()) return toast.error("Title is required");
    const fd = new FormData();
    fd.append("title", contentForm.title);
    fd.append("desc", contentForm.desc || "");
    fd.append("order", String(contentForm.order));
    fd.append("status", contentForm.status);
    if (contentFileRef.current?.files?.[0]) {
      fd.append("image", contentFileRef.current.files[0]);
    } else if (contentForm.image) {
      fd.append("image", contentForm.image);
    }
    const result = contentForm._id
      ? await dispatch(updateContentItem({ itemId: contentForm._id, data: fd }))
      : await dispatch(addContentItem(fd));

    if (addContentItem.fulfilled.match(result) || updateContentItem.fulfilled.match(result)) {
      toast.success(contentForm._id ? "Section updated!" : "Section added!");
      setContentDialog(false);
      if (contentFileRef.current) contentFileRef.current.value = "";
    } else {
      toast.error((result.payload as string) || "Operation failed");
    }
  };

  const handleContentToggle = async (item: ContentItem) => {
    const next: "active" | "inactive" = item.status === "active" ? "inactive" : "active";
    const result = await dispatch(updateContentStatus({ itemId: item._id, status: next }));
    if (!updateContentStatus.fulfilled.match(result)) toast.error("Failed to toggle status");
  };

  const handleContentDelete = async (id: string) => {
    if (!confirm("Delete this content section?")) return;
    const result = await dispatch(deleteContentItem(id));
    if (deleteContentItem.fulfilled.match(result)) {
      toast.success("Section deleted");
    } else {
      toast.error((result.payload as string) || "Failed to delete");
    }
  };

  const openFeatureAdd = () => { setFeatureForm(emptyFeature); setFeatureDialog(true); };
  const openFeatureEdit = (f: Feature) => { setFeatureForm({ ...f }); setFeatureDialog(true); };
  const featureFileRef = useRef<HTMLInputElement>(null);


  const handleFeatureSave = async () => {
    if (!featureForm.title.trim()) return toast.error("Title is required");

    const fd = new FormData();
    fd.append("title", featureForm.title);
    fd.append("desc", featureForm.desc || "");
    fd.append("order", String(featureForm.order));


    if (featureFileRef.current?.files?.[0]) {
      fd.append("icon", featureFileRef.current.files[0]);
    }

    else if (featureForm.icon && typeof featureForm.icon === "string") {
      fd.append("icon", featureForm.icon);
    }

    const result = featureForm._id
      ? await dispatch(updateFeature({ featureId: featureForm._id, data: fd }))
      : await dispatch(addFeature(fd));

    if (addFeature.fulfilled.match(result) || updateFeature.fulfilled.match(result)) {
      toast.success(featureForm._id ? "Feature updated!" : "Feature added!");
      setFeatureDialog(false);
      if (featureFileRef.current) featureFileRef.current.value = "";
    } else {
      toast.error((result.payload as string) || "Operation failed");
    }
  };

  const handleFeatureDelete = async (id: string) => {
    if (!confirm("Delete this feature?")) return;
    const result = await dispatch(deleteFeature(id));
    if (deleteFeature.fulfilled.match(result)) {
      toast.success("Feature deleted");
    } else {
      toast.error((result.payload as string) || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">About Page Manager</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" /> Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={hero.heroTitle}
              onChange={(e) => setHero({ ...hero, heroTitle: e.target.value })}
              placeholder="e.g. About Us"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={hero.heroDesc}
              onChange={(e) => setHero({ ...hero, heroDesc: e.target.value })}
              rows={3}
              placeholder="Short hero description…"
            />
          </div>
          <div>
            <Label>Hero Image</Label>
            {hero.heroImage && (
              <img src={hero.heroImage} alt="hero preview" className="w-full max-h-48 object-cover rounded mb-2" />
            )}
            <Input type="file" accept="image/*" ref={heroFileRef} className="mb-2" />
            <Input
              value={hero.heroImage}
              onChange={(e) => setHero({ ...hero, heroImage: e.target.value })}
              placeholder="Or paste image URL"
            />
          </div>
          <Button onClick={handleHeroSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving…" : "Save Hero"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Sections</CardTitle>
            <Button size="sm" onClick={openContentAdd}>
              <Plus className="w-4 h-4 mr-1" /> Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {content.length === 0 ? (
            <p className="text-sm text-gray-400">No content sections yet.</p>
          ) : (
            <div className="space-y-4">
              {[...content].sort((a, b) => a.order - b.order).map((item) => (
                <div key={item._id} className="flex items-center gap-4 border rounded-lg p-3">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch checked={item.status === "active"} onCheckedChange={() => handleContentToggle(item)} />
                    <Button variant="ghost" size="icon" onClick={() => openContentEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleContentDelete(item._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" /> Features
            </CardTitle>
            <Button size="sm" onClick={openFeatureAdd}>
              <Plus className="w-4 h-4 mr-1" /> Add Feature
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {features.length === 0 ? (
            <p className="text-sm text-gray-400">No features yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {[...features].sort((a, b) => a.order - b.order).map((f) => (
                <div key={f._id} className="flex items-center gap-3 border rounded-lg p-3">
                  <img src={f.icon} alt="icon" className="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{f.title}</p>
                    <p className="text-xs text-gray-500 truncate">{f.desc}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openFeatureEdit(f)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleFeatureDelete(f._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={contentDialog} onOpenChange={setContentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{contentForm._id ? "Edit" : "Add"} Content Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title *</Label>
              <Input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={contentForm.desc} onChange={(e) => setContentForm({ ...contentForm, desc: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Image</Label>
              {contentForm.image && (
                <img src={contentForm.image} alt="preview" className="w-full max-h-32 object-cover rounded mb-2" />
              )}
              <Input type="file" accept="image/*" ref={contentFileRef} className="mb-2" />
              <Input
                value={contentForm.image}
                onChange={(e) => setContentForm({ ...contentForm, image: e.target.value })}
                placeholder="Or paste image URL"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={contentForm.order}
                  onChange={(e) => setContentForm({ ...contentForm, order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Label>Active</Label>
                <Switch
                  checked={contentForm.status === "active"}
                  onCheckedChange={(v) => setContentForm({ ...contentForm, status: v ? "active" : "inactive" })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleContentSave}>{contentForm._id ? "Update" : "Add"}</Button>
              <Button variant="outline" className="flex-1" onClick={() => setContentDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={featureDialog} onOpenChange={setFeatureDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{featureForm._id ? "Edit" : "Add"} Feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Icon Image</Label>

              {featureForm.icon && (
                <img
                  src={featureForm.icon}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded mb-2"
                />
              )}

              <Input type="file" accept="image/*" ref={featureFileRef} className="mb-2" />

              <Input
                value={featureForm.icon}
                onChange={(e) =>
                  setFeatureForm({ ...featureForm, icon: e.target.value })
                }
                placeholder="Or paste image URL"
              />

            </div>
            <div>
              <Label>Title *</Label>
              <Input value={featureForm.title} onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={featureForm.desc} onChange={(e) => setFeatureForm({ ...featureForm, desc: e.target.value })} />
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={featureForm.order}
                onChange={(e) => setFeatureForm({ ...featureForm, order: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleFeatureSave}>{featureForm._id ? "Update" : "Add"}</Button>
              <Button variant="outline" className="flex-1" onClick={() => setFeatureDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}