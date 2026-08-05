import TaskForm from "./TaskForm";

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">


        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-semibold">
            Create Task
          </h2>


          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>


        </div>


        <TaskForm
          onSubmit={onSubmit}
          loading={loading}
        />


      </div>

    </div>
  );
};


export default CreateTaskModal;