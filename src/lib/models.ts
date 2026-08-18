import mongoose, { Schema, type Model, type Document, type InferSchemaType } from "mongoose";

/* ------------------------------- users ------------------------------- */

export interface IUser extends Document {
  email: string;
  name: string;
  role: "admin" | "client";
  passwordHash?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "client"], required: true, index: true },
    passwordHash: { type: String },
    company: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

/* ------------------------------ clients ------------------------------ */

export interface IClient extends Document {
  name: string;
  company: string;
  email: string;
  phone?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, sparse: true },
  },
  { timestamps: true }
);

export const Client: Model<IClient> =
  (mongoose.models.Client as Model<IClient>) || mongoose.model<IClient>("Client", ClientSchema);

/* ---------------------------- magic tokens ---------------------------- */

export interface IMagicToken extends Document {
  email: string;
  tokenHash: string;
  purpose: "login";
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const MagicTokenSchema = new Schema<IMagicToken>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    tokenHash: { type: String, required: true },
    purpose: { type: String, default: "login" },
    expiresAt: { type: Date, required: true, index: true },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

export const MagicToken: Model<IMagicToken> =
  (mongoose.models.MagicToken as Model<IMagicToken>) ||
  mongoose.model<IMagicToken>("MagicToken", MagicTokenSchema);

/* ----------------------------- proposals ----------------------------- */

export interface IProposalItem {
  title: string;
  description: string;
}

export interface IProposalSignature {
  name: string;
  dataUrl: string;
  ip?: string;
  signedAt: Date;
}

export interface IProposal extends Document {
  number: string;
  clientId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  scopeOfWork: IProposalItem[];
  deliverables: IProposalItem[];
  price: number;
  currency: string;
  terms: IProposalItem[];
  status: "draft" | "sent" | "accepted" | "declined";
  signature?: IProposalSignature;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalItemSchema = new Schema<IProposalItem>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const ProposalSignatureSchema = new Schema<IProposalSignature>(
  {
    name: { type: String, required: true, trim: true },
    dataUrl: { type: String, required: true },
    ip: String,
    signedAt: { type: Date, required: true },
  },
  { _id: false }
);

const ProposalSchema = new Schema<IProposal>(
  {
    number: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    scopeOfWork: { type: [ProposalItemSchema], default: [] },
    deliverables: { type: [ProposalItemSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    terms: { type: [ProposalItemSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "declined"],
      default: "draft",
      index: true,
    },
    signature: { type: ProposalSignatureSchema },
    sentAt: Date,
  },
  { timestamps: true }
);

export const Proposal: Model<IProposal> =
  (mongoose.models.Proposal as Model<IProposal>) ||
  mongoose.model<IProposal>("Proposal", ProposalSchema);

/* -------------------------- deliverable checks ------------------------ */

export interface ICheck extends Document {
  proposalId: mongoose.Types.ObjectId;
  itemIndex: number;
  checkedAt: Date;
  createdAt: Date;
}

const CheckSchema = new Schema<ICheck>(
  {
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true, index: true },
    itemIndex: { type: Number, required: true },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Check: Model<ICheck> =
  (mongoose.models.Check as Model<ICheck>) || mongoose.model<ICheck>("Check", CheckSchema);

/* ------------------------------ projects ----------------------------- */

export interface IProject extends Document {
  clientId: mongoose.Types.ObjectId;
  proposalId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: "backlog" | "in_progress" | "in_review" | "completed";
  startDate?: Date;
  dueDate?: Date;
  budget: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", sparse: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["backlog", "in_progress", "in_review", "completed"],
      default: "backlog",
      index: true,
    },
    startDate: Date,
    dueDate: Date,
    budget: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);

/* ----------------------------- milestones ----------------------------- */

export interface IMilestone extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "in_review" | "completed";
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "in_review", "completed"],
      default: "pending",
      index: true,
    },
    dueDate: Date,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Milestone: Model<IMilestone> =
  (mongoose.models.Milestone as Model<IMilestone>) ||
  mongoose.model<IMilestone>("Milestone", MilestoneSchema);

/* ------------------------------- tasks -------------------------------- */

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    dueDate: Date,
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) || mongoose.model<ITask>("Task", TaskSchema);

/* ------------------------------ invoices ------------------------------ */

export interface IInvoice extends Document {
  number: string;
  clientId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  proposalId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: "deposit" | "final";
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate?: Date;
  paidAt?: Date;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    number: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", sparse: true },
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", sparse: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    type: { type: String, enum: ["deposit", "final"], default: "deposit" },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
      index: true,
    },
    dueDate: Date,
    paidAt: Date,
    stripeSessionId: String,
    stripePaymentIntentId: String,
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> =
  (mongoose.models.Invoice as Model<IInvoice>) ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);

/* ----------------------------- deliverables --------------------------- */

export interface IDeliverable extends Document {
  projectId: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  fileName: string;
  storedPath: string;
  size: number;
  mime: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverableSchema = new Schema<IDeliverable>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", sparse: true },
    fileName: { type: String, required: true },
    storedPath: { type: String, required: true },
    size: { type: Number, required: true },
    mime: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Deliverable: Model<IDeliverable> =
  (mongoose.models.Deliverable as Model<IDeliverable>) ||
  mongoose.model<IDeliverable>("Deliverable", DeliverableSchema);

/* ----------------------------- counters ------------------------------- */

export interface ICounter extends Document {
  key: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Counter: Model<ICounter> =
  (mongoose.models.Counter as Model<ICounter>) ||
  mongoose.model<ICounter>("Counter", CounterSchema);

export async function nextNumber(prefix: string, year: number) {
  const key = `${prefix}-${year}`;
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}-${year}-${String(counter.seq).padStart(3, "0")}`;
}

/* --------------------------- type inference --------------------------- */

export type ProposalDocument = InferSchemaType<typeof ProposalSchema>;
export type ProjectDocument = InferSchemaType<typeof ProjectSchema>;
export type MilestoneDocument = InferSchemaType<typeof MilestoneSchema>;
export type InvoiceDocument = InferSchemaType<typeof InvoiceSchema>;
export type ClientDocument = InferSchemaType<typeof ClientSchema>;