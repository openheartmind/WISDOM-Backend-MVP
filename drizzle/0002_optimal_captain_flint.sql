CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"contributor_id" text,
	"instance_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_contributor_id_users_authId_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."users"("authId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE cascade ON UPDATE no action;