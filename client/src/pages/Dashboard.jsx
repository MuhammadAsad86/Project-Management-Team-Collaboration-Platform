import Card from "../components/ui/Card";

const Dashboard = () => {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <h2 className="text-gray-500">Total Projects</h2>
          <p className="mt-2 text-3xl font-bold">0</p>
        </Card>

        <Card>
          <h2 className="text-gray-500">Total Tasks</h2>
          <p className="mt-2 text-3xl font-bold">0</p>
        </Card>

        <Card>
          <h2 className="text-gray-500">Team Members</h2>
          <p className="mt-2 text-3xl font-bold">0</p>
        </Card>

        <Card>
          <h2 className="text-gray-500">Completed Tasks</h2>
          <p className="mt-2 text-3xl font-bold">0</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;