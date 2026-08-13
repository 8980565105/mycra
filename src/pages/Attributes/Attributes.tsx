import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Attribute,
  AttributeValue,
  createAttribute,
  createAttributeValue,
  deleteAttribute,
  deleteAttributeValue,
  fetchAttributes,
  fetchAttributeValues,
  updateAttribute,
  updateAttributeValue
} from "@/features/attributes/attributesThunk";
import { fetchCategories } from "@/features/categories/categoriesThunk";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AttributesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { attributes, attributeValues, loading } = useSelector(
    (state: RootState) => state.attributes
  );
  const { categories } = useSelector((state: RootState) => state.categories);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isAdmin = userRole === "admin";
  const isStoreOwner = userRole === "store_owner";
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [attrName, setAttrName] = useState("");
  const [attrCode, setAttrCode] = useState("");
  const [selectedValueAttr, setSelectedValueAttr] = useState<Attribute | null>(null);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [newValueText, setNewValueText] = useState("");
  const [newColorHex, setNewColorHex] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [isEditValueModalOpen, setIsEditValueModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);
  const [editValueText, setEditValueText] = useState("");
  const [editColorHex, setEditColorHex] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchAttributes({
          categoryId: filterCategoryId !== "all" ? filterCategoryId : undefined,
          search: searchQuery.trim() || undefined,
        })
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch, filterCategoryId, searchQuery]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchCategories({ page: 1, limit: 100 }));
    }
  }, [dispatch, isAdmin]);

  const handleOpenAttrModal = (attr?: Attribute) => {
    if (!isAdmin) return;
    if (attr) {
      setEditingAttr(attr);
      setAttrName(attr.name);
      setAttrCode(attr.code);
      setParentId((attr as any).categoryId?._id || (attr as any).categoryId || "");
    } else {
      setEditingAttr(null);
      setAttrName("");
      setAttrCode("");
      setParentId("");
    }
    setIsAttrModalOpen(true);
  };

  const handleSaveAttribute = async () => {
    if (!attrName.trim()) {
      toast.error("Please enter attribute name");
      return;
    }
    if (!parentId) {
      toast.error("Please select a parent category");
      return;
    }
    try {
      if (editingAttr) {
        await dispatch(
          updateAttribute({
            id: editingAttr._id,
            data: { name: attrName, code: attrCode, categoryId: parentId },
          })
        ).unwrap();
        toast.success("Attribute updated successfully");
      } else {
        await dispatch(
          createAttribute({ name: attrName, code: attrCode, categoryId: parentId })
        ).unwrap();
        toast.success("Attribute created successfully");
      }
      setIsAttrModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save attribute");
    }
  };

  const handleDeleteAttr = async (id: string) => {
    if (!isAdmin) return;
    await dispatch(deleteAttribute(id));
    toast.success("Attribute deleted");
  };

  const handleOpenValues = (attr: Attribute) => {
    setSelectedValueAttr(attr);
    dispatch(fetchAttributeValues({ attributeId: attr._id }));
    setIsValueModalOpen(true);
  };

  const handleAddValue = async () => {
    if (!newValueText.trim() || !selectedValueAttr) return;
    try {
      await dispatch(
        createAttributeValue({
          attributeId: selectedValueAttr._id,
          value: newValueText,
          colorHex: newColorHex || undefined,
        })
      ).unwrap();
      toast.success("Value added successfully");
      setNewValueText("");
      setNewColorHex("");
      dispatch(fetchAttributeValues({ attributeId: selectedValueAttr._id }));
    } catch (err: any) {
      toast.error(err.message || "Failed to add value");
    }
  };

  const handleOpenEditValue = (val: AttributeValue) => {
    if (!isAdmin) return;
    setEditingValue(val);
    setEditValueText(val.value);
    setEditColorHex(val.colorHex || "");
    setIsEditValueModalOpen(true);
  };

  const handleUpdateValue = async () => {
    if (!editValueText.trim() || !editingValue) {
      toast.error("Please enter a value");
      return;
    }
    try {
      await dispatch(
        updateAttributeValue({
          id: editingValue._id,
          data: {
            value: editValueText,
            colorHex: editColorHex || undefined,
          },
        })
      ).unwrap();
      toast.success("Value updated successfully");
      setIsEditValueModalOpen(false);
      setEditingValue(null);
      if (selectedValueAttr) {
        dispatch(fetchAttributeValues({ attributeId: selectedValueAttr._id }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update value");
    }
  };

  const handleDeleteValue = async (valId: string) => {
    if (!isAdmin) return;
    if (selectedValueAttr) {
      await dispatch(deleteAttributeValue(valId));
      dispatch(fetchAttributeValues({ attributeId: selectedValueAttr._id }));
      toast.success("Value deleted");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? "Attributes Master" : "Product Attributes"}
          </h1>
          <p className="text-sm text-gray-500">
            Manage all products Attributes
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenAttrModal()}>
            <Plus className="w-4 h-4 mr-2" /> Add Attribute
          </Button>
        )}
      </div>
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search attribute name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isAdmin && (
              <div>
                <Select
                  value={filterCategoryId}
                  onValueChange={(val) => setFilterCategoryId(val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.length === 0 ? (
                      <SelectItem value="__loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attributes.map((attr) => (
          <Card key={attr._id} className="shadow-sm border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">{attr.name}</CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleOpenValues(attr)}
                  title="Manage Values"
                >
                  {isAdmin ? "Add & Edit Value" : "Add Value"}
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAttrModal(attr)}
                      title="Edit Attribute"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Button>
                    <ConfirmDialog
                      title="Delete Attribute"
                      description={`Are you sure you want to delete "${attr.name}" and its values?`}
                      confirmText="Delete"
                      danger
                      onConfirm={() => handleDeleteAttr(attr._id)}
                    >
                      <Button variant="ghost" size="sm" title="Delete Attribute">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </ConfirmDialog>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Code:</span> {attr.code}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {isAdmin && (
        <Dialog open={isAttrModalOpen} onOpenChange={setIsAttrModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAttr ? "Edit Attribute" : "Add New Attribute"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Attribute Name</Label>
                <Input
                  placeholder="e.g. RAM, Storage, Fabric"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                />
              </div>
              <div>
                <Label>Attribute Code (slug)</Label>
                <Input
                  placeholder="e.g. ram, storage, fabric"
                  value={attrCode}
                  onChange={(e) => setAttrCode(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="parent">
                  Parent Category <span className="text-red-500">*</span>
                </Label>
                <Select value={parentId} onValueChange={(val) => setParentId(val)} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a parent category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="__loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAttrModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAttribute}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={isValueModalOpen} onOpenChange={setIsValueModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Manage Values for "{selectedValueAttr?.name}"
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add value (e.g. 8 GB, Cotton, Red)"
                value={newValueText}
                onChange={(e) => setNewValueText(e.target.value)}
              />
              {selectedValueAttr?.code.toLowerCase().includes("color") && (
                <Input
                  type="color"
                  className="w-12 p-1 h-10"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                />
              )}
              <Button onClick={handleAddValue}>Add</Button>
            </div>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {attributeValues.length === 0 ? (
                <div className="p-3 text-sm text-center text-muted-foreground">
                  No values added yet.
                </div>
              ) : (
                attributeValues.map((val) => (
                  <div
                    key={val._id}
                    className="flex justify-between items-center p-2.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {val.colorHex && (
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: val.colorHex }}
                        />
                      )}
                      <span>{val.value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditValue(val)}
                          title="Edit Value"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                      )}
                      {isAdmin && (
                        <ConfirmDialog
                          title="Delete Value"
                          description={`Are you sure you want to delete "${val.value}"?`}
                          confirmText="Delete"
                          danger
                          onConfirm={() => handleDeleteValue(val._id)}
                        >
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </ConfirmDialog>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isAdmin && (
        <Dialog open={isEditValueModalOpen} onOpenChange={setIsEditValueModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Value</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Value</Label>
                <Input
                  placeholder="e.g. 8 GB, Cotton, Red"
                  value={editValueText}
                  onChange={(e) => setEditValueText(e.target.value)}
                  autoFocus
                />
              </div>
              {selectedValueAttr?.code.toLowerCase().includes("color") && (
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    className="w-full h-10 p-1"
                    value={editColorHex || "#000000"}
                    onChange={(e) => setEditColorHex(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditValueModalOpen(false);
                  setEditingValue(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateValue}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}