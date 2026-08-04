import React from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PageContainer from "../components/layout/PageContainer";
import SectionHeader from "../components/common/SectionHeader";

const Dashboard = () => {
  return (
    <PageContainer>
      <SectionHeader
        title="Dashboard"
        subtitle="Welcome to the Project Management Platform"
      />

      <Card>
        <Input
          placeholder="Enter project name"
          className="mb-4"
        />

        <Button>Get Started</Button>
      </Card>
    </PageContainer>
  );
};

export default Dashboard;