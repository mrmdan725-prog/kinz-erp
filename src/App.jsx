import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  LogOut,
  DollarSign,
  UsersRound,
  Receipt,
  Eye,
  ClipboardCheck,
  Search,
  Command,
  ArrowRight,
  Truck,
  Sun,
  Moon,
  Plus
} from 'lucide-react';
import Logo from './components/Logo';
import { AppProvider, useApp } from './context/AppContext';
import './App.css';

// Screens
import Customers from './screens/Customers';
import Purchasing from './screens/Purchasing';

import Dashboard from './screens/Dashboard';
import SettingsScreen from './screens/Settings';
import Login from './screens/Login';
import Finance from './screens/Finance';
import InspectionDetails from './screens/InspectionDetails';
import UserProfile from './screens/UserProfile';
import Deliveries from './screens/Deliveries';


const NavItem = ({ to, icon: Icon, label, isCollapsed, suffix }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? label : ''} style={{ position: 'relative' }}>
      <Icon size={20} />
      {!isCollapsed && <span>{label}</span>}
      {!isCollapsed && suffix}
    </Link>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { logout, currentUser } = useApp();
  const perms = currentUser?.permissions || {};
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
      <div className="sidebar-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
        <Logo className={isCollapsed ? 'collapsed-logo' : ''} />
      </div>
      <nav className="sidebar-nav">
        {perms.canViewDashboard && <NavItem to="/" icon={BarChart3} label="لوحة التحكم" isCollapsed={isCollapsed} />}
        {perms.canManageCustomers && <NavItem to="/customers" icon={Users} label="العملاء" isCollapsed={isCollapsed} />}
        {perms.canManagePurchases && <NavItem to="/purchasing" icon={ShoppingCart} label="المشتريات" isCollapsed={isCollapsed} />}

        {perms.canManageFinance && <NavItem to="/finance" icon={DollarSign} label="المالية" isCollapsed={isCollapsed} />}
        {perms.canManageDeliveries && <NavItem to="/deliveries" icon={Truck} label="التسليمات" isCollapsed={isCollapsed} />}
      </nav>
      <div className="sidebar-footer">
        {perms.canManageUsers && <NavItem to="/settings" icon={Settings} label="الإعدادات" isCollapsed={isCollapsed} />}
      </div>
    </aside>
  );
};

const AppContent = () => {
  const { currentUser, customers, invoices, logout, isCloudLoading, darkMode, toggleDarkMode } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    if (!globalSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const query = globalSearch.toLowerCase();
    const results = [
      ...customers.filter(c => c.name?.toLowerCase().includes(query)).map(c => ({ ...c, type: 'customer', link: '/customers' }))
    ].slice(0, 8);

    setSearchResults(results);
  }, [globalSearch, customers]);

  // Keyboard shortcut (CMD+K or CTRL+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-box-wrapper input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search results and user menu on navigation
  useEffect(() => {
    setGlobalSearch('');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (isCloudLoading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Logo />
          <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', justifyContent: 'center' }}>
            <div className="sync-spinner"></div>
            جاري مزامنة بيانات كينز...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const perms = currentUser.permissions || {};

  return (
    <div className={`app-container ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`} dir="rtl">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <main className="content">
        <header className="main-header">
          <div className="header-left">
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
              <div className="hamburger"></div>
            </button>
            <Logo className="header-logo-compact" />
          </div>

          <div className="intelligence-hub">
            <button
              className="theme-toggle-btn"
              onClick={toggleDarkMode}
              title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
              style={{ marginLeft: '16px' }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="search-box-wrapper" style={{ position: 'relative' }}>
              <div className="search-box glass" style={{ marginBottom: 0, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '14px' }}>
                <Search size={18} className="text-secondary" />
                <input
                  type="text"
                  placeholder="ابحث بذكاء عن عميل، عقد، أو فاتورة..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '14px' }}
                />
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <Command size={10} style={{ marginLeft: '4px' }} /> K
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results-floating glass" style={{
                  position: 'absolute',
                  top: '120%',
                  left: 0,
                  right: 0,
                  zIndex: 200,
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {searchResults.map((res, i) => (
                    <Link
                      key={i}
                      to={res.link}
                      className="search-result-item"
                      onClick={() => setGlobalSearch('')} // Clear search on click
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        color: 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: res.type === 'customer' ? 'var(--primary)' : '#e67e22'
                      }}>
                        {res.type === 'customer' ? <Users size={16} /> : res.type === 'contract' ? <FileText size={16} /> : <Receipt size={16} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{res.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{res.type === 'customer' ? 'عميل' : ''} • {res.status || ''}</div>
                      </div>
                      <ArrowRight size={14} className="text-muted" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="user-profile-wrapper" style={{ position: 'relative' }} ref={menuRef}>
              <div
                className={`user-profile ${isUserMenuOpen ? 'active' : ''}`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: '700' }}>{currentUser.name || currentUser.username}</span>
                  <span className="text-secondary" style={{ fontSize: '10px' }}>{currentUser.role === 'admin' ? 'مدير نظام' : 'مهندس'}</span>
                </div>
                <div className="avatar">{(currentUser.name || currentUser.username || '?').charAt(0)}</div>
              </div>

              {isUserMenuOpen && (
                <div className="user-dropdown-menu glass" style={{
                  position: 'absolute',
                  top: '120%',
                  left: 0,
                  minWidth: '200px',
                  zIndex: 200,
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  animation: 'slideDown 0.3s ease',
                  background: 'rgba(23, 23, 25, 0.95)'
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid var(--border-glass)', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{currentUser.username} @ كينز</div>
                  </div>

                  <Link to="/profile" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.2s' }}>
                    <Settings size={16} />
                    <span style={{ fontSize: '13px' }}>إعدادات الحساب</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="dropdown-item logout-nav"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '4px'
                    }}
                  >
                    <LogOut size={16} />
                    <span style={{ fontSize: '13px' }}>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-container">
          <Routes>
            <Route path="/" element={<ProtectedRoute perm={perms.canViewDashboard}><Dashboard /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute perm={perms.canManageCustomers}><Customers /></ProtectedRoute>} />
            <Route path="/purchasing" element={<ProtectedRoute perm={perms.canManagePurchases}><Purchasing /></ProtectedRoute>} />

            <Route path="/deliveries" element={<ProtectedRoute perm={perms.canManageDeliveries}><Deliveries /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute perm={perms.canManageFinance}><Finance /></ProtectedRoute>} />
            <Route path="/inspection/:id" element={<ProtectedRoute perm={perms.canManageInspections}><InspectionDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<ProtectedRoute perm={perms.canManageUsers}><SettingsScreen /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children, perm }) => {
  if (perm !== undefined && !perm) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#ff4d4d' }}>عذراً، ليس لديك صلاحية للوصول لهذه الصفحة</h2>
        <p>يرجى التواصل مع مدير النظام لتعديل صلاحياتك.</p>
      </div>
    );
  }
  return children;
};

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
