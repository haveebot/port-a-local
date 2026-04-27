// Change this to your server URL. During dev, use your local IP or ngrok URL.
// e.g. "http://192.168.1.100:3001" or "https://abc123.ngrok.io"
const API_BASE = "http://localhost:3001";

import {
  isMockMode,
  mockFetchTasks,
  mockAcceptTask,
  mockCompleteTask,
  mockRegisterPushToken,
  MOCK_WORKERS,
} from "./mock";

type ApiGlobal = { __API_BASE?: string };

export function setApiBase(url: string) {
  (globalThis as unknown as ApiGlobal).__API_BASE = url;
}

function getBase(): string {
  return (globalThis as unknown as ApiGlobal).__API_BASE || API_BASE;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  group_target: "runner" | "maintenance" | "all";
  status: "pending" | "accepted" | "completed";
  accepted_by: string | null;
  property: string | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}

export interface Worker {
  id: string;
  name: string;
  group_name: "runner" | "maintenance";
  push_token: string | null;
  created_at: string;
}

export async function fetchTasks(params?: {
  group?: string;
  status?: string;
  accepted_by?: string;
}): Promise<Task[]> {
  if (await isMockMode()) {
    return mockFetchTasks(params);
  }
  const url = new URL(`${getBase()}/api/tasks`);
  if (params?.group) url.searchParams.set("group", params.group);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.accepted_by)
    url.searchParams.set("accepted_by", params.accepted_by);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function acceptTask(
  taskId: string,
  workerId: string
): Promise<Task> {
  if (await isMockMode()) {
    return mockAcceptTask(taskId, workerId);
  }
  const res = await fetch(`${getBase()}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "accepted", worker_id: workerId }),
  });
  if (!res.ok) throw new Error("Failed to accept task");
  return res.json();
}

export async function completeTask(taskId: string): Promise<Task> {
  if (await isMockMode()) {
    return mockCompleteTask(taskId);
  }
  const res = await fetch(`${getBase()}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "completed" }),
  });
  if (!res.ok) throw new Error("Failed to complete task");
  return res.json();
}

export async function registerWorker(
  name: string,
  groupName: "runner" | "maintenance"
): Promise<Worker> {
  if (await isMockMode()) {
    // In mock mode "registration" just returns the matching seeded worker.
    const match = MOCK_WORKERS.find((w) => w.group_name === groupName);
    if (!match) throw new Error("No mock worker for that group");
    return { ...match, name };
  }
  const res = await fetch(`${getBase()}/api/workers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, group_name: groupName }),
  });
  if (!res.ok) throw new Error("Failed to register worker");
  return res.json();
}

export async function registerPushToken(
  workerId: string,
  pushToken: string
): Promise<void> {
  if (await isMockMode()) {
    mockRegisterPushToken(workerId, pushToken);
    return;
  }
  await fetch(`${getBase()}/api/push/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ worker_id: workerId, push_token: pushToken }),
  });
}
