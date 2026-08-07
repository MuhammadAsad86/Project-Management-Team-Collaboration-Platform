import { useEffect, useState } from "react";

import { getProjects } from "../../services/projectService";
import { getUsers } from "../../services/userService";

const TaskForm = ({
  onSubmit,
  loading = false,
  initialData = {},
}) => {

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);


  const [formData, setFormData] = useState({
    title: initialData.title || "",

    description:
      initialData.description || "",

    project:
      initialData.project?._id ||
      initialData.project ||
      "",

    assignedTo:
      initialData.assignedTo?._id ||
      initialData.assignedTo ||
      "",

    priority:
      initialData.priority || "medium",

    status:
      initialData.status || "todo",

    dueDate:
      initialData.dueDate || "",
  });


  // Update form when editing task
  useEffect(() => {

    setFormData({

      title:
        initialData.title || "",


      description:
        initialData.description || "",


      project:
        initialData.project?._id ||
        initialData.project ||
        "",


      assignedTo:
        initialData.assignedTo?._id ||
        initialData.assignedTo ||
        "",


      priority:
        initialData.priority || "medium",


      status:
        initialData.status || "todo",


      dueDate:
        initialData.dueDate
          ? initialData.dueDate.split("T")[0]
          : "",

    });

  }, [initialData]);



  // Load Projects and Users
  useEffect(() => {

    const fetchData = async () => {

      try {

        const projectResponse =
          await getProjects();


        setProjects(
          projectResponse.projects || []
        );


      } catch (error) {

        console.error(
          "Projects Dropdown Error:",
          error
        );

      }



      try {

        const userResponse =
          await getUsers();


        setUsers(
          userResponse.users || []
        );


      } catch (error) {

        console.error(
          "Users Dropdown Error:",
          error
        );

      }

    };


    fetchData();

  }, []);



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };



  const handleSubmit = (e) => {

    e.preventDefault();

    onSubmit(formData);

  };



  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >


      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Task title"
        className="w-full rounded-lg border px-3 py-2"
        required
      />



      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Task description"
        className="w-full rounded-lg border px-3 py-2"
      />



      {/* Project */}

      <select
        name="project"
        value={formData.project}
        onChange={handleChange}
        className="w-full rounded-lg border px-3 py-2"
        required
      >

        <option value="">
          Select Project
        </option>


        {projects.map((project) => (

          <option
            key={project._id}
            value={project._id}
          >

            {project.name}

          </option>

        ))}

      </select>



      {/* Assigned User */}

      <select
        name="assignedTo"
        value={formData.assignedTo}
        onChange={handleChange}
        className="w-full rounded-lg border px-3 py-2"
        required
      >

        <option value="">
          Select User
        </option>


        {users.map((user) => (

          <option
            key={user._id}
            value={user._id}
          >

            {user.name}

          </option>

        ))}

      </select>



      {/* Priority */}

      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        className="w-full rounded-lg border px-3 py-2"
      >

        <option value="low">
          Low
        </option>

        <option value="medium">
          Medium
        </option>

        <option value="high">
          High
        </option>

      </select>



      {/* Status */}

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full rounded-lg border px-3 py-2"
      >

        <option value="todo">
          Todo
        </option>

        <option value="in_progress">
          In Progress
        </option>

        <option value="completed">
          Completed
        </option>

      </select>



      <input
        type="date"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
        className="w-full rounded-lg border px-3 py-2"
      />



      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >

        {
          loading
            ? "Saving..."
            : initialData._id
              ? "Update Task"
              : "Save Task"
        }

      </button>


    </form>

  );

};

export default TaskForm;