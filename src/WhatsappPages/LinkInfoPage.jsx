import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LinkEditPage from "./EditPage";
import LinkAnalytics from "./LinkAnalytics";
import { useParams } from "react-router-dom";

import AddAgentForm from "./AddAgentForm";
import ListAgents from "./ListAgents";

const LinkInfoPage = () => {
  const { id } = useParams();
  return (
    <div>
      <Tabs defaultValue="edit" className="w-full">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="add-agent">Add Agent</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <LinkEditPage id={id} />
        </TabsContent>

        <TabsContent value="analytics">
          <LinkAnalytics linkId={id} />
        </TabsContent>
           <TabsContent value="add-agent">
          <ListAgents  linkId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinkInfoPage;
