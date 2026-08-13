import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiLogOut,
  FiMenu,
  FiCheck,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

const formatRole = (role) => {
  if (!role) return "";
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const Navbar = ({ onOpenMobileNav = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const notificationRef = useRef(null);

  const loadNotifications = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoadingNotifications(true);
      }
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      if (isInitial) {
        setLoadingNotifications(false);
      }
    }
  };

  // Initial load and background polling to fix unread badge update bug
  useEffect(() => {
    if (!user) return;

    loadNotifications(true);

    const intervalId = setInterval(() => {
      loadNotifications(false);
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item
          )
        );
        setUnreadCount((current) => Math.max(current - 1, 0));
      }

      setShowNotifications(false);

      if (notification.relatedProject?._id) {
        navigate(`/projects/${notification.relatedProject._id}`);
      }
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAllRead) return;

    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const initials = (user?.name || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const roleLabel = formatRole(user?.role) || "Admin";

  return (
    <header className="w-full max-w-full box-border overflow-visible relative" style={{ zIndex: 100 }}>
      <div 
        className="relative flex w-full flex-row items-center justify-between rounded-2xl border border-white/80 bg-white/90 shadow-md backdrop-blur-2xl overflow-visible"
        style={{ padding: "8px 20px", gap: "16px", marginBottom: "6px" }}
      >
        
        {/* LEFT SIDE - Welcome Text */}
        <div className="flex items-center" style={{ gap: "12px", minWidth: 0 }}>
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm md:hidden"
            aria-label="Open navigation menu"
          >
            <FiMenu className="h-4 w-4" />
          </button>

          <div style={{ minWidth: 0 }}>
            <h1 className="truncate text-sm font-bold text-slate-800 sm:text-base lg:text-lg" style={{ lineHeight: "1.2" }}>
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="hidden truncate text-[11px] text-slate-500 sm:block" style={{ marginTop: "2px", lineHeight: "1" }}>
              Manage your workspace and stay productive.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Notification, Profile, Logout */}
        <div className="flex shrink-0 items-center overflow-visible" style={{ gap: "12px" }}>
          
          {/* REDESIGNED NOTIFICATION SECTION */}
          <div ref={notificationRef} className="relative shrink-0 overflow-visible">
            {/* Bell Trigger Button */}
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className={`relative flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
                showNotifications 
                  ? "border-indigo-500/80 bg-indigo-50/80 text-indigo-600 ring-2 ring-indigo-500/20 shadow-xs" 
                  : "border-slate-200/90 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800"
              }`}
              style={{ width: "38px", height: "38px" }}
              aria-label="Notifications"
            >
              <FiBell className={`h-4 w-4 transition-transform ${unreadCount > 0 ? "animate-subtle-bounce" : ""}`} />
              
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-1 text-[9px] font-black text-white ring-2 ring-white shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Floating Panel */}
            {showNotifications && (
              <div 
                className="absolute right-0 top-[calc(100%+14px)] z-[9999] w-[340px] sm:w-[380px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden flex flex-col animate-fade-in"
                style={{
                  boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 2px 1px rgba(15, 23, 42, 0.08)",
                }}
              >
                {/* Panel Header */}
                <div 
                  className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white shrink-0 shadow-2xs" 
                  style={{ padding: "16px 18px", gap: "12px" }}
                >
                  <div className="flex items-center min-w-0" style={{ gap: "8px" }}>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider truncate" style={{ margin: 0 }}>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="shrink-0 rounded-full border border-indigo-200/60 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead}
                      className="flex items-center text-[11px] font-semibold text-indigo-600 transition-colors hover:text-indigo-800 disabled:opacity-50 shrink-0 cursor-pointer"
                      style={{ gap: "4px" }}
                    >
                      <FiCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>{markingAllRead ? "Marking..." : "Mark all read"}</span>
                    </button>
                  )}
                </div>

                {/* Notification List Scroll Area */}
                <div 
                  className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80"
                  style={{ paddingTop: "4px", paddingBottom: "8px" }}
                >
                  {loadingNotifications ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center" style={{ gap: "10px" }}>
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600" />
                      <p className="text-xs font-medium text-slate-500">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center" style={{ gap: "8px" }}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <FiBell className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800" style={{ margin: 0 }}>All caught up!</p>
                      <p className="text-[11px] font-medium text-slate-400 max-w-[200px]" style={{ margin: 0 }}>
                        No new notifications right now. Check back later for updates.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => {
                      const isUnread = !notification.read;
                      const isLast = index === notifications.length - 1;

                      return (
                        <button
                          type="button"
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`group flex w-full flex-col text-left transition-all cursor-pointer min-w-0 ${
                            isUnread 
                              ? "bg-indigo-50/40 hover:bg-indigo-50/70 border-l-2 border-indigo-600" 
                              : "bg-white hover:bg-slate-50/80"
                          } ${isLast ? "mb-2" : ""}`}
                          style={{ 
                            padding: "12px 16px",
                            gap: "6px" 
                          }}
                        >
                          {/* Top Row: Title */}
                          <div className="flex items-center justify-between w-full min-w-0" style={{ gap: "8px" }}>
                            <span 
                              className={`truncate text-xs ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}
                              style={{ margin: 0 }}
                            >
                              {notification.title}
                            </span>
                          </div>

                          {/* Middle Row: Message Text */}
                          <p 
                            className="text-[11px] font-medium text-slate-500 leading-snug break-words" 
                            style={{ 
                              margin: 0,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}
                          >
                            {notification.message}
                          </p>

                          {/* Bottom Row: Meta / Time Area */}
                          {notification.createdAt && (
                            <div className="flex items-center justify-end w-full pt-1" style={{ gap: "4px" }}>
                              <span className="flex items-center text-[10px] font-medium text-slate-400 shrink-0" style={{ gap: "4px" }}>
                                <FiClock className="h-3 w-3 shrink-0 text-slate-400" />
                                <span>
                                  {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PROFILE CARD */}
          <div 
            className="flex shrink-0 items-center rounded-xl border border-slate-200/80 bg-slate-50/90 shadow-sm"
            style={{ padding: "4px 12px 4px 6px", gap: "10px", height: "38px" }}
          >
            <div
              className="flex shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-sm"
              style={{
                width: "30px",
                height: "30px",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              }}
            >
              {initials}
            </div>

            <div className="hidden flex-col justify-center leading-tight md:flex" style={{ gap: "0px" }}>
              <p className="whitespace-nowrap text-[11px] font-bold text-slate-800" style={{ margin: 0, padding: 0 }}>
                {user?.name || "User"}
              </p>
              <p className="whitespace-nowrap text-[9px] font-semibold text-indigo-500" style={{ margin: 0, padding: 0 }}>
                {roleLabel}
              </p>
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            onClick={logout}
            className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
            style={{ 
              height: "38px", 
              paddingLeft: "16px", 
              paddingRight: "16px", 
              gap: "6px",
              whiteSpace: "nowrap"
            }}
          >
            <FiLogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Logout</span>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Navbar;