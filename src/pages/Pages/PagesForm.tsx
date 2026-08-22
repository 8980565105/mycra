import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createPage,
  getPageById,
  updatePage,
} from "@/features/pages/pagesThunk";
import { Faq1Item, FaqItem, FeatureItem, SectionType, Slide } from "@/features/pages/pagesSlice";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PageFormPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const { user } = useSelector((state: any) => state.auth);
  const { stores = [] } = useSelector((state: any) => state.stores || {});
  const [pageName, setPageName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [order, setOrder] = useState<number | "">("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeyphrase, setMetaKeyphrase] = useState("");
  const [seoImage, setSeoImage] = useState("");
  const [sections, setSections] = useState<SectionType[]>([
    {
      type: "content",
      title: "",
      description: "",
      image_url: "",
      rs: 0,
      background_image_url: "",
      order: 1,
      is_button: false,
      button_name: "",
      button_link: "",
      status: "active",
    },
  ]);

  useEffect(() => {
    if (user?.role === "store_owner" && user?.storeId) {
      setSelectedStoreId(user.storeId);
    }
  }, [user]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getPageById(id)).then((res: any) => {
        if (res.payload) {
          const page = res.payload;
          setPageName(page.page_name || "");
          setDescription(page.description || "");
          setMetaTitle(page.meta_title || "");
          setMetaDescription(page.meta_description || "");
          setMetaKeyphrase(page.meta_keyphrase || "");
          setSeoImage(page.seo_image || "");
          setStatus(page.status || "active");
          setOrder(page.order || 1);
          setSections(page.sections?.length ? page.sections : []);
          if (page.storeId) setSelectedStoreId(page.storeId);
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const addSection = (type: SectionType["type"] = "content") => {
    const newSection: SectionType = {
      type,
      title: "",
      description: "",
      rs: 0,
      image_url: "",
      background_image_url: "",
      order: sections.length + 1,
      is_button: false,
      button_name: "",
      button_link: "",
      status: "active",
    };

    if (type === "hero_slider") {
      newSection.slides = [
        {
          title: "",
          description: "",
          background_image_url: "",
          is_button: false,
          button_name: "",
          button_link: "",
          order: 1,
        },
      ];
    }

    if (type === "feature") {
      newSection.items = [
        {
          image_url: "",
          title: "",
          description: "",
          order: 1,
        },
      ];
    }

    if (type === "faqs") {
      newSection.faqs = [
        {
          question: "",
          answer: "",
          order: 1,
        },
      ];
    }

    if (type === "faqs1") {
      newSection.faqs1 = [
        {
          category: "",
          question: "",
          answer: "",
          order: 1,
        },
      ];
    }


    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (
    index: number,
    field: keyof SectionType,
    value: SectionType[keyof SectionType]
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSlide = (sectionIndex: number) => {
    const updated = [...sections];
    if (!updated[sectionIndex].slides) updated[sectionIndex].slides = [];
    updated[sectionIndex].slides!.push({
      title: "",
      description: "",
      background_image_url: "",
      is_button: false,
      button_name: "",
      button_link: "",
      order: updated[sectionIndex].slides!.length + 1,
    });
    setSections(updated);
  };

  const updateSlide = (
    sectionIndex: number,
    slideIndex: number,
    field: keyof Slide,
    value: Slide[keyof Slide]
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      if (!updated[sectionIndex].slides) return updated;
      updated[sectionIndex].slides![slideIndex] = {
        ...updated[sectionIndex].slides![slideIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const removeSlide = (sectionIndex: number, slideIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].slides!.splice(slideIndex, 1);
    setSections(updated);
  };

  const addItem = (sectionIndex: number) => {
    const updated = [...sections];
    if (!updated[sectionIndex].items) updated[sectionIndex].items = [];
    updated[sectionIndex].items!.push({
      image_url: "",
      title: "",
      description: "",
      order: updated[sectionIndex].items!.length + 1,
    });
    setSections(updated);
  };

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof FeatureItem,
    value: FeatureItem[keyof FeatureItem]
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      if (!updated[sectionIndex].items) return updated;
      updated[sectionIndex].items![itemIndex] = {
        ...updated[sectionIndex].items![itemIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].items!.splice(itemIndex, 1);
    setSections(updated);
  };

  const addFaq = (sectionIndex: number) => {
    const updated = [...sections];
    if (!updated[sectionIndex].faqs) updated[sectionIndex].faqs = [];
    updated[sectionIndex].faqs!.push({
      question: "",
      answer: "",
      order: updated[sectionIndex].faqs!.length + 1,
    });
    setSections(updated);
  };

  const updateFaq = (
    sectionIndex: number,
    faqIndex: number,
    field: keyof FaqItem,
    value: FaqItem[keyof FaqItem]
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      if (!updated[sectionIndex].faqs) return updated;
      updated[sectionIndex].faqs![faqIndex] = {
        ...updated[sectionIndex].faqs![faqIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const removeFaq = (sectionIndex: number, faqIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].faqs!.splice(faqIndex, 1);
    setSections(updated);
  };

  const addFaq1 = (sectionIndex: number) => {
    const updated = [...sections];

    if (!updated[sectionIndex].faqs1) {
      updated[sectionIndex].faqs1 = [];
    }

    updated[sectionIndex].faqs1!.push({
      category: "",
      question: "",
      answer: "",
      order: updated[sectionIndex].faqs1!.length + 1,
    });

    setSections(updated);
  };

  const updateFaq1 = (
    sectionIndex: number,
    faqIndex: number,
    field: keyof Faq1Item,
    value: Faq1Item[keyof Faq1Item]
  ) => {
    setSections((prev) => {
      const updated = [...prev];

      if (!updated[sectionIndex].faqs1) {
        return updated;
      }

      updated[sectionIndex].faqs1![faqIndex] = {
        ...updated[sectionIndex].faqs1![faqIndex],
        [field]: value,
      };

      return updated;
    });
  };


  const removeFaq1 = (
    sectionIndex: number,
    faqIndex: number
  ) => {
    setSections((prev) => {
      const updated = [...prev];

      if (!updated[sectionIndex].faqs1) {
        return updated;
      }

      updated[sectionIndex].faqs1 = updated[
        sectionIndex
      ].faqs1!
        .filter((_, index) => index !== faqIndex)
        .map((faq, index) => ({
          ...faq,
          order: index + 1,
        }));

      return updated;
    });
  };



  const deleteFaqCategory = (
    sectionIndex: number,
    categoryIndex: number
  ) => {
    const updatedSections = [...sections];

    updatedSections[sectionIndex].faqCategories =
      updatedSections[
        sectionIndex
      ].faqCategories?.filter(
        (_, index) => index !== categoryIndex
      );

    setSections(updatedSections);
  };

  const addFaqCategory = (sectionIndex: number) => {
    setSections((prev) => {
      const updated = [...prev];

      if (!updated[sectionIndex].faqCategories) {
        updated[sectionIndex].faqCategories = [];
      }

      const categories = updated[sectionIndex].faqCategories!;

      categories.push({
        key: `category-${categories.length + 1}`,
        label: "",
        order: categories.length + 1,
      });

      return updated;
    });
  };


  const updateFaqCategory = (
    sectionIndex: number,
    categoryIndex: number,
    field: "key" | "label",
    value: string
  ) => {
    setSections((prev) => {
      const updated = [...prev];

      const categories =
        updated[sectionIndex].faqCategories || [];

      categories[categoryIndex] = {
        ...categories[categoryIndex],
        [field]:
          field === "key"
            ? value
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
            : value,
      };

      updated[sectionIndex].faqCategories = categories;

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim()) return toast.error("Please enter page name");

    const payload: any = {
      page_name: pageName,
      slug: pageName.toLowerCase().replace(/\s+/g, "-"),
      description,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keyphrase: metaKeyphrase,
      seo_image: seoImage,
      status,
      order,
      sections: sections.map((section) => {
        const { slides, ...rest } = section;
        return {
          ...rest,
          slides: slides?.length
            ? slides.map((slide) => ({ ...slide }))
            : undefined,
        };
      }),
    };

    if (selectedStoreId) payload.storeId = selectedStoreId;

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updatePage({ id, data: payload }));
      } else {
        result = await dispatch(createPage(payload));
      }

      if (
        createPage.fulfilled.match(result) ||
        updatePage.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode ? "Page updated successfully!" : "Page created successfully!"
        );
        navigate(`${basePath}/pages`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/pages`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Page" : "Add New Page"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update page content and sections."
              : "Create a new dynamic page."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Page Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Page Name *</Label>
                <Input
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short page description..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">SEO Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Meta Keyphrase</Label>
                <Input
                  value={metaKeyphrase}
                  onChange={(e) => setMetaKeyphrase(e.target.value)}
                />
              </div>
              <div>
                <Label>SEO Image</Label>
                <ImageUpload
                  value={seoImage}
                  onChange={(url) => setSeoImage(url as string)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-lg font-semibold">Page Sections</CardTitle>

            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {sections.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6 border rounded-md bg-gray-50">
                  No sections added yet. Click "Add Section" to get started.
                </p>
              ) : (
                sections.map((section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="relative rounded-xl border border-gray-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                    <h4 className="text-base font-medium text-gray-800 mb-4">
                      Section {sectionIndex + 1}
                    </h4>
                    <div className="mb-4">
                      <Label>Section Type</Label>
                      <select
                        value={section.type}
                        onChange={(e) =>
                          updateSection(sectionIndex, "type", e.target.value)
                        }
                        className="border rounded p-2 w-full"
                      >
                        <option value="hero_slider">Hero Slider</option>
                        <option value="content">Content</option>
                        <option value="feature">Feature</option>
                        <option value="banner">Banner</option>
                        <option value="faqs">FAQs 1</option>
                        <option value="faqs1">FAQ 2</option>

                      </select>
                    </div>
                    {section.type !== "feature" && section.type !== "hero_slider" && section.type !== "faqs" && section.type !== "faqs1" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={section.title}
                            placeholder="Enter section title"
                            onChange={(e) =>
                              updateSection(sectionIndex, "title", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={section.description}
                            placeholder="Enter section description"
                            onChange={(e) =>
                              updateSection(sectionIndex, "description", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Image</Label>
                          <ImageUpload
                            value={section.image_url}
                            onChange={(url) =>
                              updateSection(sectionIndex, "image_url", url as string)
                            }
                          />
                        </div>
                        {section.type === "banner" && (
                          <div className="space-y-2">
                            <Label>Price (Rs.)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={section.rs ?? 0}
                              placeholder="Enter price e.g. 999"
                              onChange={(e) =>
                                updateSection(sectionIndex, "rs", Number(e.target.value))
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {section.type === "hero_slider" && (
                      <div className="space-y-2 mt-4">
                        <Label>Section Background Image (optional overall bg)</Label>
                        <ImageUpload
                          value={section.background_image_url}
                          onChange={(url) =>
                            updateSection(sectionIndex, "background_image_url", url as string)
                          }
                        />
                      </div>
                    )}
                    {section.type !== "feature" &&
                      section.type !== "faqs" &&
                      section.type !== "faqs1" && (
                        <div className="flex items-center justify-between mt-5 border-t pt-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={section.is_button || false}
                              onCheckedChange={(val) =>
                                updateSection(sectionIndex, "is_button", val)
                              }
                            />
                            <Label>Include Button</Label>
                          </div>
                        </div>
                      )}
                    {section.is_button && section.type !== "feature" && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label>Button Name</Label>
                          <Input
                            placeholder="e.g. Shop Now"
                            value={section.button_name || ""}
                            onChange={(e) =>
                              updateSection(sectionIndex, "button_name", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input
                            placeholder="/shop"
                            value={section.button_link || ""}
                            onChange={(e) =>
                              updateSection(sectionIndex, "button_link", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}

                    {section.type === "hero_slider" && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Slides</Label>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addSlide(sectionIndex)}
                          >
                            <Plus className="w-4 h-4" /> Add Slide
                          </Button>
                        </div>
                        {section.slides && section.slides.length === 0 && (
                          <p className="text-sm text-gray-500">No slides yet</p>
                        )}
                        {section.slides?.map((slide, slideIndex) => (
                          <div
                            key={slideIndex}
                            className="relative border border-gray-200 rounded p-4 mb-3"
                          >
                            <button
                              type="button"
                              onClick={() => removeSlide(sectionIndex, slideIndex)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Slide Title</Label>
                                <Input
                                  value={slide.title}
                                  onChange={(e) =>
                                    updateSlide(sectionIndex, slideIndex, "title", e.target.value)
                                  }
                                  placeholder="Enter slide title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Slide Description</Label>
                                <Textarea
                                  value={slide.description}
                                  onChange={(e) =>
                                    updateSlide(sectionIndex, slideIndex, "description", e.target.value)
                                  }
                                  placeholder="Enter slide description"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Background Image</Label>
                                <ImageUpload
                                  value={slide.background_image_url}
                                  onChange={(url) =>
                                    updateSlide(
                                      sectionIndex,
                                      slideIndex,
                                      "background_image_url",
                                      url as string
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Include Button</Label>
                                <Switch
                                  checked={slide.is_button}
                                  onCheckedChange={(val) =>
                                    updateSlide(sectionIndex, slideIndex, "is_button", val)
                                  }
                                />
                              </div>
                              {slide.is_button && (
                                <>
                                  <div className="space-y-2">
                                    <Label>Button Name</Label>
                                    <Input
                                      value={slide.button_name}
                                      onChange={(e) =>
                                        updateSlide(sectionIndex, slideIndex, "button_name", e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Button Link</Label>
                                    <Input
                                      value={slide.button_link}
                                      onChange={(e) =>
                                        updateSlide(sectionIndex, slideIndex, "button_link", e.target.value)
                                      }
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === "feature" && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Feature Items</Label>

                        </div>

                        {section.items?.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="relative border border-gray-200 rounded p-4 mb-3"
                          >
                            <button
                              type="button"
                              onClick={() => removeItem(sectionIndex, itemIndex)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </button>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                  value={item.title}
                                  placeholder="Enter item title"
                                  onChange={(e) =>
                                    updateItem(sectionIndex, itemIndex, "title", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={item.description}
                                  placeholder="Enter item description"
                                  onChange={(e) =>
                                    updateItem(sectionIndex, itemIndex, "description", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Image</Label>
                                <ImageUpload
                                  value={item.image_url}
                                  onChange={(url) =>
                                    updateItem(sectionIndex, itemIndex, "image_url", url as string)
                                  }
                                />
                              </div>

                            </div>
                          </div>

                        ))}
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addItem(sectionIndex)}
                          >
                            <Plus className="w-4 h-4" /> Add Item
                          </Button>
                        </div>
                      </div>
                    )}

                    {section.type === "faqs" && (
                      <div className="space-y-4 mt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={section.title}
                              placeholder="e.g. Frequently Asked Questions"
                              onChange={(e) =>
                                updateSection(sectionIndex, "title", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={section.description}
                              placeholder="Enter faq section description"
                              onChange={(e) =>
                                updateSection(sectionIndex, "description", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Background Image</Label>
                            <ImageUpload
                              value={section.background_image_url}
                              onChange={(url) =>
                                updateSection(sectionIndex, "background_image_url", url as string)
                              }
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <Label>FAQ Items</Label>
                        </div>

                        {section.faqs?.map((faq, faqIndex) => (
                          <div
                            key={faqIndex}
                            className="relative border border-gray-200 rounded p-4 mb-3"
                          >
                            <button
                              type="button"
                              onClick={() => removeFaq(sectionIndex, faqIndex)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <Label>Question</Label>
                                <Input
                                  value={faq.question}
                                  placeholder="Enter question"
                                  onChange={(e) =>
                                    updateFaq(sectionIndex, faqIndex, "question", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                  value={faq.answer}
                                  placeholder="Enter answer"
                                  onChange={(e) =>
                                    updateFaq(sectionIndex, faqIndex, "answer", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addFaq(sectionIndex)}
                          >
                            <Plus className="w-4 h-4" /> Add FAQ
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* {section.type === "faqs1" && (

                      <div className="space-y-5 mt-4">
                        <div className="flex items-center justify-between border-t pt-5">
                          <div>
                            <Label className="text-base">
                              FAQS Section 2 Items
                            </Label>

                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addFaq1(sectionIndex)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add FAQ
                          </Button>
                        </div>
                        {section.faqs1?.map((faq, faqIndex) => (
                          <div
                            key={faqIndex}
                            className="relative border border-gray-200 rounded-xl p-5 mb-4 bg-gray-50"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                removeFaq1(
                                  sectionIndex,
                                  faqIndex
                                )
                              }
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700">
                                FAQ #{faqIndex + 1}
                              </p>
                            </div>
                            <div className="grid gap-4">
                              

                              <div className="space-y-2">
                                <Label>Category</Label>

                                <select
                                  value={faq.category || ""}
                                  onChange={(e) =>
                                    updateFaq1(
                                      sectionIndex,
                                      faqIndex,
                                      "category",
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                                >
                                  <option value="">
                                    Select Category
                                  </option>

                                  {(section.faqCategories || []).map((category) => (
                                    <option
                                      key={category.key}
                                      value={category.key}
                                    >
                                      {category.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label>Question</Label>
                                <Input
                                  value={faq.question || ""}
                                  placeholder="e.g. How can I place an order?"
                                  onChange={(e) =>
                                    updateFaq1(
                                      sectionIndex,
                                      faqIndex,
                                      "question",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                  value={faq.answer || ""}
                                  placeholder="Enter answer"
                                  rows={4}
                                  onChange={(e) =>
                                    updateFaq1(
                                      sectionIndex,
                                      faqIndex,
                                      "answer",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )} */}


                    {section.type === "faqs1" && (
                      <div className="space-y-6 mt-4">

                        {/* ============================= */}
                        {/* FAQ 2 CATEGORIES */}
                        {/* ============================= */}

                        <Card className="border border-gray-200">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">
                                  FAQ Categories
                                </CardTitle>

                                <p className="text-sm text-gray-500 mt-1">
                                  Create categories and select them in FAQ items.
                                </p>
                              </div>

                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addFaqCategory(sectionIndex)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Category
                              </Button>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3">

                            {(section.faqCategories || []).map(
                              (category, categoryIndex) => (
                                <div
                                  key={categoryIndex}
                                  className="grid grid-cols-12 gap-3 items-end border rounded-lg p-3"
                                >

                                  {/* Category Key */}
                                  <div className="col-span-5 space-y-2">
                                    <Label>Category Value</Label>

                                    <Input
                                      value={category.key}
                                      placeholder="orders"
                                      onChange={(e) =>
                                        updateFaqCategory(
                                          sectionIndex,
                                          categoryIndex,
                                          "key",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>

                                  {/* Category Label */}
                                  <div className="col-span-5 space-y-2">
                                    <Label>Category Name</Label>

                                    <Input
                                      value={category.label}
                                      placeholder="Orders"
                                      onChange={(e) =>
                                        updateFaqCategory(
                                          sectionIndex,
                                          categoryIndex,
                                          "label",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>

                                  {/* Delete */}
                                  <div className="col-span-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() =>
                                        deleteFaqCategory(
                                          sectionIndex,
                                          categoryIndex
                                        )
                                      }
                                    >
                                      <Trash className="w-4 h-4" />
                                    </Button>
                                  </div>

                                </div>
                              )
                            )}

                            {(!section.faqCategories ||
                              section.faqCategories.length === 0) && (
                                <div className="text-center py-6 text-sm text-gray-500">
                                  No categories added.
                                </div>
                              )}

                          </CardContent>
                        </Card>


                        {/* ============================= */}
                        {/* FAQ ITEMS */}
                        {/* ============================= */}

                        <Card className="border border-gray-200">
                          <CardHeader>
                            <div className="flex items-center justify-between">

                              <div>
                                <CardTitle className="text-base">
                                  FAQ Items
                                </CardTitle>

                                <p className="text-sm text-gray-500 mt-1">
                                  Select a category, then add question and answer.
                                </p>
                              </div>

                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addFaq1(sectionIndex)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add FAQ
                              </Button>

                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">

                            {section.faqs1?.map((faq, faqIndex) => (

                              <div
                                key={faqIndex}
                                className="relative border border-gray-200 rounded-xl p-5 bg-gray-50"
                              >

                                {/* Delete FAQ */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFaq1(
                                      sectionIndex,
                                      faqIndex
                                    )
                                  }
                                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>


                                <div className="mb-4">
                                  <p className="text-sm font-semibold text-gray-700">
                                    FAQ #{faqIndex + 1}
                                  </p>
                                </div>


                                <div className="grid gap-4">

                                  {/* CATEGORY */}
                                  <div className="space-y-2">

                                    <Label>
                                      Category <span className="text-red-500">*</span>
                                    </Label>

                                    <select
                                      value={faq.category || ""}
                                      onChange={(e) =>
                                        updateFaq1(
                                          sectionIndex,
                                          faqIndex,
                                          "category",
                                          e.target.value
                                        )
                                      }
                                      className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                                    >

                                      <option value="">
                                        Select Category
                                      </option>

                                      {(section.faqCategories || []).map(
                                        (category) => (
                                          <option
                                            key={category.key}
                                            value={category.key}
                                          >
                                            {category.label}
                                          </option>
                                        )
                                      )}

                                    </select>

                                    {(!section.faqCategories ||
                                      section.faqCategories.length === 0) && (
                                        <p className="text-xs text-red-500">
                                          Please add at least one category first.
                                        </p>
                                      )}

                                  </div>


                                  {/* QUESTION */}
                                  <div className="space-y-2">

                                    <Label>
                                      Question <span className="text-red-500">*</span>
                                    </Label>

                                    <Input
                                      value={faq.question || ""}
                                      placeholder="e.g. How can I place an order?"
                                      onChange={(e) =>
                                        updateFaq1(
                                          sectionIndex,
                                          faqIndex,
                                          "question",
                                          e.target.value
                                        )
                                      }
                                    />

                                  </div>


                                  {/* ANSWER */}
                                  <div className="space-y-2">

                                    <Label>
                                      Answer <span className="text-red-500">*</span>
                                    </Label>

                                    <Textarea
                                      value={faq.answer || ""}
                                      placeholder="Enter answer"
                                      rows={5}
                                      onChange={(e) =>
                                        updateFaq1(
                                          sectionIndex,
                                          faqIndex,
                                          "answer",
                                          e.target.value
                                        )
                                      }
                                    />

                                  </div>

                                </div>

                              </div>

                            ))}


                            {(!section.faqs1 ||
                              section.faqs1.length === 0) && (
                                <div className="text-center py-8 text-sm text-gray-500">
                                  No FAQ items added.
                                </div>
                              )}

                          </CardContent>
                        </Card>

                      </div>
                    )}
                  </div>
                ))
              )}
              <div className="flex justify-center items-center ">
                <Select
                  value=""
                  onValueChange={(val) => addSection(val as SectionType["type"])}

                >
                  <SelectTrigger className="w-[200px] bg-primary text-white">
                    <SelectValue placeholder="+ Add Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero_slider">Hero Slider</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="faqs">FAQs 1</SelectItem>
                    <SelectItem value="faqs1">FAQs 2</SelectItem>
                  </SelectContent>
                </Select>

              </div>






            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 relative">
          <Card className="sticky top-6 shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch
                  id="status"
                  checked={status === "active"}
                  onCheckedChange={(val) => setStatus(val ? "active" : "inactive")}
                />
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={order === "" ? "" : order}
                  onChange={(e) =>
                    setOrder(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 sticky top-[250px]">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Update Page" : "Create Page"}
            </Button>
            <Link to={`${basePath}/pages`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}