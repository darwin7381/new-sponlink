import { relations } from "drizzle-orm/relations";
import { users, userProfiles, userSettings, events, sponsorshipPlans, followedEvents, savedEvents } from "./schema";

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userProfiles: many(userProfiles),
	userSettings: many(userSettings),
	followedEvents: many(followedEvents),
	savedEvents: many(savedEvents),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));

export const sponsorshipPlansRelations = relations(sponsorshipPlans, ({one}) => ({
	event: one(events, {
		fields: [sponsorshipPlans.eventId],
		references: [events.id]
	}),
}));

export const eventsRelations = relations(events, ({many}) => ({
	sponsorshipPlans: many(sponsorshipPlans),
	followedEvents: many(followedEvents),
	savedEvents: many(savedEvents),
}));

export const followedEventsRelations = relations(followedEvents, ({one}) => ({
	user: one(users, {
		fields: [followedEvents.userId],
		references: [users.id]
	}),
	event: one(events, {
		fields: [followedEvents.eventId],
		references: [events.id]
	}),
}));

export const savedEventsRelations = relations(savedEvents, ({one}) => ({
	user: one(users, {
		fields: [savedEvents.userId],
		references: [users.id]
	}),
	event: one(events, {
		fields: [savedEvents.eventId],
		references: [events.id]
	}),
}));