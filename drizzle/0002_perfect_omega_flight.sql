CREATE TABLE "dimensions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"question" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
