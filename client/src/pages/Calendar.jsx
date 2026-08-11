import { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  getAssignedTasks,
} from "../services/taskService";

const Calendar = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isTeamMember =
    currentUser?.role === "team_member";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] =
    useState(new Date());

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

        hasNextPage =
          response.hasNextPage || false;

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

  const firstDayOfMonth =
    monthStart.getDay();

  const daysInMonth =
    monthEnd.getDate();

  const calendarDays = [];

  for (
    let i = 0;
    i < firstDayOfMonth;
    i++
  ) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      )
    );
  }

  const monthName =
    currentDate.toLocaleString(
      "default",
      {
        month: "long",
        year: "numeric",
      }
    );

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
      today.getFullYear() ===
        date.getFullYear() &&
      today.getMonth() ===
        date.getMonth() &&
      today.getDate() ===
        date.getDate()
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Calendar
          </h1>

          <p className="mt-1 text-gray-500">
            View tasks by their due dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded border bg-white px-3 py-2 hover:bg-gray-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded border bg-white px-3 py-2 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Month */}
      <div className="rounded-lg bg-white p-5 shadow">
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold">
            {monthName}
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-10 text-center text-gray-500">
            Loading calendar...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Calendar */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-7 border-l border-t">
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
                  className="border-b border-r bg-gray-50 p-3 text-center text-sm font-semibold text-gray-600"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map(
                (date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[130px] border-b border-r bg-gray-50"
                      />
                    );
                  }

                  const dayTasks =
                    getTasksForDate(
                      date
                    );

                  return (
                    <div
                      key={date.toISOString()}
                      className={`min-h-[130px] border-b border-r p-2 ${
                        isToday(date)
                          ? "bg-blue-50"
                          : "bg-white"
                      }`}
                    >
                      <div
                        className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday(date)
                            ? "bg-blue-600 text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayTasks.map(
                          (task) => (
                            <div
                              key={task._id}
                              className="rounded bg-gray-100 p-2 text-xs"
                            >
                              <p className="font-semibold text-gray-800">
                                {task.title}
                              </p>

                              <p className="mt-1 capitalize text-gray-500">
                                {task.status?.replace(
                                  "_",
                                  " "
                                )}
                              </p>

                              {task.project?.name && (
                                <p className="mt-1 truncate text-gray-400">
                                  {task.project.name}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Summary */}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>
                Total tasks:{" "}
                <strong>
                  {tasks.length}
                </strong>
              </span>

              <span>
                Tasks with due dates:{" "}
                <strong>
                  {tasksWithDueDates.length}
                </strong>
              </span>

              <span>
                This month:{" "}
                <strong>
                  {
                    tasksForCurrentMonth.length
                  }
                </strong>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Calendar;