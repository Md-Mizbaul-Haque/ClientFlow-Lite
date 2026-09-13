// env.ts validates and throws at import time, so these must exist before any
// module under test is loaded. Values are throwaway — nothing here touches a
// real database; Prisma is mocked per test.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/clientflow_test";
process.env.JWT_SECRET = "test-secret-with-at-least-32-characters";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-with-at-least-32-chars";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.PORT = "5000";
