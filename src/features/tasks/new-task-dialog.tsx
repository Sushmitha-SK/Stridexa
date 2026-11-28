"use client";

import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "@/lib/constants";

export function NewTaskDialog({
    open,
    onClose,
    pending,
    onCreate,
}: {
    open: boolean;
    onClose: () => void;
    pending: boolean;
    onCreate: (v: Record<string, FormDataEntryValue | null>) => void;
}) {
    return (
        <Modal open={open} onClose={onClose} title="New task">
            <form
                className="flex flex-col gap-4 p-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    onCreate({
                        title: f.get("title"),
                        description: f.get("description") || null,
                        status: f.get("status"),
                        priority: f.get("priority"),
                        dueDate: f.get("dueDate") || null,
                    });
                }}
            >
                <h2 className="text-lg font-semibold">New task</h2>
                <Label>
                    Title
                    <Input name="title" required maxLength={200} autoFocus placeholder="What needs to happen?" />
                </Label>
                <Label>
                    Description (optional)
                    <Textarea name="description" rows={3} />
                </Label>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Label>
                        Status
                        <Select name="status" defaultValue="TODO">
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {STATUS_LABEL[s]}
                                </option>
                            ))}
                        </Select>
                    </Label>
                    <Label>
                        Priority
                        <Select name="priority" defaultValue="NONE">
                            {PRIORITIES.map((p) => (
                                <option key={p} value={p}>
                                    {PRIORITY_LABEL[p]}
                                </option>
                            ))}
                        </Select>
                    </Label>
                    <Label className="sm:col-span-2">
                        Due date
                        <Input name="dueDate" type="date" />
                    </Label>
                </div>
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={pending}>
                        {pending ? "Creating…" : "Create task"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}