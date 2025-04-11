DROP TABLE "organizations" CASCADE;--> statement-breakpoint
DROP TABLE "organization_members" CASCADE;--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "roles" TO "system_role";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "owner_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "owner_type" varchar(50) DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "active_view";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "active_organization_id";