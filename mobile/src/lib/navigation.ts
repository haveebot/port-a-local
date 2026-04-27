import { Task } from "./api";

export type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string; task?: Task };
};

export type MyTasksStackParamList = {
  MyTasksList: undefined;
  MyTaskDetail: { taskId: string; task?: Task };
};

export type RootTabParamList = {
  Tasks: { screen?: keyof TasksStackParamList; params?: object } | undefined;
  MyTasks:
    | { screen?: keyof MyTasksStackParamList; params?: object }
    | undefined;
  Settings: undefined;
};
