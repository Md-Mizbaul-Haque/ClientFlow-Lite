/**
 * Seed script for ClientFlow Lite.
 * Run with: npm run seed
 * Creates an admin account, demo clients, proposals, projects, milestones, tasks, and invoices.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"] });
import { connectDB, isDatabaseConfigured } from "../src/lib/db";
import {
  Check,
  Client,
  Deliverable,
  Invoice,
  Milestone,
  Project,
  Proposal,
  Task,
  User,
} from "../src/lib/models";
import { hashPassword } from "../src/lib/password";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("\n❌ MONGODB_URI is not set. Create a .env file with:\n  MONGODB_URI=mongodb://localhost:27017/clientflow\n");
    process.exit(1);
  }

  await connectDB();
  console.log("✓ Connected to MongoDB");

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@agency.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin12345";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      email: adminEmail,
      name: "Agency Admin",
      role: "admin",
      company: "Northwind Studio",
      passwordHash: await hashPassword(adminPassword),
    });
    console.log(`✓ Admin created — ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("✓ Admin already exists");
  }

  const now = new Date();
  const year = now.getFullYear();

  const demoClients = [
    {
      name: "Sarah Chen",
      company: "Northwind Studio",
      email: "client@northwindstudio.com",
      phone: "+1 555 010 2244",
    },
    {
      name: "Marcus Webb",
      company: "Halcyon Health",
      email: "marcus@halcyonhealth.com",
      phone: "+1 555 010 8890",
    },
    {
      name: "Elena Rodriguez",
      company: "Lumen Coffee Co.",
      email: "elena@lumencoffee.com",
      phone: "+1 555 010 1122",
    },
  ];

  const createdClients: InstanceType<typeof Client>[] = [];
  for (const c of demoClients) {
    let client = await Client.findOne({ email: c.email });
    if (!client) {
      client = await Client.create(c);
      console.log(`✓ Client created — ${c.name} (${c.company})`);
    } else {
      console.log(`✓ Client exists — ${c.name}`);
    }
    createdClients.push(client);
  }

  const [northwind, halcyon, lumen] = createdClients;

  const existingProposal = await Proposal.findOne({ number: `PRP-${year}-001` });
  if (!existingProposal) {
    const proposal = await Proposal.create({
      number: `PRP-${year}-001`,
      clientId: northwind._id,
      title: "Brand Refresh & Website Redesign",
      description:
        "A complete brand and web refresh for Northwind Studio — strategy, identity, and a fully responsive marketing site with CMS.",
      scopeOfWork: [
        { title: "Discovery & brand audit", description: "Workshops, competitive review, and positioning." },
        { title: "Visual identity", description: "Logo system, typography, color, and guidelines." },
        { title: "Website design & build", description: "12 responsive templates on a headless CMS." },
        { title: "Launch & handover", description: "SEO setup, analytics, and training session." },
      ],
      deliverables: [
        { title: "Design system & style guide", description: "Tokens, components, and usage rules." },
        { title: "12 responsive page templates", description: "Marketing pages and CMS templates." },
        { title: "CMS integration & training", description: "Content model, imports, and walkthrough." },
        { title: "Launch checklist", description: "SEO, analytics, redirects, and performance." },
      ],
      price: 12500,
      currency: "USD",
      terms: [
        { title: "Payment schedule", description: "30% deposit to kick off, 70% on launch. Deposit is refundable before work starts." },
        { title: "Timeline", description: "Expected completion within 6 weeks of kickoff." },
        { title: "Revisions", description: "Two rounds of revisions per deliverable included." },
        { title: "Intellectual property", description: "Full ownership transfers upon final payment." },
      ],
      status: "sent",
      sentAt: new Date(now.getTime() - 2 * 86400000),
      signature: {
        name: "Sarah Chen",
        dataUrl:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='120'><text x='10' y='75' font-family='Segoe Script, cursive' font-size='48' fill='%2318181b'>Sarah Chen</text></svg>`
          ),
        signedAt: new Date(now.getTime() - 1 * 86400000),
      },
    });

    await Check.create([
      { proposalId: proposal._id, itemIndex: 0, checkedAt: new Date(now.getTime() - 86400000) },
      { proposalId: proposal._id, itemIndex: 1, checkedAt: new Date(now.getTime() - 86400000) },
    ]);
    console.log("✓ Proposal created — Brand Refresh & Website Redesign (signed)");
  }

  const proposal2 = await Proposal.findOne({ number: `PRP-${year}-002` });
  if (!proposal2) {
    await Proposal.create({
      number: `PRP-${year}-002`,
      clientId: halcyon._id,
      title: "Mobile App MVP — iOS & Android",
      description:
        "Design and development of the Halcyon Health companion app: onboarding, habit tracking, and provider messaging.",
      scopeOfWork: [
        { title: "UX research & flows", description: "User journeys and information architecture." },
        { title: "UI design", description: "Screens for onboarding, tracking, and messaging." },
        { title: "MVP build", description: "React Native app with backend API." },
      ],
      deliverables: [
        { title: "Prototype & user flows", description: "Clickable prototype in Figma." },
        { title: "Full UI kit", description: "All screens and components." },
        { title: "Production build", description: "TestFlight & Play Store beta build." },
      ],
      price: 28000,
      currency: "USD",
      terms: [
        { title: "Payment schedule", description: "40% deposit, 30% on milestone 2, 30% on delivery." },
        { title: "Timeline", description: "10 weeks with weekly demo calls." },
      ],
      status: "sent",
      sentAt: new Date(now.getTime() - 1 * 86400000),
    });
    console.log("✓ Proposal created — Mobile App MVP (awaiting signature)");
  }

  const project = await Project.findOne({ name: "Brand Refresh & Website Redesign" });
  if (!project) {
    const p = await Project.create({
      clientId: northwind._id,
      proposalId: (await Proposal.findOne({ title: "Brand Refresh & Website Redesign" }))?._id,
      name: "Brand Refresh & Website Redesign",
      description: "Full rebrand and website build for Northwind Studio.",
      status: "in_progress",
      budget: 12500,
      currency: "USD",
      startDate: new Date(now.getTime() - 20 * 86400000),
      dueDate: new Date(now.getTime() + 22 * 86400000),
    });

    const milestones = [
      { title: "Discovery & brand audit", status: "completed", dueDate: new Date(now.getTime() - 14 * 86400000), order: 0 },
      { title: "Visual identity", status: "completed", dueDate: new Date(now.getTime() - 7 * 86400000), order: 1 },
      { title: "Website design", status: "in_progress", dueDate: new Date(now.getTime() + 7 * 86400000), order: 2 },
      { title: "Build & CMS integration", status: "pending", dueDate: new Date(now.getTime() + 14 * 86400000), order: 3 },
      { title: "Launch & handover", status: "pending", dueDate: new Date(now.getTime() + 22 * 86400000), order: 4 },
    ];
    for (const m of milestones) {
      await Milestone.create({ projectId: p._id, ...m, status: m.status as "pending" | "in_progress" | "in_review" | "completed" });
    }

    await Task.create([
      { projectId: p._id, title: "Finalize color tokens", dueDate: new Date(now.getTime() - 2 * 86400000) },
      { projectId: p._id, title: "Deliver homepage mockup", dueDate: new Date(now.getTime() - 1 * 86400000) },
      { projectId: p._id, title: "Set up CMS environment", dueDate: new Date(now.getTime() + 3 * 86400000) },
    ]);

    await Deliverable.create({
      projectId: p._id,
      fileName: "Style-guide-v2.pdf",
      storedPath: `${p._id}/style-guide.pdf`,
      size: 2_450_000,
      mime: "application/pdf",
      uploadedBy: existingAdmin?._id ?? (await User.findOne({ role: "admin" }))!._id,
      uploadedByName: "Agency Admin",
    });

    console.log("✓ Project created — with milestones, tasks, and a sample deliverable");
  }

  const project2 = await Project.findOne({ name: "Halcyon Health Mobile App" });
  if (!project2) {
    await Project.create({
      clientId: halcyon._id,
      name: "Halcyon Health Mobile App",
      description: "MVP design and build for the companion app.",
      status: "backlog",
      budget: 28000,
      currency: "USD",
      dueDate: new Date(now.getTime() + 70 * 86400000),
    });
    console.log("✓ Project created — Halcyon Health Mobile App (backlog)");
  }

  const existingInvoice = await Invoice.findOne({ number: `INV-${year}-001` });
  if (!existingInvoice) {
    await Invoice.create({
      number: `INV-${year}-001`,
      clientId: northwind._id,
      projectId: (await Project.findOne({ name: "Brand Refresh & Website Redesign" }))?._id,
      proposalId: (await Proposal.findOne({ title: "Brand Refresh & Website Redesign" }))?._id,
      amount: 3750,
      currency: "USD",
      type: "deposit",
      status: "paid",
      paidAt: new Date(now.getTime() - 19 * 86400000),
      dueDate: new Date(now.getTime() - 10 * 86400000),
    });
    console.log("✓ Invoice created — paid deposit");
  }

  const existingInvoice2 = await Invoice.findOne({ number: `INV-${year}-002` });
  if (!existingInvoice2) {
    await Invoice.create({
      number: `INV-${year}-002`,
      clientId: northwind._id,
      projectId: (await Project.findOne({ name: "Brand Refresh & Website Redesign" }))?._id,
      amount: 8750,
      currency: "USD",
      type: "final",
      status: "sent",
      dueDate: new Date(now.getTime() + 21 * 86400000),
    });
    console.log("✓ Invoice created — outstanding final payment");
  }

  const existingInvoice3 = await Invoice.findOne({ number: `INV-${year}-003` });
  if (!existingInvoice3) {
    await Invoice.create({
      number: `INV-${year}-003`,
      clientId: lumen._id,
      amount: 2400,
      currency: "USD",
      type: "deposit",
      status: "overdue",
      dueDate: new Date(now.getTime() - 4 * 86400000),
    });
    console.log("✓ Invoice created — overdue deposit (demo)");
  }

  console.log("\n✓ Seed complete!\n");
  console.log(`  Admin login:  ${adminEmail} / ${adminPassword}`);
  console.log(`  Client magic link: ${demoClients[0].email} (use "Send invite" in the clients page, dev mode shows the link)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
