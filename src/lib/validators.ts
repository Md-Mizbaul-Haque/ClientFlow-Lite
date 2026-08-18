import { z } from "zod";

export const emailSchema = z.string().email("Enter a valid email address").max(254);

export const clientCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  company: z.string().min(1, "Company is required").max(160),
  email: emailSchema,
  phone: z.string().max(40).optional().or(z.literal("")),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const itemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export const proposalCreateSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(4000).optional().or(z.literal("")),
  scopeOfWork: z.array(itemSchema).min(1, "Add at least one scope item"),
  deliverables: z.array(itemSchema).min(1, "Add at least one deliverable"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().min(3).max(3),
  terms: z.array(itemSchema),
});

export const proposalUpdateSchema = proposalCreateSchema.partial();

export const signSchema = z.object({
  name: z.string().min(1, "Full legal name is required").max(160),
  dataUrl: z
    .string()
    .min(1, "Please draw your signature")
    .max(3_000_000, "Signature image is too large"),
});

export const projectCreateSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  proposalId: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(4000).optional().or(z.literal("")),
  status: z.enum(["backlog", "in_progress", "in_review", "completed"]).default("backlog"),
  budget: z.coerce.number().min(0).default(0),
  currency: z.string().min(3).max(3).default("USD"),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const milestoneCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["pending", "in_progress", "in_review", "completed"]).default("pending"),
  dueDate: z.coerce.date().optional().nullable(),
});

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  dueDate: z.coerce.date().optional().nullable(),
});

export const invoiceCreateSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  projectId: z.string().optional().or(z.literal("")),
  proposalId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  currency: z.string().min(3).max(3).default("USD"),
  type: z.enum(["deposit", "final"]).default("deposit"),
  dueDate: z.coerce.date().optional().nullable(),
});