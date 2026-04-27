// Mock-mode store for the staff app.
// Lets you exercise the full Tasks → Accept → Complete loop without a
// running backend. Two pre-seeded workers + a fresh batch of demo tasks
// each time the app launches.

import * as SecureStore from "expo-secure-store";
import type { Task, Worker } from "./api";

const MOCK_MODE_KEY = "mock_mode";

export const MOCK_WORKERS: Worker[] = [
  {
    id: "mock-worker-runner",
    name: "Maya Cortez",
    group_name: "runner",
    push_token: null,
    created_at: "2026-04-01T08:00:00",
  },
  {
    id: "mock-worker-maintenance",
    name: "Diego Alvarez",
    group_name: "maintenance",
    push_token: null,
    created_at: "2026-04-01T08:00:00",
  },
];

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, "");
}

function makeSeedTasks(): Task[] {
  const t = nowIso();
  return [
    {
      id: "mock-task-1",
      title: "Beach gear delivery — Sandcastle Suites #214",
      description:
        "Two adult chairs, one umbrella, drop at the porch by 11am.",
      group_target: "runner",
      status: "pending",
      accepted_by: null,
      property: "Sandcastle Suites #214",
      created_at: t,
      accepted_at: null,
      completed_at: null,
    },
    {
      id: "mock-task-2",
      title: "AC not cooling — 132 Beachwalk Dr",
      description:
        "Guest reports unit running but warm. Filter probably clogged. Bring spares.",
      group_target: "maintenance",
      status: "pending",
      accepted_by: null,
      property: "132 Beachwalk Dr",
      created_at: t,
      accepted_at: null,
      completed_at: null,
    },
    {
      id: "mock-task-3",
      title: "Crazy Cajun pickup → Palms #4",
      description:
        "Order #441 — gumbo + Hungry Cajun + drinks. Ask host to confirm size.",
      group_target: "runner",
      status: "pending",
      accepted_by: null,
      property: "Palms Condo #4",
      created_at: t,
      accepted_at: null,
      completed_at: null,
    },
    {
      id: "mock-task-4",
      title: "Hot tub jets out — Tarpon Inn cottage 7",
      description: "Two jets aren't pushing water. May need impeller swap.",
      group_target: "maintenance",
      status: "pending",
      accepted_by: null,
      property: "Tarpon Inn cottage 7",
      created_at: t,
      accepted_at: null,
      completed_at: null,
    },
    {
      id: "mock-task-5",
      title: "Golf cart drop — Sea Sands #11",
      description:
        "4-seater, blue tag #C-22. Park on the gravel pad behind the unit.",
      group_target: "runner",
      status: "pending",
      accepted_by: null,
      property: "Sea Sands #11",
      created_at: t,
      accepted_at: null,
      completed_at: null,
    },
    {
      id: "mock-task-6",
      title: "Both teams: storm prep — Sand Dollar 12-14",
      description:
        "Squall line at 4pm. Stack chairs, move grills, lower umbrellas across all three units.",
      group_target: "all",
      status: "pending",
      accepted_by: null,
      property: "Sand Dollar 12-14",
      created_at: t,
      accepted_at: null,
      completed_at: null,
    },
  ];
}

let TASKS: Task[] = makeSeedTasks();

export async function isMockMode(): Promise<boolean> {
  return (await SecureStore.getItemAsync(MOCK_MODE_KEY)) === "1";
}

export async function setMockMode(on: boolean): Promise<void> {
  if (on) {
    await SecureStore.setItemAsync(MOCK_MODE_KEY, "1");
    TASKS = makeSeedTasks();
  } else {
    await SecureStore.deleteItemAsync(MOCK_MODE_KEY);
  }
}

export function resetMockTasks(): void {
  TASKS = makeSeedTasks();
}

export function mockFetchTasks(params?: {
  group?: string;
  status?: string;
  accepted_by?: string;
}): Task[] {
  let list = TASKS.slice();
  if (params?.status) list = list.filter((t) => t.status === params.status);
  if (params?.group) {
    list = list.filter(
      (t) => t.group_target === params.group || t.group_target === "all"
    );
  }
  if (params?.accepted_by) {
    list = list.filter((t) => t.accepted_by === params.accepted_by);
  }
  return list;
}

export function mockFetchTask(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}

export function mockAcceptTask(taskId: string, workerId: string): Task {
  const t = TASKS.find((x) => x.id === taskId);
  if (!t) throw new Error("Task not found");
  if (t.status !== "pending") throw new Error("Task not available");
  t.status = "accepted";
  t.accepted_by = workerId;
  t.accepted_at = nowIso();
  return { ...t };
}

export function mockCompleteTask(taskId: string): Task {
  const t = TASKS.find((x) => x.id === taskId);
  if (!t) throw new Error("Task not found");
  t.status = "completed";
  t.completed_at = nowIso();
  return { ...t };
}

export function mockRegisterPushToken(_workerId: string, _token: string): void {
  // No-op in mock mode
}
