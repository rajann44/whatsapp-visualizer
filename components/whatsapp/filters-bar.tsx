"use client";

import { type MessageType } from "@/lib/whatsapp/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DashboardFilters {
  participant: string | "all";
  dateFrom?: string;
  dateTo?: string;
  messageType: MessageType | "all";
}

interface FiltersBarProps {
  participants: string[];
  filters: DashboardFilters;
  onChange: (next: DashboardFilters) => void;
}

const messageTypes: Array<MessageType | "all"> = [
  "all",
  "text",
  "link",
  "media_omitted",
  "document_omitted",
  "voice_call",
  "system",
  "other"
];

export function FiltersBar({ participants, filters, onChange }: FiltersBarProps) {
  const hasActiveFilters = filters.participant !== "all" || filters.messageType !== "all" || Boolean(filters.dateFrom) || Boolean(filters.dateTo);

  const resetFilters = () => {
    onChange({
      participant: "all",
      messageType: "all",
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  return (
    <section className="space-y-4 rounded-[1.3rem] border border-border/55 bg-card/75 p-3.5 md:p-4">
      <div className="flex items-center justify-between rounded-xl border border-border/55 bg-muted/30 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Filter scope</p>
          <p className="text-xs text-muted-foreground">Changes apply instantly to all charts.</p>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="motion-fast rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border/60 bg-background/80 p-3">
          <Label htmlFor="participant-filter" className="text-xs font-medium text-muted-foreground">
            Participant
          </Label>
          <Select value={filters.participant} onValueChange={(value) => onChange({ ...filters, participant: value })}>
            <SelectTrigger id="participant-filter" className="h-10 rounded-xl border-border/70 bg-background/80">
              <SelectValue placeholder="All participants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All participants</SelectItem>
              {participants.map((participant) => (
                <SelectItem key={participant} value={participant}>
                  {participant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 bg-background/80 p-3">
          <Label htmlFor="type-filter" className="text-xs font-medium text-muted-foreground">
            Message type
          </Label>
          <Select
            value={filters.messageType}
            onValueChange={(value) => onChange({ ...filters, messageType: value as MessageType | "all" })}
          >
            <SelectTrigger id="type-filter" className="h-10 rounded-xl border-border/70 bg-background/80">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              {messageTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 bg-background/80 p-3">
          <Label htmlFor="from-filter" className="text-xs font-medium text-muted-foreground">
            From
          </Label>
          <Input
            id="from-filter"
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(event) => onChange({ ...filters, dateFrom: event.target.value || undefined })}
            className="h-10 rounded-xl border-border/70 bg-background/80"
          />
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 bg-background/80 p-3">
          <Label htmlFor="to-filter" className="text-xs font-medium text-muted-foreground">
            To
          </Label>
          <Input
            id="to-filter"
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(event) => onChange({ ...filters, dateTo: event.target.value || undefined })}
            className="h-10 rounded-xl border-border/70 bg-background/80"
          />
        </div>
      </div>
    </section>
  );
}
