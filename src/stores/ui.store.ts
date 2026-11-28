import { create } from "zustand";

type UIState = {
    selectedTaskId: string | null;
    newTaskOpen: boolean;
    selectTask: (id: string | null) => void;
    setNewTaskOpen: (o: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
    selectedTaskId: null,
    newTaskOpen: false,
    selectTask: (selectedTaskId) => set({ selectedTaskId }),
    setNewTaskOpen: (newTaskOpen) => set({ newTaskOpen }),
}));