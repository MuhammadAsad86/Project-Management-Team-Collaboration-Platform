import { useEffect, useState, useCallback } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../services/taskService";

import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskFilters from "../components/tasks/TaskFilters";


const Tasks = () => {

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isTeamMember =
    currentUser?.role === "team_member";


  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);



  // Create Modal
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] =
    useState(false);



  // Edit Modal
  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);



  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sort: "",
  });



  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });



  const [paginationInfo, setPaginationInfo] =
    useState({
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });



  // Fetch Tasks
  const fetchTasks = useCallback(async () => {

    try {

      setLoading(true);


      const response = await getTasks({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });



      setTasks(response.tasks || []);



      setPaginationInfo({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      });


    } catch(error){

      console.error(
        "Tasks API Error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }, [
    filters,
    pagination.page,
    pagination.limit
  ]);




  useEffect(() => {

    fetchTasks();

  }, [fetchTasks]);





  // Filter Change
  const handleFilterChange = (newFilters)=>{

    setFilters(newFilters);

    setPagination(prev=>({
      ...prev,
      page:1
    }));

  };





  // Create Task
  const handleCreateTask = async(formData)=>{

    try{

      setCreating(true);


      await createTask(formData);


      alert(
        "Task created successfully."
      );


      setShowCreateModal(false);


      await fetchTasks();


    }catch(error){

      alert(
        error.response?.data?.message ||
        "Failed to create task."
      );


    }finally{

      setCreating(false);

    }

  };





  // Update Task
  const handleUpdateTask = async(formData)=>{

    try{

      setEditing(true);


      await updateTask(
        selectedTask._id,
        formData
      );


      alert(
        "Task updated successfully."
      );


      setShowEditModal(false);

      setSelectedTask(null);


      await fetchTasks();


    }catch(error){

      alert(
        error.response?.data?.message ||
        "Failed to update task."
      );


    }finally{

      setEditing(false);

    }

  };





  // Delete Task
  const handleDeleteTask = async(id)=>{

    try{

      const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this task?"
      );


      if(!confirmDelete) return;



      await deleteTask(id);


      alert(
        "Task deleted successfully."
      );


      await fetchTasks();


    }catch(error){

      alert(
        error.response?.data?.message ||
        "Failed to delete task."
      );

    }

  };





  // Team Member Status Update
  const handleStatusUpdate = async(
    id,
    status
  )=>{

    try{


      await updateTaskStatus(
        id,
        status
      );


      alert(
        "Task status updated successfully."
      );


      await fetchTasks();


    }catch(error){

      console.error(
        "Status Update Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to update status."
      );

    }

  };





return (

<div>


{loading && (
<p>
Loading tasks...
</p>
)}





<div className="flex items-center justify-between">


<h1 className="text-3xl font-bold">
Tasks
</h1>




{!isTeamMember && (

<button
onClick={()=>setShowCreateModal(true)}
className="rounded-lg bg-blue-600 px-4 py-2 text-white"
>
+ Create Task
</button>

)}



</div>





<TaskFilters
filters={filters}
setFilters={handleFilterChange}
/>






{
tasks.length === 0 ?

(
<div className="rounded-lg bg-white p-8 shadow">

<p>
No tasks found.
</p>

</div>
)

:

(

<div className="space-y-4">


{
tasks.map(task=>(


<div
key={task._id}
className="rounded-lg bg-white p-5 shadow"
>



<h2 className="text-xl font-semibold">
{task.title}
</h2>



<p>
{task.description}
</p>




<div className="mt-4 flex flex-wrap gap-5 text-sm">


<span>
<strong>Project:</strong>{" "}
{task.project?.name || "N/A"}
</span>



<span>
<strong>Assigned To:</strong>{" "}
{task.assignedTo?.name || "N/A"}
</span>



<span>
<strong>Status:</strong>{" "}
{task.status}
</span>



<span>
<strong>Priority:</strong>{" "}
{task.priority}
</span>



</div>





<div className="mt-5 flex gap-3">



{isTeamMember && (

<select
value={task.status}
onChange={(e)=>
handleStatusUpdate(
task._id,
e.target.value
)
}
className="rounded border px-3 py-1"
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

)}






{!isTeamMember && (

<button
onClick={()=>{

setSelectedTask(task);

setShowEditModal(true);

}}
className="bg-yellow-500 px-3 py-1 text-white"
>
Edit
</button>

)}




{!isTeamMember && (

<button
onClick={()=>
handleDeleteTask(task._id)
}
className="rounded bg-red-600 px-4 py-2 text-white"
>
Delete
</button>

)}



</div>



</div>


))

}



</div>

)

}






<div className="mt-6 flex justify-center gap-4">


<button

disabled={!paginationInfo.hasPreviousPage}

onClick={()=>
setPagination(prev=>({
...prev,
page:prev.page-1
}))
}

className="rounded bg-gray-200 px-4 py-2"
>
Previous
</button>





<span>
Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
</span>





<button

disabled={!paginationInfo.hasNextPage}

onClick={()=>
setPagination(prev=>({
...prev,
page:prev.page+1
}))
}

className="rounded bg-blue-600 px-4 py-2 text-white"
>
Next
</button>



</div>







<CreateTaskModal

isOpen={showCreateModal}

onClose={()=>
setShowCreateModal(false)
}

onSubmit={handleCreateTask}

loading={creating}

/>







<CreateTaskModal

isOpen={showEditModal}

onClose={()=>{

setShowEditModal(false);

setSelectedTask(null);

}}

onSubmit={handleUpdateTask}

loading={editing}

title="Edit Task"

initialData={selectedTask || {}}

/>





</div>

);

};


export default Tasks;