import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";

const Projects = () => {
  console.log("Projects component rendered");

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log("Fetching projects...");

        const response = await getProjects();

        console.log("API Response:", response);

        setProjects(response.projects);
      } catch (error) {
        console.error("Projects API Error:", error);

        if (error.response) {
          console.log("Status:", error.response.status);
          console.log("Data:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Projects</h1>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="rounded-lg bg-white p-5 shadow"
            >
              <h2 className="text-xl font-semibold">
                {project.name}
              </h2>

              <p className="mt-2 text-gray-600">
                {project.description}
              </p>

              <div className="mt-3 flex gap-6 text-sm">
                <span>
                  <strong>Status:</strong> {project.status}
                </span>

                <span>
                  <strong>Priority:</strong> {project.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;