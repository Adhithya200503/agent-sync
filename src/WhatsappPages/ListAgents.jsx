import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const AgentManager = ({ linkId }) => {
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [multiAgentEnabled, setMultiAgentEnabled] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    agentUid: "",
  });

  const { getAccessToken } = useAuth();

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/whatsapp/agents?linkId=${linkId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAgents(res.data.agents || []);
      console.log(res.data)
      setMultiAgentEnabled(res.data.multiAgentEnabled || false);
      console.log("hello",res.data.multiAgentEnabled);
      setLoading(false)
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load agents");
    }finally{
        setLoading(false);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessToken();
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/whatsapp/add-agent`,
        { ...form, linkId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Agent added");
      setForm({ name: "", email: "", phone: "", message: "", agentUid: "" });
      setOpen(false);
      fetchAgents();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add agent";
      toast.error(msg);
    }
  };

  const handleDeleteAgent = async (index) => {
    try {
      const token = await getAccessToken();
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/whatsapp/delete-agent`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { linkId, index },
      });
      toast.success("Agent deleted");
      fetchAgents();
    } catch (err) {
      toast.error("Failed to delete agent");
    }
  };

  const handleToggleMultiAgent = async (checked) => {
    try {
      const token = await getAccessToken();
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/whatsapp/update-multi-agent`,
        { linkId, multiAgentEnabled: checked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Multi-agent ${checked ? "enabled" : "disabled"}`);
      setMultiAgentEnabled(checked);
    } catch (err) {
      toast.error("Failed to update setting");
    }
  };

  useEffect(() => {
    if (linkId) fetchAgents();
  }, [linkId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  if (loading) return <div className="text-center mt-10">Loading...</div>;


  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Agents for Link: {linkId}</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="multi-agent">Multi-agent support</Label>
          <Switch
            id="multi-agent"
            checked={multiAgentEnabled}
            onCheckedChange={handleToggleMultiAgent}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Add New Agent</DialogHeader>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Message</Label>
                <Input
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Agent UID (optional)</Label>
                <Input
                  name="agentUid"
                  value={form.agentUid}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full">
        <style>
          {`
            @media (max-width: 640px) {
              /* Hide table header */
              thead {
                display: none;
              }
              /* Make table, tbody, tr, td block elements */
              table, tbody, tr, td {
                display: block;
                width: 100%;
              }
              /* Style each row like a card */
              tr {
                margin-bottom: 1rem;
                border: 1px solid #e5e7eb; /* Tailwind gray-300 */
                border-radius: 0.5rem;
                padding: 0.75rem;
                background-color: white;
                box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
              }
              td {
                /* Create space for label */
                position: relative;
                padding-left: 50%;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
                font-size: 0.875rem;
              }
              td:last-child {
                border-bottom: none;
              }
              /* Label before each cell value */
              td::before {
                position: absolute;
                top: 0.75rem;
                left: 0.75rem;
                width: 45%;
                white-space: nowrap;
                font-weight: 600;
                content: attr(data-label);
                text-transform: capitalize;
              }
            }
          `}
        </style>

        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent, idx) =>
              !agent.isCreator ? (
                <TableRow key={idx}>
                  <TableCell data-label="Name">{agent.name || "-"}</TableCell>
                  <TableCell data-label="Email">{agent.email || "-"}</TableCell>
                  <TableCell data-label="Phone">{agent.phone || "-"}</TableCell>
                  <TableCell data-label="Message">{agent.message || "-"}</TableCell>
                  <TableCell data-label="Action">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteAgent(idx)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ) : null
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AgentManager;
