import { useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from '../context/AuthContext';

export default function AddAgentForm({ linkId }) {
  const [form, setForm] = useState({
    linkId: linkId,
    name: '',
    email: '',
    countryCode: '+91',   // Default country code
    phoneNumber: '',
    message: '',
    agentUid: '',
  });

  const [loading, setLoading] = useState(false);
  const { getAccessToken } = useAuth();

  // Restrict countryCode input to + and digits only
  const handleCountryCodeChange = (e) => {
    const value = e.target.value;
    if (/^\+?\d*$/.test(value)) {
      setForm(prev => ({ ...prev, countryCode: value }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "countryCode") return; // handled separately
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate country code format: starts with + and 1-4 digits
    if (!/^\+\d{1,4}$/.test(form.countryCode)) {
      toast.error("Invalid country code. It should start with + and contain 1 to 4 digits.");
      setLoading(false);
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("User is not authenticated.");
        setLoading(false);
        return;
      }

      const fullPhone = `${form.countryCode}${form.phoneNumber}`;

      const payload = {
        ...form,
        phone: fullPhone,
      };

      delete payload.countryCode;
      delete payload.phoneNumber;

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/whatsapp/add-agent`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast.success("Agent added successfully!");
      setForm({
        linkId,
        name: '',
        email: '',
        countryCode: '+1',
        phoneNumber: '',
        message: '',
        agentUid: '',
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add agent";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-6 shadow-lg">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label htmlFor="linkId">Link ID *</Label>
            <Input
              id="linkId"
              name="linkId"
              value={form.linkId}
              disabled
              required
            />
          </div>

          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter agent name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter agent email"
            />
          </div>

          <div className="flex space-x-2">
            <div className="w-1/4">
              <Label htmlFor="countryCode">Country Code</Label>
              <Input
                id="countryCode"
                name="countryCode"
                value={form.countryCode}
                onChange={handleCountryCodeChange}
                placeholder="+1"
              />
            </div>
            <div className="w-3/4">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Optional message"
            />
          </div>

          <div>
            <Label htmlFor="agentUid">Agent UID (optional)</Label>
            <Input
              id="agentUid"
              name="agentUid"
              value={form.agentUid}
              onChange={handleChange}
              placeholder="Assign to an existing user"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding Agent...' : 'Add Agent'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
