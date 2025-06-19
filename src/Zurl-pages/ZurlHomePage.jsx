import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LinkList from "./LinkList";
import ZurlFolder from "./ZurlFolder";
import ShortenUrlForm from "./ShortenUrlForm";
const ZurlHomePage = () => {
  return (
    <div>
      <Tabs defaultValue="create-short-links">
        <TabsList>
          <TabsTrigger value="create-short-links">
            Create short links
          </TabsTrigger>
          <TabsTrigger value="all-links">All links</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
        </TabsList>
        <TabsContent value="create-short-links">
          <ShortenUrlForm />
        </TabsContent>
        <TabsContent value="all-links">
          <LinkList />
        </TabsContent>
        <TabsContent value="folders">
          <ZurlFolder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZurlHomePage;
