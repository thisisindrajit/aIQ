CREATE TABLE IF NOT EXISTS "users" (
  "first_name" varchar NOT NULL DEFAULT 'aIQ User',
  "last_name" varchar,
  "email" varchar NOT NULL,
  "total_rewarded_xp" bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "user_notifications" (
  "notification_creator" text,
  "notification_receiver" text,
  "notification_type" text,
  "notification" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "is_cleared" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "list_notification_types" (
  "notification_type" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "rewards" (
  "rewarded_user_id" text,
  "rewarded_xp" int NOT NULL,
  "rewarded_reason" text
);

CREATE TABLE IF NOT EXISTS "list_reward_reasons" (
  "reward_reason" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "snippets" (
  "generated_by_ai" boolean DEFAULT true,
  "snippet_title" varchar(255) NOT NULL,
  "likes_count" bigint NOT NULL DEFAULT 0,
  "requested_by" text,
  "requestor_name" varchar
);

CREATE TABLE IF NOT EXISTS "list_snippet_types" (
  "snippet_type" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "snippet_type_and_data_mapping" (
  "snippet_id" text,
  "type" text, 	
  "data" jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS "snippet_likes" (
  "snippet_id" text,
  "liked_by" text
);

CREATE TABLE IF NOT EXISTS "snippet_saves" (
  "snippet_id" text,
  "saved_by" text
);

CREATE TABLE IF NOT EXISTS "snippet_notes" (
  "snippet_id" text,
  "note" text NOT NULL,
  "noted_by" text
);

ALTER TABLE "user_notifications" ADD FOREIGN KEY ("notification_creator") REFERENCES "users" ("xata_id");

ALTER TABLE "user_notifications" ADD FOREIGN KEY ("notification_receiver") REFERENCES "users" ("xata_id");

ALTER TABLE "user_notifications" ADD FOREIGN KEY ("notification_type") REFERENCES "list_notification_types" ("xata_id");

ALTER TABLE "rewards" ADD FOREIGN KEY ("rewarded_user_id") REFERENCES "users" ("xata_id");

ALTER TABLE "rewards" ADD FOREIGN KEY ("rewarded_reason") REFERENCES "list_reward_reasons" ("xata_id");

ALTER TABLE "snippets" ADD FOREIGN KEY ("requested_by") REFERENCES "users" ("xata_id");

ALTER TABLE "snippet_type_and_data_mapping" ADD FOREIGN KEY ("snippet_id") REFERENCES "snippets" ("xata_id");

ALTER TABLE "snippet_type_and_data_mapping" ADD FOREIGN KEY ("type") REFERENCES "list_snippet_types" ("xata_id");

ALTER TABLE "snippet_likes" ADD FOREIGN KEY ("snippet_id") REFERENCES "snippets" ("xata_id");

ALTER TABLE "snippet_likes" ADD FOREIGN KEY ("liked_by") REFERENCES "users" ("xata_id");

ALTER TABLE "snippet_saves" ADD FOREIGN KEY ("snippet_id") REFERENCES "snippets" ("xata_id");

ALTER TABLE "snippet_saves" ADD FOREIGN KEY ("saved_by") REFERENCES "users" ("xata_id");

ALTER TABLE "snippet_notes" ADD FOREIGN KEY ("snippet_id") REFERENCES "snippets" ("xata_id");

ALTER TABLE "snippet_notes" ADD FOREIGN KEY ("noted_by") REFERENCES "users" ("xata_id");


-- NOTE: Dropping foreign key constraints to user table for now since no logic has been written to populate
-- user table from clerk for now