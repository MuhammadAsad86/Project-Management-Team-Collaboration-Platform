import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getProjectById,
  getProjectWorkspace,
  addProjectMember,
  removeProjectMember,
} from "../services/projectService";

import {
  getTaskComments,
  addTaskComment,
  deleteTaskComment,
} from "../services/taskService";

import { getUsers } from "../services/userService";
import toast from "react-hot-toast";

const ProjectDetails = () => {
  const { id } = useParams();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [removingMember, setRemovingMember] =
    useState(null);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [showMemberModal, setShowMemberModal] =
    useState(false);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [addingMember, setAddingMember] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("overview");

  // Discussion states
  const [discussionTask, setDiscussionTask] =
    useState(null);

  const [comments, setComments] = useState([]);

  const [commentMessage, setCommentMessage] =
    useState("");

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id);

        console.log(
          "fetchProject response:",
          data
        );

        console.log(
          "fetchProject tasks:",
          data.tasks
        );

        setProject(data.project);
        setTasks(data.tasks || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    fetchWorkspace();
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const data =
        await getProjectWorkspace(id);

      setWorkspace(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to load workspace"
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers({
        role: "team_member",
      });

      const assignedIds =
        project?.teamMembers?.map(
          (member) => member._id
        ) || [];

      const availableUsers = (
        data.users || []
      ).filter(
        (user) =>
          !assignedIds.includes(user._id)
      );

      setUsers(availableUsers);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to load users"
      );
    }
  };

  const handleRemoveMember = async (
    memberId
  ) => {
    setRemovingMember(memberId);

    try {
      await removeProjectMember(
        id,
        memberId
      );

      toast.success(
        "Member removed successfully"
      );

      const data =
        await getProjectById(id);

      setProject(data.project);
      setTasks(data.tasks || []);

      fetchWorkspace();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to remove member"
      );
    } finally {
      setRemovingMember(null);
    }
  };

  // Get comments for selected task
  const fetchTaskComments = async (taskId) => {
    if (!taskId) return;

    setCommentsLoading(true);

    try {
      const data =
        await getTaskComments(taskId);

      setComments(data.comments || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to load comments"
      );

      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!discussionTask) {
      toast.error("Please select a task");
      return;
    }

    if (!commentMessage.trim()) {
      toast.error(
        "Comment message is required"
      );
      return;
    }

    if (
      commentMessage.trim().length > 1000
    ) {
      toast.error(
        "Comment cannot exceed 1000 characters"
      );
      return;
    }

    setCommentSubmitting(true);

    try {
      const data = await addTaskComment(
        discussionTask._id,
        commentMessage.trim()
      );

      toast.success(
        data.message ||
        "Comment added successfully"
      );

      setCommentMessage("");

      await fetchTaskComments(
        discussionTask._id
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to add comment"
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete Own Comment
  const handleDeleteComment = async (
    commentId
  ) => {
    if (!commentId) {
      toast.error("Invalid comment");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data =
        await deleteTaskComment(commentId);

      toast.success(
        data.message ||
        "Comment deleted successfully"
      );

      if (discussionTask?._id) {
        await fetchTaskComments(
          discussionTask._id
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to delete comment"
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center text-lg">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center text-red-500">
        Project not found.
      </div>
    );
  }

  const totalTasks =
    workspace?.statistics?.totalTasks ?? 0;

  const completedTasks =
    workspace?.statistics?.completedTasks ?? 0;

  const inProgressTasks =
    workspace?.statistics?.inProgressTasks ?? 0;

  const reviewTasks =
    workspace?.statistics?.reviewTasks ?? 0;

  const pendingTasks =
    workspace?.statistics?.pendingTasks ?? 0;

  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
        (completedTasks / totalTasks) * 100
      );

  console.log("Tasks State:", tasks);

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">
          {project.name}
        </h1>

        <p className="mt-2 text-gray-600">
          {project.description ||
            "No description"}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-semibold capitalize">
              {project.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Priority
            </p>

            <p className="font-semibold capitalize">
              {project.priority}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Project Manager
            </p>

            <p className="font-semibold">
              {project.assignedManager?.name ||
                project.projectManager?.name ||
                "Not Assigned"}
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-wrap gap-3 border-b pb-3">
          <button
            onClick={() =>
              setActiveTab("overview")
            }
            className={`rounded px-4 py-2 ${activeTab === "overview"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
              }`}
          >
            Overview
          </button>

          <button
            onClick={() =>
              setActiveTab("tasks")
            }
            className={`rounded px-4 py-2 ${activeTab === "tasks"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
              }`}
          >
            Tasks
          </button>

          <button
            onClick={() =>
              setActiveTab("members")
            }
            className={`rounded px-4 py-2 ${activeTab === "members"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
              }`}
          >
            Members
          </button>

          <button
            onClick={() =>
              setActiveTab("discussion")
            }
            className={`rounded px-4 py-2 ${activeTab === "discussion"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
              }`}
          >
            Discussion
          </button>

          <button
            onClick={() =>
              setActiveTab("progress")
            }
            className={`rounded px-4 py-2 ${activeTab === "progress"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
              }`}
          >
            Progress
          </button>
        </div>
      </div>

      {/* Project Overview */}
      {activeTab === "overview" && (
        <>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">
              Project Overview
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Project Name
                </p>

                <p className="font-semibold">
                  {project.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p className="font-semibold capitalize">
                  {project.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Priority
                </p>

                <p className="font-semibold capitalize">
                  {project.priority}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Tasks
                </p>

                <p className="font-semibold">
                  {tasks.length}
                </p>
              </div>
            </div>
          </div>

          {/* Workspace Statistics */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">
              Workspace Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="rounded border p-4 text-center">
                <p className="text-sm text-gray-500">
                  Total Tasks
                </p>

                <p className="text-2xl font-bold">
                  {totalTasks}
                </p>
              </div>

              <div className="rounded border p-4 text-center">
                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="text-2xl font-bold text-green-600">
                  {completedTasks}
                </p>
              </div>

              <div className="rounded border p-4 text-center">
                <p className="text-sm text-gray-500">
                  In Progress
                </p>

                <p className="text-2xl font-bold text-yellow-600">
                  {inProgressTasks}
                </p>
              </div>

              <div className="rounded border p-4 text-center">
                <p className="text-sm text-gray-500">
                  Review
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {reviewTasks}
                </p>
              </div>

              <div className="rounded border p-4 text-center">
                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <p className="text-2xl font-bold text-red-600">
                  {pendingTasks}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Team Members */}
      {activeTab === "members" && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            Team Members
          </h2>

          {project.teamMembers?.length ===
            0 ? (
            <div>
              <p className="text-gray-500">
                No team members assigned.
              </p>

              <button
                onClick={() => {
                  setShowMemberModal(true);
                  fetchUsers();
                }}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
              >
                Add Member
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {project.teamMembers.map(
                (member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {member.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {member.email}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleRemoveMember(
                          member._id
                        )
                      }
                      disabled={
                        removingMember ===
                        member._id
                      }
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {removingMember ===
                        member._id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                )
              )}

              <button
                onClick={() => {
                  setShowMemberModal(true);
                  fetchUsers();
                }}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
              >
                Add Member
              </button>
            </div>
          )}
        </div>
      )}

      {/* Project Tasks */}
      {activeTab === "tasks" && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            Project Tasks
          </h2>

          {tasks.length === 0 ? (
            <p className="text-gray-500">
              No tasks found.
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className="mb-3 rounded border p-4"
              >
                <h3 className="font-semibold">
                  {task.title}
                </h3>

                <p className="text-sm">
                  {task.status}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Discussion */}
      {activeTab === "discussion" && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-bold">
            Task Discussion
          </h2>

          {(() => {
            const discussionTasks =
              user?.role === "team_member"
                ? tasks.filter(
                  (task) =>
                    task.assignedTo?._id ===
                    user.id ||
                    task.assignedTo === user.id
                )
                : tasks;

            return discussionTasks.length ===
              0 ? (
              <p className="text-gray-500">
                No tasks available for discussion.
              </p>
            ) : (
              <>
                {/* Task List */}
                <div className="space-y-3">
                  {discussionTasks.map(
                    (task) => (
                      <button
                        key={task._id}
                        onClick={() => {
                          setDiscussionTask(
                            task
                          );
                          setComments([]);
                          setCommentMessage(
                            ""
                          );
                          fetchTaskComments(
                            task._id
                          );
                        }}
                        className={`w-full rounded-lg border p-4 text-left transition ${discussionTask?._id ===
                            task._id
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {task.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {task.description ||
                                "No description"}
                            </p>
                          </div>

                          <span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">
                            {task.status}
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>

                {/* Selected Task Discussion */}
                {discussionTask && (
                  <div className="mt-6 rounded-lg border p-5">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold">
                        {discussionTask.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Task Discussion
                      </p>
                    </div>

                    {/* Comments */}
                    {commentsLoading ? (
                      <p className="text-gray-500">
                        Loading comments...
                      </p>
                    ) : comments.length ===
                      0 ? (
                      <p className="text-gray-500">
                        No comments yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {comments.map(
                          (comment) => (
                            <div
                              key={
                                comment._id
                              }
                              className="rounded-lg border bg-gray-50 p-4"
                            >
                              <div className="mb-2 flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-semibold">
                                    {comment
                                      .user
                                      ?.name ||
                                      "Unknown User"}
                                  </p>

                                  <p className="text-xs capitalize text-gray-500">
                                    {comment.user?.role?.replace(
                                      "_",
                                      " "
                                    ) ||
                                      "Unknown Role"}
                                  </p>
                                </div>

                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleString()}
                                </span>
                              </div>

                              <p className="text-gray-700">
                                {
                                  comment.message
                                }
                              </p>
                              {comment.user?._id === user?.id && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-6 border-t pt-5">
                      <h4 className="mb-3 font-semibold">
                        Add Comment
                      </h4>

                      <textarea
                        value={
                          commentMessage
                        }
                        onChange={(e) =>
                          setCommentMessage(
                            e.target.value
                          )
                        }
                        placeholder="Write your comment..."
                        maxLength={1000}
                        rows={4}
                        className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                      />

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {
                            commentMessage.length
                          }
                          /1000
                        </span>

                        <button
                          onClick={
                            handleAddComment
                          }
                          disabled={
                            commentSubmitting ||
                            !commentMessage.trim()
                          }
                          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {commentSubmitting
                            ? "Posting..."
                            : "Post Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Project Progress */}
      {activeTab === "progress" && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-bold">
            Project Progress
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded border p-4 text-center">
              <p className="text-sm text-gray-500">
                Total Tasks
              </p>

              <p className="text-2xl font-bold">
                {totalTasks}
              </p>
            </div>

            <div className="rounded border p-4 text-center">
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <p className="text-2xl font-bold text-green-600">
                {completedTasks}
              </p>
            </div>

            <div className="rounded border p-4 text-center">
              <p className="text-sm text-gray-500">
                In Progress
              </p>

              <p className="text-2xl font-bold text-yellow-600">
                {inProgressTasks}
              </p>
            </div>

            <div className="rounded border p-4 text-center">
              <p className="text-sm text-gray-500">
                Review
              </p>

              <p className="text-2xl font-bold text-blue-600">
                {reviewTasks}
              </p>
            </div>

            <div className="rounded border p-4 text-center">
              <p className="text-sm text-gray-500">
                Pending
              </p>

              <p className="text-2xl font-bold text-red-600">
                {pendingTasks}
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-8">
            <div className="mb-2 flex justify-between">
              <span className="font-medium">
                Overall Progress
              </span>

              <span className="font-semibold">
                {progressPercentage}%
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-green-600 transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">
              Add Team Member
            </h2>

            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded border p-2"
            />

            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-gray-500">
                  No team members found.
                </p>
              ) : (
                <>
                  {filteredUsers.length ===
                    0 ? (
                    <p className="text-center text-gray-500">
                      No matching members found.
                    </p>
                  ) : (
                    filteredUsers.map(
                      (user) => (
                        <div
                          key={user._id}
                          className="flex justify-between rounded border p-3"
                        >
                          <div>
                            <p className="font-semibold">
                              {user.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedMember(
                                user
                              )
                            }
                            className={`rounded px-3 py-1 text-white ${selectedMember?._id ===
                                user._id
                                ? "bg-green-600"
                                : "bg-blue-600"
                              }`}
                          >
                            {selectedMember?._id ===
                              user._id
                              ? "Selected"
                              : "Select"}
                          </button>
                        </div>
                      )
                    )
                  )}
                </>
              )}
            </div>

            {selectedMember && (
              <p className="mb-3 text-sm text-gray-600">
                Selected:{" "}
                {selectedMember.name}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedMember(null);
                  setSearch("");
                }}
                className="rounded bg-gray-300 px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!selectedMember) {
                    toast.error(
                      "Please select a member"
                    );
                    return;
                  }

                  setAddingMember(true);

                  try {
                    await addProjectMember(
                      id,
                      selectedMember._id
                    );

                    toast.success(
                      `${selectedMember.name} added successfully`
                    );

                    setShowMemberModal(false);
                    setSelectedMember(null);
                    setSearch("");

                    const data =
                      await getProjectById(
                        id
                      );

                    setProject(
                      data.project
                    );

                    setTasks(
                      data.tasks || []
                    );

                    fetchWorkspace();
                  } catch (error) {
                    toast.error(
                      error.response?.data
                        ?.message ||
                      "Failed to add member"
                    );
                  } finally {
                    setAddingMember(false);
                  }
                }}
                disabled={addingMember}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {addingMember
                  ? "Adding..."
                  : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;