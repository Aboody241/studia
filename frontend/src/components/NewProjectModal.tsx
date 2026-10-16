'use client';

import React, { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from './ui/button';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: {
    name: string;
    subject: string;
    daily_available_minutes: number;
    target_deadline: string;
  }) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(90);
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      subject: subject.trim(),
      daily_available_minutes: dailyMinutes,
      target_deadline: deadline,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border text-card-foreground rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-1">Create Study Project</h2>
        <p className="text-xs text-muted-foreground mb-6">
          Set up a structured course workspace with realistic daily time commitments.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Course / Project Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Systems & Algorithms"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Subject Area
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Daily Budget
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground">mins</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
