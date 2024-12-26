// app/(user)/users/[id]/incidents/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function IncidentsPage() {
  // In a real app, this would be fetched from your backend
  const [incidents] = useState([
    {
      id: "INC-001",
      title: "Delayed Delivery",
      orderNumber: "ORD-2024-001",
      status: "resolved",
      priority: "medium",
      createdAt: "2024-03-15T10:00:00Z",
      lastUpdated: "2024-03-16T15:30:00Z",
      description: "Package delivery is delayed by more than 2 days",
      messages: [
        {
          id: 1,
          sender: "customer",
          message: "My order is delayed by 2 days. Can you help?",
          timestamp: "2024-03-15T10:00:00Z",
        },
        {
          id: 2,
          sender: "support",
          message:
            "We apologize for the delay. Your package will be delivered tomorrow with priority shipping.",
          timestamp: "2024-03-15T10:30:00Z",
        },
      ],
    },
    {
      id: "INC-002",
      title: "Product Quality Issue",
      orderNumber: "ORD-2024-003",
      status: "in_progress",
      priority: "high",
      createdAt: "2024-03-18T14:20:00Z",
      lastUpdated: "2024-03-18T16:45:00Z",
      description: "Received pickle jar with seal broken",
      messages: [
        {
          id: 1,
          sender: "customer",
          message:
            "The seal on one of the pickle jars was broken when I received it.",
          timestamp: "2024-03-18T14:20:00Z",
        },
      ],
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Incidents</h1>
          <p className="text-gray-500">
            Track and manage your support requests
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Support Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Request</DialogTitle>
            </DialogHeader>
            <IncidentForm />
          </DialogContent>
        </Dialog>
      </div>
      {/* Search and Filter Section */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input placeholder="Search incidents..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}

function IncidentForm() {
  const orderOptions = [
    { id: "ORD-2024-001", number: "ORD-2024-001" },
    { id: "ORD-2024-002", number: "ORD-2024-002" },
    { id: "ORD-2024-003", number: "ORD-2024-003" },
  ];

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Related Order</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent>
            {orderOptions.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                Order #{order.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select defaultValue="medium">
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of your issue"
          rows={4}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Submit Request
      </Button>
    </form>
  );
}

function IncidentCard({ incident }: { incident: any }) {
  const [showMessages, setShowMessages] = useState(false);

  const statusStyles = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  };

  const priorityStyles = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
  };

  const statusIcons = {
    open: AlertCircle,
    in_progress: RefreshCw,
    resolved: CheckCircle2,
    closed: XCircle,
  };

  const Icon = statusIcons[incident.status as keyof typeof statusIcons];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{incident.title}</h3>
              <span className="text-sm text-gray-500">#{incident.id}</span>
            </div>
            <p className="text-sm text-gray-500">
              Order #{incident.orderNumber}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium capitalize ${
                statusStyles[incident.status as keyof typeof statusStyles]
              }`}
            >
              <Icon className="h-4 w-4" />
              {incident.status.replace("_", " ")}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                priorityStyles[incident.priority as keyof typeof priorityStyles]
              }`}
            >
              {incident.priority}
            </span>
          </div>
        </div>

        <p className="text-gray-600">{incident.description}</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created: {new Date(incident.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Updated: {new Date(incident.lastUpdated).toLocaleDateString()}
            </span>
          </div>

          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => setShowMessages(!showMessages)}
          >
            <MessageSquare className="h-4 w-4" />
            {incident.messages.length} Messages
          </Button>
        </div>

        {showMessages && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {incident.messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.sender === "support" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "support" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <p className="mb-1 text-sm font-medium">
                    {message.sender === "support" ? "Support Team" : "You"}
                  </p>
                  <p>{message.message}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-4 flex gap-2">
              <Input placeholder="Type your message..." />
              <Button>Send</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
