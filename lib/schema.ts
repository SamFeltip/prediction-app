import {
  pgTable,
  text,
  boolean,
  integer,
  serial,
  timestamp,
  primaryKey,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userRoomInviteEnum = pgEnum("userRoomInvite", [
  "pending",
  "accepted",
]);

export const userRooms = pgTable("userRooms", {
  id: serial("id").primaryKey(),
  status: userRoomInviteEnum().default("pending").notNull(),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creator: integer("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const markets = pgTable(
  "markets",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    roomId: integer("room_id")
      .notNull()
      .default(1)
      .references(() => rooms.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    resolvedAnswer: integer("resolved_answer"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    creatorIdx: index("idx_markets_creator_id").on(table.creatorId),
    deadlineIdx: index("idx_markets_deadline").on(table.deadline),
    answerIdx: index("idx_answers_id").on(table.resolvedAnswer),
  })
);

export const answers = pgTable(
  "answers",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    marketId: integer("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    marketIdx: index("idx_answers_market_id").on(table.marketId),
  })
);

export const bets = pgTable(
  "bets",
  {
    id: serial("id").primaryKey(),
    marketId: integer("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    answerId: integer("answer_id")
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    marketIdx: index("idx_bets_market_id").on(table.marketId),
    userIdx: index("idx_bets_user_id").on(table.userId),
    answerIdx: index("idx_answer_markets_answer_id").on(table.answerId),
    userMarketIdx: uniqueIndex("idx_bets_user_market").on(
      table.userId,
      table.marketId
    ),
  })
);

export const userPoints = pgTable("user_points", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  points: integer("points").default(1000).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
