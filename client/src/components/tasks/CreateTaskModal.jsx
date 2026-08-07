import TaskForm from "./TaskForm";

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  title = "Create Task",
  initialData = {},
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-semibold">
            {title}
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
          initialData={initialData}
        />

      </div>

    </div>
  );
};

export default CreateTaskModal;