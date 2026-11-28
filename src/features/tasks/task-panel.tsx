"use client";

import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "@/lib/constants";
import type { Role } from "@/lib/permissions";
import type { TaskDTO } from "@/lib/types";

type Props = {
    task: TaskDTO | undefined;
    role: Role;
    canDelete: boolean;
    onClose: () => void;
    onUpdate: (id: string, patch: Record<string, unknown>) => void;
    onDelete: (id: string) => void;
};

export function TaskPanel(props: Props) {
    return (
        <Modal open={!!props.task} onClose={props.onClose} title="Task details" side>
            {props.task && <PanelBody key={props.task.id} {...props} task={props.task} />}
        </Modal>
    );
}

function PanelBody({ task, role, canDelete, onClose, onUpdate, onDelete }: Props & { task: TaskDTO }) {
    const readOnly = role === "viewer";

    return (
        <div className="flex h-full flex-col gap-5 overflow-y-auto p-5">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted">{task.key}</span>
                <Button variant="ghost" onClick={onClose}>
                    Close
                </Button>
            </div>

            {readOnly && (
                <p role="status" className="rounded-lg bg-accent-soft p-3 text-sm">
                    You have view-only access, so you can read this task but not change it.
                </p>
            )}

            <fieldset disabled={readOnly} className="flex min-w-0 flex-col gap-5 border-0 p-0">
                <Label>
                    Title
                    <Input
                        defaultValue={task.title}
                        maxLength={200}
                        onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (!v) e.target.value = task.title; // never save an empty title
                            else if (v !== task.title) onUpdate(task.id, { title: v });
                        }}
                    />
                </Label>

                <Label>
                    Description
                    <Textarea
                        rows={4}
                        defaultValue={task.description ?? ""}
                        onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v !== (task.description ?? "")) onUpdate(task.id, { description: v || null });
                        }}
                    />
                </Label>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Label>
                        Status
                        <Select value={task.status} onChange={(e) => onUpdate(task.id, { status: e.target.value })}>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {STATUS_LABEL[s]}
                                </option>
                            ))}
                        </Select>
                    </Label>
                    <Label>
                        Priority
                        <Select value={task.priority} onChange={(e) => onUpdate(task.id, { priority: e.target.value })}>
                            {PRIORITIES.map((p) => (
                                <option key={p} value={p}>
                                    {PRIORITY_LABEL[p]}
                                </option>
                            ))}
                        </Select>
                    </Label>
                    <Label className="sm:col-span-2">
                        Due date
                        <Input
                            type="date"
                            // stored as noon UTC, so the first 10 characters are the right calendar day
                            defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                            onChange={(e) => onUpdate(task.id, { dueDate: e.target.value || null })}
                        />
                    </Label>
                </div>
            </fieldset>

            {canDelete && (
                <Button
                    variant="danger"
                    className="mt-auto"
                    onClick={() => {
                        if (confirm(`Delete ${task.key}? This can't be undone.`)) onDelete(task.id);
                    }}
                >
                    Delete task
                </Button>
            )}
        </div>
    );
}