import { pgTable, foreignKey, varchar, text, timestamp, boolean, jsonb, unique, integer, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userProfiles = pgTable("user_profiles", {
	userId: varchar("user_id", { length: 255 }).primaryKey().notNull(),
	bio: text(),
	contactInfo: text("contact_info"),
	profileData: text("profile_data"),
	activityId: varchar("activity_id", { length: 255 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userSettings = pgTable("user_settings", {
	userId: varchar("user_id", { length: 255 }).primaryKey().notNull(),
	emailNotifications: boolean("email_notifications").default(true),
	browserNotifications: boolean("browser_notifications").default(true),
	inAppNotifications: boolean("in_app_notifications").default(true),
	notificationFrequency: varchar("notification_frequency", { length: 20 }).default('immediately'),
	theme: varchar({ length: 20 }).default('system'),
	activityId: varchar("activity_id", { length: 255 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const events = pgTable("events", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	imageUrl: text("image_url"),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	location: text(),
	locationData: jsonb("location_data"),
	status: varchar({ length: 50 }).default('draft'),
	isPublic: boolean("is_public").default(true),
	activityId: varchar("activity_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	ownerId: varchar("owner_id", { length: 255 }).notNull(),
	ownerType: varchar("owner_type", { length: 50 }).default('USER').notNull(),
});

export const users = pgTable("users", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: text(),
	image: text(),
	emailVerified: timestamp("email_verified", { mode: 'string' }),
	passwordHash: text("password_hash"),
	preferredLanguage: varchar("preferred_language", { length: 10 }).default('en'),
	activityId: varchar("activity_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	systemRole: varchar("system_role", { length: 20 }).default('USER').notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const sponsorshipPlans = pgTable("sponsorship_plans", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	price: integer().notNull(),
	benefits: jsonb(),
	maxSponsors: integer("max_sponsors"),
	currentSponsors: integer("current_sponsors").default(0),
	eventId: varchar("event_id", { length: 255 }).notNull(),
	activityId: varchar("activity_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "sponsorship_plans_event_id_events_id_fk"
		}).onDelete("cascade"),
]);

export const followedEvents = pgTable("followed_events", {
	userId: varchar("user_id", { length: 255 }).notNull(),
	eventId: varchar("event_id", { length: 255 }).notNull(),
	notificationSettings: varchar("notification_settings", { length: 1000 }),
	activityId: varchar("activity_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "followed_events_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "followed_events_event_id_events_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.eventId], name: "followed_events_user_id_event_id_pk"}),
]);

export const savedEvents = pgTable("saved_events", {
	userId: varchar("user_id", { length: 255 }).notNull(),
	eventId: varchar("event_id", { length: 255 }).notNull(),
	metadata: varchar({ length: 2000 }),
	activityId: varchar("activity_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_events_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "saved_events_event_id_events_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.eventId], name: "saved_events_user_id_event_id_pk"}),
]);
