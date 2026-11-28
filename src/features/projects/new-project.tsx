"use client";

import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react'
import { createProject } from './actions';
import { toast } from 'sonner';

export function NewProject() {
    const [open, setOpen] = useState(false);
    const [pending, start] = useTransition();
    const router = useRouter();

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
            const res = await createProject({
                name: f.get("name"),
                key: f.get("key"),
                description: f.get("description") || undefined,
            });
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            toast.success("Project created");
            setOpen(false);
            router.push(`/projects/${res.data.key}`);
        });
    }

    return (
        <>
            <Button variant='primary' onClick={() => setOpen(true)}>
                New project
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} title="New project">
                <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
                    <h2 className="text-lg font-semibold">New project</h2>
                    <Label>
                        Name
                        <Input name="name" required minLength={2} placeholder="Website redesign" />
                    </Label>
                    <Label>
                        Key
                        <Input
                            name="key"
                            required
                            pattern="[A-Za-z]{2,5}"
                            maxLength={5}
                            placeholder="WEB"
                            className="uppercase"
                        />
                        <span className="text-xs font-normal text-muted">
                            2 to 5 letters. Tasks are numbered like WEB-12.
                        </span>
                    </Label>
                    <Label>
                        Description (optional)
                        <Textarea name="description" rows={3} />
                    </Label>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={pending}>
                            {pending ? "Creating…" : "Create project"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
