import { create } from "zustand";
import type { Priority } from "@/lib/constants";

type View = "board" | "list";

type UIState = {
    view: View;
    search: string;
    priority: Priority | "ALL";
    selectedTaskId: string | null;
    newTaskOpen: boolean;
    setView: (v: View) => void;
    setSearch: (s: string) => void;
    setPriority: (p: Priority | "ALL") => void;
    selectTask: (id: string | null) => void;
    setNewTaskOpen: (o: boolean) => void;
    resetFilters: () => void;
};

export const useUI = create<UIState>((set) => ({
    view: "board",
    search: "",
    priority: "ALL",
    selectedTaskId: null,
    newTaskOpen: false,
    setView: (view) => set({ view }),
    setSearch: (search) => set({ search }),
    setPriority: (priority) => set({ priority }),
    selectTask: (selectedTaskId) => set({ selectedTaskId }),
    setNewTaskOpen: (newTaskOpen) => set({ newTaskOpen }),
    resetFilters: () => set({ search: "", priority: "ALL" }),
}));