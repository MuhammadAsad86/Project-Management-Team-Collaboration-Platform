import { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  getAssignedTasks,
} from "../services/taskService";

import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiList,
} from "react-icons/fi";

const Calendar = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isTeamMember =
    currentUser?.role === "team_member";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const allTasks = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const params = {
          page,
          limit: 100,
        };

        const response = isTeamMember
          ? await getAssignedTasks(params)
          : await getTasks(params);

        allTasks.push(...(response.tasks || []));

        hasNextPage = response.hasNextPage || false;
        page += 1;
      }

      setTasks(allTasks);
    } catch (error) {
      console.error(
        "Calendar Tasks API Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load calendar tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, [isTeamMember]);

  const tasksWithDueDates = useMemo(() => {
    return tasks.filter((task) => task.dueDate);
  }, [tasks]);

  const tasksForCurrentMonth = useMemo(() => {
    return tasksWithDueDates.filter((task) => {
      const dueDate = new Date(task.dueDate);

      return (
        dueDate >= monthStart &&
        dueDate <= monthEnd
      );
    });
  }, [
    tasksWithDueDates,
    currentDate,
  ]);

  const getTasksForDate = (date) => {
    return tasksForCurrentMonth.filter(
      (task) => {
        const dueDate = new Date(
          task.dueDate
        );

        return (
          dueDate.getFullYear() ===
            date.getFullYear() &&
          dueDate.getMonth() ===
            date.getMonth() &&
          dueDate.getDate() ===
            date.getDate()
        );
      }
    );
  };

  const firstDayOfMonth = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      )
    );
  }

  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    calendarDays.push(null);
  }

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    if (!date) return false;

    const today = new Date();

    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const getStatusStyle = (status = "") => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { bg: "rgba(16, 185, 129, 0.1)", text: "#047857" };
      case "in_progress":
        return { bg: "rgba(79, 70, 229, 0.1)", text: "#4338CA" };
      case "review":
        return { bg: "rgba(124, 58, 237, 0.1)", text: "#6D28D9" };
      default:
        return { bg: "rgba(245, 158, 11, 0.12)", text: "#B45309" };
    }
  };

  return (
    <div className="flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. PAGE HEADER */}
      <div
        className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "6px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span
              className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 text-xs font-semibold text-indigo-700"
              style={{ padding: "4px 12px", gap: "6px", whiteSpace: "nowrap" }}
            >
              <FiCalendar className="h-3.5 w-3.5 shrink-0" />
              Schedule & Milestones
            </span>
          </div>
          <h1
            className="truncate text-xl font-bold text-slate-900 sm:text-2xl"
            style={{ margin: 0 }}
          >
            Calendar
          </h1>
          <p
            className="truncate text-xs font-medium text-slate-500 sm:text-sm"
            style={{ margin: 0 }}
          >
            View tasks by their due dates and track upcoming project deliverables.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex shrink-0 items-center" style={{ gap: "8px" }}>
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            style={{ padding: "8px 14px", gap: "6px" }}
          >
            <FiChevronLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="flex items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
            style={{ padding: "8px 16px" }}
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            style={{ padding: "8px 14px", gap: "6px" }}
          >
            <span className="hidden sm:inline">Next</span>
            <FiChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* 2. CALENDAR CONTAINER */}
      <div className="w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm" style={{ padding: "20px" }}>
        {/* Month Title Bar with Explicit Bottom Margin */}
        <div 
          className="flex items-center justify-between border-b border-slate-100" 
          style={{ paddingBottom: "16px", marginBottom: "20px" }}
        >
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FiCalendar className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900" style={{ margin: 0 }}>
              {monthName}
            </h2>
          </div>

          <span 
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
            style={{ padding: "4px 12px", whiteSpace: "nowrap" }}
          >
            {tasksForCurrentMonth.length} Due This Month
          </span>
        </div>

        {/* Loading Banner */}
        {loading && (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: "48px 20px", gap: "12px" }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-600" />
            <p className="text-xs font-medium text-slate-500">
              Loading calendar tasks...
            </p>
          </div>
        )}

        {/* Error Banner */}
        {!loading && error && (
          <div
            className="rounded-2xl border border-red-200 bg-red-50/70 text-center text-xs font-semibold text-red-600 shadow-sm"
            style={{ padding: "16px 20px" }}
          >
            {error}
          </div>
        )}

        {/* 3. CALENDAR GRID */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Day Name Headers */}
                <div className="grid grid-cols-7 rounded-t-xl border border-slate-200/80 bg-slate-50/80 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {[
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((day) => (
                    <div
                      key={day}
                      style={{ padding: "12px 8px" }}
                      className="border-r last:border-r-0 border-slate-200/80"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Date Grid Cells */}
                <div 
                  className="grid grid-cols-7 border-l border-b border-r border-slate-200/80 rounded-b-xl overflow-hidden bg-slate-100" 
                  style={{ gap: "1px" }}
                >
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="bg-slate-50/40"
                          style={{ minHeight: "115px" }}
                        />
                      );
                    }

                    const dayTasks = getTasksForDate(date);
                    const currentToday = isToday(date);

                    return (
                      <div
                        key={date.toISOString()}
                        className={`flex flex-col transition-colors ${
                          currentToday
                            ? "bg-indigo-50/40"
                            : "bg-white hover:bg-slate-50/60"
                        }`}
                        style={{ minHeight: "115px", padding: "10px" }}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                              currentToday
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                : "text-slate-700 bg-slate-100"
                            }`}
                          >
                            {date.getDate()}
                          </span>

                          {dayTasks.length > 0 && (
                            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 rounded-full px-1.5 py-0.5">
                              {dayTasks.length}
                            </span>
                          )}
                        </div>

                        {/* Task List Pills inside Cell */}
                        <div className="flex flex-col space-y-1.5 overflow-y-auto max-h-[85px]">
                          {dayTasks.map((task) => {
                            const statusStyle = getStatusStyle(task.status);

                            return (
                              <div
                                key={task._id}
                                className="rounded-lg border border-slate-200/80 bg-white shadow-xs transition-all hover:border-indigo-300"
                                style={{ padding: "6px 8px" }}
                              >
                                <p
                                  className="truncate text-[11px] font-bold text-slate-800"
                                  style={{ margin: 0, lineHeight: "1.3" }}
                                >
                                  {task.title}
                                </p>

                                <div className="mt-1 flex items-center justify-between gap-1">
                                  <span
                                    className="inline-block truncate rounded-full text-[9px] font-extrabold capitalize"
                                    style={{
                                      padding: "1px 6px",
                                      backgroundColor: statusStyle.bg,
                                      color: statusStyle.text,
                                    }}
                                  >
                                    {task.status?.replace("_", " ")}
                                  </span>

                                  {task.project?.name && (
                                    <span className="truncate text-[9px] font-medium text-slate-400 max-w-[60px]">
                                      {task.project.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. SUMMARY STATS FOOTER */}
            <div
              className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
              style={{ gap: "16px" }}
            >
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70" style={{ padding: "12px 16px" }}>
                <div className="flex items-center" style={{ gap: "10px" }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <FiList className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Total Tasks</span>
                </div>
                <span className="text-base font-extrabold text-slate-900">{tasks.length}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70" style={{ padding: "12px 16px" }}>
                <div className="flex items-center" style={{ gap: "10px" }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                    <FiClock className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">With Due Dates</span>
                </div>
                <span className="text-base font-extrabold text-slate-900">{tasksWithDueDates.length}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70" style={{ padding: "12px 16px" }}>
                <div className="flex items-center" style={{ gap: "10px" }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <FiCheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Due This Month</span>
                </div>
                <span className="text-base font-extrabold text-slate-900">{tasksForCurrentMonth.length}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Calendar;