import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Upload, Save, Palette, Trash, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchMe, updateMe } from "@/features/profile/profileThunk";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  fetchSettings,
  updateSettings,
} from "@/features/settings/settingsThunk";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // --- Profile state ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dob, setDob] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");

   const [siteName, setSiteName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [buttonColor, setButtonColor] = useState("#3b82f6");
  const [footerText, setFooterText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeyphrase, setMetaKeyphrase] = useState("");
  const [seoImage, setSeoImage] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactStreet, setContactStreet] = useState("");
  const [contactCity, setContactCity] = useState("");
  const [contactState, setContactState] = useState("");
  const [contactCountry, setContactCountry] = useState("");
  const [contactPostal, setContactPostal] = useState("");
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [copyrightText, setCopyrightText] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [customJs, setCustomJs] = useState("");


  // --- Fetch profile ---
  useEffect(() => {
    dispatch(fetchMe()).then((res: any) => {
      if (res.payload) {
       
        const u = res.payload.user;

        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.mobile_number || "");
        setGender(u.gender || "");
        setDob(
          u.date_of_birth
            ? new Date(u.date_of_birth).toISOString().split("T")[0]
            : ""
        );
        setProfilePic(u.profile_picture || "");
        if (u.address) {
          setStreet(u.address.street || "");
          setCity(u.address.city || "");
          setState(u.address.state || "");
          setZip(u.address.zip_code || "");
          setCountry(u.address.country || "");
        }
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSettings()).then((res: any) => {
      if (res.payload) {
        const s = res.payload;
        setSiteName(s.site_name || "");
        setLogo(s.logo_url || null);
        setFavicon(s.favicon_url || null);
        setPrimaryColor(s.primary_color || "#3b82f6");
        setSecondaryColor(s.secondary_color || "#64748b");
        setButtonColor(s.button_color || "#3b82f6");
        setFooterText(s.footer_text || "");
        setFontFamily(s.font_family || "");
        setMetaTitle(s.meta_title || "");
        setMetaDescription(s.meta_description || "");
        setMetaKeyphrase(s.meta_keyphrase || "");
        setSeoImage(s.seo_image || null);
        setContactEmail(s.contact_email || "");
        setContactPhone(s.contact_phone || "");
        setContactStreet(s.contact_address?.street || "");
        setContactCity(s.contact_address?.city || "");
        setContactState(s.contact_address?.state || "");
        setContactCountry(s.contact_address?.country || "");
        setContactPostal(s.contact_address?.postal_code || "");
        setSocialLinks(s.social_links || []);
        setCopyrightText(s.copyright_text || "");
        setCustomCss(s.custom_css || "");
        setCustomJs(s.custom_js || "");
      }
    });
  }, [dispatch]);

  // --- Save Profile ---
  const handleSaveProfile = async () => {
    const payload = {
      name,
      mobile_number: phone,
      gender,
      date_of_birth: dob || null,
      profile_picture: profilePic,
      address: { street, city, state, zip_code: zip, country },
    };
    const res = await dispatch(updateMe(payload));
    if (updateMe.fulfilled.match(res)) {
      toast({
        title: "Profile Updated",
        description: "Your profile was updated successfully.",
      });
    } else {
      toast({
        title: "Update Failed",
        description: res.payload as string,
        variant: "destructive",
      });
    }
  };

   // --- Save Settings ---
  const handleSaveSettings = async () => {
    const payload = {
      site_name: siteName,
      logo_url: logo,
      favicon_url: favicon,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      button_color: buttonColor,
      font_family: fontFamily,
      footer_text: footerText,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keyphrase: metaKeyphrase,
      seo_image: seoImage,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      contact_address: {
        street: contactStreet,
        city: contactCity,
        state: contactState,
        country: contactCountry,
        postal_code: contactPostal,
      },
      social_links: socialLinks,
      copyright_text: copyrightText,
      custom_css: customCss,
      custom_js: customJs,
    };

    const result = await dispatch(updateSettings(payload));
    if (updateSettings.fulfilled.match(result)) {
      toast({ title: "Settings Updated", description: "Settings saved successfully." });
    } else {
      toast({ title: "Update Failed", description: result.payload as string, variant: "destructive" });
    }
  };

    // --- Social Links handlers ---
  const addSocialLink = () => setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  const removeSocialLink = (index: number) => setSocialLinks(socialLinks.filter((_, i) => i !== index));
  const updateSocialLink = (index: number, key: "platform" | "url", value: string) => {
    const updated = [...socialLinks];
    updated[index][key] = value;
    setSocialLinks(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
           <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <ImageUpload
                    value={profilePic}
                    onChange={(val) => setProfilePic(val as string | null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="border rounded-md p-2 w-full"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right: Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
       <TabsContent value="appearance">
  <Card>
    <CardHeader>
      <CardTitle>Store Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Site Name */}
      <div className="space-y-2">
        <Label htmlFor="site-name">Site Name</Label>
        <Input
          id="site-name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="Enter site name"
        />
      </div>

      {/* Logo & Favicon */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Logo</Label>
          <ImageUpload
            value={logo}
            onChange={(val) => setLogo(val as string | null)}
          />
        </div>
        <div className="space-y-2">
          <Label>Favicon</Label>
          <ImageUpload
            value={favicon}
            onChange={(val) => setFavicon(val as string | null)}
          />
        </div>
      </div>

      {/* Colors */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Primary Color</Label>
          <Input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Secondary Color</Label>
          <Input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Button Color</Label>
          <Input
            type="color"
            value={buttonColor}
            onChange={(e) => setButtonColor(e.target.value)}
          />
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="font-family">Font Family</Label>
        <select
          id="font-family"
          className="border rounded-md p-2 w-full"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="">Select Font</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Roboto, sans-serif">Roboto</option>
          <option value="Poppins, sans-serif">Poppins</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Georgia, serif">Georgia</option>
        </select>
      </div>

      {/* Footer Text */}
      <div className="space-y-2">
        <Label>Footer Text</Label>
        <Textarea
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </CardContent>
  </Card>
</TabsContent>

    <TabsContent value="contact">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street</Label>
                <Input value={contactStreet} onChange={(e) => setContactStreet(e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>City</Label>
                  <Input value={contactCity} onChange={(e) => setContactCity(e.target.value)} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={contactState} onChange={(e) => setContactState(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Country</Label>
                  <Input value={contactCountry} onChange={(e) => setContactCountry(e.target.value)} />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input value={contactPostal} onChange={(e) => setContactPostal(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleSaveSettings}>Save Contact Info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL LINKS */}
        <TabsContent value="social">
          <Card>
            <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                  <Input
                    placeholder="Platform (e.g. Facebook)"
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  />
                  <Button variant="destructive" onClick={() => removeSocialLink(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addSocialLink} className="gap-2">
                <Plus className="h-4 w-4" /> Add Social Link
              </Button>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Social Links</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO TAB */}
        <TabsContent value="seo">
          <Card>
            <CardHeader><CardTitle>SEO Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta Keyphrase</Label>
                <Input value={metaKeyphrase} onChange={(e) => setMetaKeyphrase(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO Image</Label>
                <ImageUpload value={seoImage} onChange={(val) => setSeoImage(val as string | null)} />
              </div>
              <Button onClick={handleSaveSettings}>Save SEO Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADVANCED TAB */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader><CardTitle>Advanced Customization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Copyright Text</Label>
                <Input value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} />
              </div>
              <div>
                <Label>Custom CSS</Label>
                <Textarea value={customCss} onChange={(e) => setCustomCss(e.target.value)} />
              </div>
              <div>
                <Label>Custom JS</Label>
                <Textarea value={customJs} onChange={(e) => setCustomJs(e.target.value)} />
              </div>
              <Button onClick={handleSaveSettings}>Save Advanced Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
