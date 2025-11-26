import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logomerlin.png';
import {
  FiHome, FiSettings, FiUsers, FiCheckSquare, FiFolder,
  FiChevronsLeft, FiChevronsRight, FiChevronDown, FiChevronUp,
  FiBarChart2
} from 'react-icons/fi';

import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../constant';
import './Sidebar.css';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

function Sidebar({
  isOpen,
  onClose,
  isMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const [showParameter, setShowParameter] = useState(false);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const isActive = (path: string) => location.pathname === path;
  const renderText = (text: string) => isCollapsed ? null : <span className="ms-2">{text}</span>;

  return (
    <>
      {isOpen && isMobile && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <div
        className="sidebar d-flex flex-column p-3"
        style={{
          width: `${isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`,
          left: isMobile && !isOpen ? `-${SIDEBAR_WIDTH}px` : 0,
        }}
      >
        <div className="text-end d-md-none mb-2">
          <button className="btn-close-mobile" onClick={onClose}>✕</button>
        </div>

        <div className="mb-4 text-center">
          <img
            src={logo}
            alt="MERLIN Logo"
            className={`sidebar-logo ${isCollapsed ? 'collapsed' : ''}`}
            style={isMobile ? { maxWidth: 100, margin: '0 auto' } : {}}
          />
        </div>

        {!isMobile && (
          <div className="text-end mb-3">
            <button onClick={onToggleCollapse} className="btn btn-sm btn-outline-accent w-100">
              {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
            </button>
          </div>
        )}

        <ul className="nav flex-column gap-2">
          {/* Home */}
          <li>
            <Link
              to="/"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}
            >
              <FiHome className="sidebar-icon" /> {renderText('Home')}
            </Link>
          </li>

          {/* Merchant Engine */}
          <li>
            <Link
              to="/merchant-engine"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/merchant-engine') ? 'active' : ''}`}
            >
              <FiFolder className="sidebar-icon" /> {renderText('Merchant Engine')}
            </Link>
          </li>

          {/* Customer Affinity */}
          {/* <li>
            <Link
              to="/customer-affinity"
              onClick={isMobile ? onClose : undefined}
              className={`nav-link sidebar-link ${isActive('/customer-affinity') ? 'active' : ''}`}
            >
              <FiBarChart2 className="sidebar-icon" /> {renderText('Customer Affinity')}
            </Link>
          </li> */}

          {/* Parameter Section */}
          <li>
            <div
              className="nav-link sidebar-link fw-bold d-flex align-items-center justify-content-between"
              onClick={() => setShowParameter((p) => !p)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <FiSettings className="sidebar-icon" /> {renderText('Parameter')}
              </div>
              {!isCollapsed && (
                showParameter ? <FiChevronUp className="ms-auto" /> : <FiChevronDown className="ms-auto" />
              )}
            </div>
            {!isCollapsed && showParameter && (
              <ul className="nav flex-column ms-3">
                <li>
                  <Link
                    to="/users"
                    onClick={isMobile ? onClose : undefined}
                    className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}
                  >
                    <FiUsers className="sidebar-icon" /> {renderText('Users')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user-approval"
                    onClick={isMobile ? onClose : undefined}
                    className={`nav-link sidebar-link ${isActive('/user-approval') ? 'active' : ''}`}
                  >
                    <FiCheckSquare className="sidebar-icon" /> {renderText('Approval User')}
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
