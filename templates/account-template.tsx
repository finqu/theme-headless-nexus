interface AccountTemplateProps {
  locale: string;
  section: 'dashboard' | 'edit' | 'orders' | 'wishlist';
}

/**
 * Account template component with multiple sections.
 * TODO: Implement full account functionality with Finqu customer API.
 */
export function AccountTemplate({ locale, section }: AccountTemplateProps) {
  return (
    <div className="min-h-[60vh] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              <AccountNavItem href="#" active={section === 'dashboard'} label="Dashboard" />
              <AccountNavItem href="#" active={section === 'orders'} label="Orders" />
              <AccountNavItem href="#" active={section === 'wishlist'} label="Wishlist" />
              <AccountNavItem href="#" active={section === 'edit'} label="Account Settings" />
            </nav>
          </aside>

          {/* Main content */}
          <main className="mt-10 lg:col-span-9 lg:mt-0">
            {section === 'dashboard' && <AccountDashboard />}
            {section === 'edit' && <AccountEdit />}
            {section === 'orders' && <AccountOrders />}
            {section === 'wishlist' && <AccountWishlist />}
          </main>
        </div>
      </div>
    </div>
  );
}

function AccountNavItem({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={`block rounded-sm px-3 py-2 text-sm font-medium ${
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {label}
    </a>
  );
}

function AccountDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-600">
          Welcome to your account dashboard. Here you can manage your orders, wishlist, and account
          settings.
        </p>
      </div>
    </div>
  );
}

function AccountEdit() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-600">Account settings form will be displayed here.</p>
      </div>
    </div>
  );
}

function AccountOrders() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-600">Your order history will be displayed here.</p>
      </div>
    </div>
  );
}

function AccountWishlist() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-600">Your wishlist items will be displayed here.</p>
      </div>
    </div>
  );
}
