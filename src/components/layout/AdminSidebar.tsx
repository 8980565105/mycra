import {
  LayoutDashboard,
  Package,
  FolderTree,
  Shirt,
  Ticket,
  ShoppingCart,
  CreditCard,
  Users,
  Star,
  Heart,
  ShoppingBasket,
  Layers,
  Navigation,
  Columns,
  MessageSquare,
  Settings,
  ChevronDown,
  Warehouse,
  Store,
  Folders,
  BadgeCheck,
  Shapes,
  TicketPercent,
  Wallet,
  Tag,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RootState } from "@/store";

const adminSections = [
  {
    label: "Main",
    items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard }],
  },

  {
    label: "Catalog",
    items: [
      { title: "Categories (L1)", url: "/admin/categories", icon: FolderTree },
      { title: "SubCategories (L2)", url: "/admin/subcategories", icon: Folders },
      { title: "Child Categories (L3)", url: "/admin/child-categories", icon: Layers },
      { title: "Product Types (L4)", url: "/admin/types", icon: Shirt },
      { title: "Attributes", url: "/admin/attributes", icon: Shapes },
      { title: "Brands", url: "/admin/brands", icon: Tag },
      { title: "Products", url: "/admin/products", icon: Package },
      // { title: "Product Labels", url: "/admin/product-labels", icon: Tag },
    ],
  },
  {
    label: "Promotions",
    items: [
      { title: "Coupons", url: "/admin/coupons", icon: TicketPercent },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
      { title: "Payments", url: "/admin/payments", icon: CreditCard },
      { title: "Warehouse", url: "/admin/warehouse", icon: Warehouse },
    ],
  },
  {
    label: "Customers & Sellers",
    items: [
      { title: "Seller Applications", url: "/admin/seller-applications", icon: BadgeCheck },
      { title: "Store", url: "/admin/stores", icon: Store },
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Customer Reviews", url: "/admin/customer-reviews", icon: Star },
      { title: "Wishlist", url: "/admin/wishlists", icon: Heart },
      { title: "Cart", url: "/admin/carts", icon: ShoppingBasket },
    ],
  },
  {
    label: "Wallets",
    items: [
      { title: "User Wallets", url: "/admin/wallets/users", icon: Wallet },
    ],
  },
  {
    label: "Emails",
    items: [
      { title: "Footer Emails", url: "/admin/emails",   icon: Wallet },
    ],

  },
  {
    label: "System",
    items: [
      { title: "Pages", url: "/admin/pages", icon: Layers },
      { title: "PolicyPages", url: "/admin/policypages", icon: Layers },
      { title: "Navbar", url: "/admin/navbar", icon: Navigation },
      { title: "Footer", url: "/admin/footer", icon: Columns },
      { title: "Contact Messages", url: "/admin/contact-messages", icon: MessageSquare },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

const storeOwnerSections = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/store_owner", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Attributes", url: "/store_owner/attributes", icon: Shapes },
      { title: "Products", url: "/store_owner/products", icon: Package },

    ],
  },
  {
    label: "Promotions",
    items: [
      { title: "Coupons", url: "/store_owner/coupons", icon: Ticket },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/store_owner/orders", icon: ShoppingCart },
      { title: "payment", url: "/store_owner/payments", icon: CreditCard },
      { title: "Warehouse", url: "/store_owner/warehouse", icon: Warehouse },
    ],
  },
  {
    label: "Customers",
    items: [
      { title: "Users", url: "/store_owner/users", icon: Users },
      { title: "Wishlist", url: "/store_owner/wishlists", icon: Heart },
      { title: "Cart", url: "/store_owner/carts", icon: ShoppingBasket },
    ],
  },

];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isCollapsed = state === "collapsed";

  const isActive = (url: string) =>
    url === "/" || url === "/store_owner"
      ? location.pathname === url
      : location.pathname.startsWith(url);

  const isGroupActive = (items: { url: string }[]) =>
    items.some((item) => isActive(item.url));

  const getNavClass = (url: string) => {
    const active = isActive(url);
    return [
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
      active
        ? "bg-sidebar-active text-sidebar-active-foreground shadow-sm"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    ].join(" ");
  };

  const sections =
    user?.role === "store_owner" ? storeOwnerSections : adminSections;

  const panelLabel =
    user?.role === "store_owner" ? "Store Dashboard" : "Admin Dashboard";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">
                Mycra
              </h2>
              <p className="text-xs text-muted-foreground">{panelLabel}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {sections.map((section) => (
          <Collapsible
            key={section.label}
            defaultOpen={isGroupActive(section.items)}
          >
            <SidebarGroup>
              {!isCollapsed && (
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.label}
                  </SidebarGroupLabel>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={getNavClass(item.url)}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}