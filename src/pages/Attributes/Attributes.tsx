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
import { Plus, Trash2, Edit, List } from "lucide-react";
import { toast } from "sonner";
import {
  Attribute,
  createAttribute,
  createAttributeValue,
  deleteAttribute,
  deleteAttributeValue,
  fetchAttributes,
  fetchAttributeValues,
  updateAttribute
} from "@/features/attributes/attributesThunk";

export default function AttributesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { attributes, attributeValues, loading } = useSelector(
    (state: RootState) => state.attributes
  );

  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [attrName, setAttrName] = useState("");
  const [attrCode, setAttrCode] = useState("");

  const [selectedValueAttr, setSelectedValueAttr] = useState<Attribute | null>(null);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [newValueText, setNewValueText] = useState("");
  const [newColorHex, setNewColorHex] = useState("");

  useEffect(() => {
    dispatch(fetchAttributes({}));
  }, [dispatch]);

  const handleOpenAttrModal = (attr?: Attribute) => {
    if (attr) {
      setEditingAttr(attr);
      setAttrName(attr.name);
      setAttrCode(attr.code);
    } else {
      setEditingAttr(null);
      setAttrName("");
      setAttrCode("");
    }
    setIsAttrModalOpen(true);
  };

  const handleSaveAttribute = async () => {
    if (!attrName.trim()) {
      toast.error("Please enter attribute name");
      return;
    }
    try {
      if (editingAttr) {
        await dispatch(
          updateAttribute({
            id: editingAttr._id,
            data: { name: attrName, code: attrCode },
          })
        ).unwrap();
        toast.success("Attribute updated successfully");
      } else {
        await dispatch(
          createAttribute({ name: attrName, code: attrCode })
        ).unwrap();
        toast.success("Attribute created successfully");
      }
      setIsAttrModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save attribute");
    }
  };

  const handleDeleteAttr = async (id: string) => {
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

  const handleDeleteValue = async (valId: string) => {
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
          <h1 className="text-2xl font-bold tracking-tight">Attributes Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage product specs like RAM, Storage, Fabric, Capacity, Color, Brand.
          </p>
        </div>
        <Button onClick={() => handleOpenAttrModal()}>
          <Plus className="w-4 h-4 mr-2" /> Add Attribute
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attributes.map((attr) => (
          <Card key={attr._id} className="shadow-sm border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">{attr.name}</CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenValues(attr)}
                  title="Manage Values"
                >
                  <List className="w-4 h-4 text-blue-600" />
                </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Delete Attribute"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </ConfirmDialog>
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

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttrModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttribute}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
