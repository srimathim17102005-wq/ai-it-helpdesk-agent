import { Router, type IRouter } from "express";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db, activityTable, ticketsTable } from "@workspace/db";
import {
  CreateTicketBody,
  CreateTicketResponse,
  DiagnoseIssueBody,
  DiagnoseIssueResponse,
  GetHelpdeskDashboardResponse,
  GetTicketParams,
  GetTicketResponse,
  ListHelpdeskActivityResponse,
  ListTicketsQueryParams,
  ListTicketsResponse,
  UpdateTicketBody,
  UpdateTicketParams,
  UpdateTicketResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const seedTickets = [
  {
    title: "VPN disconnects every few minutes",
    description: "My VPN drops after 5–10 minutes and I cannot access internal tools.",
    category: "Network",
    priority: "urgent",
    status: "in_progress",
    requester: "Maya Patel",
    assignee: "Jordan Lee",
  },
  {
    title: "Laptop running very slowly",
    description: "Apps take a long time to open and the fan is constantly running.",
    category: "Hardware",
    priority: "medium",
    status: "open",
    requester: "Arjun Rao",
    assignee: null,
  },
  {
    title: "Cannot access finance dashboard",
    description: "I get a permission denied message when opening the finance dashboard.",
    category: "Access",
    priority: "high",
    status: "open",
    requester: "Sofia Chen",
    assignee: "Nina Shah",
  },
  {
    title: "Password reset completed",
    description: "Password reset worked and access has been restored.",
    category: "Access",
    priority: "low",
    status: "resolved",
    requester: "Noah Williams",
    assignee: "Nina Shah",
  },
];

async function ensureSeedData(): Promise<void> {
  const existing = await db.select({ id: ticketsTable.id }).from(ticketsTable).limit(1);
  if (existing.length > 0) return;

  const created = await db.insert(ticketsTable).values(seedTickets).returning();
  await db.insert(activityTable).values([
    {
      type: "ticket_created",
      message: "VPN disconnects every few minutes was raised as urgent",
      actor: "Maya Patel",
      ticketId: created[0]?.id ?? null,
    },
    {
      type: "ticket_assigned",
      message: "Jordan Lee picked up a network ticket",
      actor: "Jordan Lee",
      ticketId: created[0]?.id ?? null,
    },
    {
      type: "ticket_resolved",
      message: "Password reset completed was marked resolved",
      actor: "Nina Shah",
      ticketId: created[3]?.id ?? null,
    },
  ]);
}

function serializeTicket(ticket: typeof ticketsTable.$inferSelect) {
  return {
    ...ticket,
    assignee: ticket.assignee ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

function serializeActivity(activity: typeof activityTable.$inferSelect) {
  return {
    ...activity,
    ticketId: activity.ticketId ?? null,
    createdAt: activity.createdAt.toISOString(),
  };
}

router.get("/helpdesk/dashboard", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const tickets = await db.select().from(ticketsTable);
  const categoryCounts = new Map<string, number>();
  for (const ticket of tickets) {
    categoryCounts.set(ticket.category, (categoryCounts.get(ticket.category) ?? 0) + 1);
  }

  res.json(
    GetHelpdeskDashboardResponse.parse({
      openTickets: tickets.filter((ticket) => ticket.status !== "resolved").length,
      urgentTickets: tickets.filter((ticket) => ticket.priority === "urgent").length,
      resolvedToday: tickets.filter((ticket) => ticket.status === "resolved").length,
      avgResponseMinutes: 18,
      categoryBreakdown: [...categoryCounts.entries()].map(([category, count]) => ({ category, count })),
    }),
  );
});

router.get("/helpdesk/tickets", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = ListTicketsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const filters = [];
  if (parsed.data.status) filters.push(eq(ticketsTable.status, parsed.data.status));
  if (parsed.data.priority) filters.push(eq(ticketsTable.priority, parsed.data.priority));
  if (parsed.data.search) {
    filters.push(
      ilike(ticketsTable.title, `%${parsed.data.search}%`),
    );
  }

  const tickets = await db
    .select()
    .from(ticketsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(ticketsTable.updatedAt));
  res.json(ListTicketsResponse.parse(tickets.map(serializeTicket)));
});

router.post("/helpdesk/tickets", async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db
    .insert(ticketsTable)
    .values({
      ...parsed.data,
      status: "open",
    })
    .returning();
  if (!ticket) {
    res.status(500).json({ error: "Ticket could not be created" });
    return;
  }

  await db.insert(activityTable).values({
    type: "ticket_created",
    message: `${ticket.title} was raised by ${ticket.requester}`,
    actor: ticket.requester,
    ticketId: ticket.id,
  });
  res.status(201).json(CreateTicketResponse.parse(serializeTicket(ticket)));
});

router.get("/helpdesk/tickets/:id", async (req, res): Promise<void> => {
  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.id, params.data.id));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(GetTicketResponse.parse(serializeTicket(ticket)));
});

router.patch("/helpdesk/tickets/:id", async (req, res): Promise<void> => {
  const params = UpdateTicketParams.safeParse(req.params);
  const parsed = UpdateTicketBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db
    .update(ticketsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(ticketsTable.id, params.data.id))
    .returning();
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  await db.insert(activityTable).values({
    type: parsed.data.status === "resolved" ? "ticket_resolved" : "ticket_updated",
    message: `${ticket.title} was updated`,
    actor: parsed.data.assignee ?? "IT Helpdesk",
    ticketId: ticket.id,
  });
  res.json(UpdateTicketResponse.parse(serializeTicket(ticket)));
});

router.get("/helpdesk/activity", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(20);
  res.json(ListHelpdeskActivityResponse.parse(activity.map(serializeActivity)));
});

router.post("/helpdesk/diagnose", async (req, res): Promise<void> => {
  const parsed = DiagnoseIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const message = parsed.data.message.toLowerCase();
  const hasNetworkSignal = /vpn|wifi|wi-fi|internet|network|connection|disconnect/.test(message);
  const hasAccessSignal = /permission|access|login|sign in|password|locked|forbidden/.test(message);
  const hasHardwareSignal = /slow|laptop|screen|keyboard|battery|monitor|fan|crash/.test(message);
  const category = parsed.data.category ?? (hasNetworkSignal ? "Network" : hasAccessSignal ? "Access" : hasHardwareSignal ? "Hardware" : "Software");
  const urgent = /down|blocked|outage|urgent|everyone|cannot work|can't work/.test(message);

  const steps = hasNetworkSignal
    ? ["Check whether other websites load without the VPN", "Reconnect to the nearest VPN region", "Restart the VPN client and try again", "If it still drops, share the VPN client logs with IT"]
    : hasAccessSignal
      ? ["Confirm you are using your company account", "Try a private browser window and sign in again", "Check whether the issue affects one app or all company tools", "If access is still blocked, IT should verify your group permissions"]
      : hasHardwareSignal
        ? ["Save your work and restart the device", "Close unused apps and check available storage", "Install any pending system updates", "If the issue continues, IT should check the device health"]
        : ["Restart the affected app", "Check for a service status notice", "Try the same action in another browser", "If the issue continues, include a screenshot when escalating"];

  res.json(
    DiagnoseIssueResponse.parse({
      summary: urgent
        ? "This looks like a high-impact issue that may need IT attention soon."
        : "I found a likely first-line troubleshooting path for this issue.",
      steps,
      confidence: hasNetworkSignal || hasAccessSignal || hasHardwareSignal ? 92 : 68,
      suggestedPriority: urgent ? "urgent" : hasAccessSignal ? "high" : "medium",
      suggestedCategory: category,
      needsEscalation: urgent || hasAccessSignal,
    }),
  );
});

export default router;