import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Adds the Products collection (src/collections/Products.ts): the main table, its array tables (specs, pros, cons, offers)
// and the relationship table for related posts. Written by hand because the generated migration also tried to touch the
// leftover affiliate tables that were dropped outside Payload (infra/20261017-remove-affiliate-tables.sql). Purely
// additive: nothing existing is changed except one new column on payload_locked_documents_rels.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_offers_region" AS ENUM('AU', 'US', 'UK', 'CA', 'NZ', 'DE', 'FR', 'Global');
  CREATE TYPE "public"."enum_products_offers_network" AS ENUM('none', 'sovrn', 'amazon', 'awin', 'cj', 'impact', 'direct');
  CREATE TYPE "public"."enum_products_offers_sovrn_status" AS ENUM('unchecked', 'yes', 'no');
  CREATE TYPE "public"."enum_products_offers_source" AS ENUM('amazon', 'dataforseo', 'rapidapi', 'sovrn', 'manual');
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('hardware', 'software', 'service', 'other');
  CREATE TYPE "public"."enum_products_status" AS ENUM('researched', 'approved', 'rejected', 'discontinued');
  CREATE TYPE "public"."enum_products_research_source" AS ENUM('dataforseo', 'rapidapi', 'both', 'manual');

  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );

  CREATE TABLE "products_pros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar NOT NULL
  );

  CREATE TABLE "products_cons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar NOT NULL
  );

  CREATE TABLE "products_offers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"merchant" varchar NOT NULL,
  	"merchant_domain" varchar,
  	"region" "enum_products_offers_region" DEFAULT 'AU',
  	"url" varchar NOT NULL,
  	"price" numeric,
  	"currency" varchar DEFAULT 'AUD',
  	"availability" varchar,
  	"network" "enum_products_offers_network" DEFAULT 'none',
  	"sovrn_status" "enum_products_offers_sovrn_status" DEFAULT 'unchecked',
  	"primary" boolean DEFAULT false,
  	"source" "enum_products_offers_source",
  	"checked_at" timestamp(3) with time zone
  );

  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"brand" varchar,
  	"model" varchar,
  	"product_type" "enum_products_product_type" DEFAULT 'hardware',
  	"status" "enum_products_status" DEFAULT 'researched',
  	"category_id" integer,
  	"summary" varchar,
  	"image_id" integer,
  	"image_source_url" varchar,
  	"asin" varchar,
  	"gtin" varchar,
  	"mpn" varchar,
  	"manufacturer_url" varchar,
  	"best_for" varchar,
  	"rating" numeric,
  	"rating_count" numeric,
  	"research_source" "enum_products_research_source",
  	"research_keyword" varchar,
  	"researched_at" timestamp(3) with time zone,
  	"research_notes" varchar,
  	"raw_data" jsonb,
  	"related_tool_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;

  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_pros" ADD CONSTRAINT "products_pros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_cons" ADD CONSTRAINT "products_cons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_offers" ADD CONSTRAINT "products_offers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_related_tool_id_tools_id_fk" FOREIGN KEY ("related_tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_pros_order_idx" ON "products_pros" USING btree ("_order");
  CREATE INDEX "products_pros_parent_id_idx" ON "products_pros" USING btree ("_parent_id");
  CREATE INDEX "products_cons_order_idx" ON "products_cons" USING btree ("_order");
  CREATE INDEX "products_cons_parent_id_idx" ON "products_cons" USING btree ("_parent_id");
  CREATE INDEX "products_offers_order_idx" ON "products_offers" USING btree ("_order");
  CREATE INDEX "products_offers_parent_id_idx" ON "products_offers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_image_idx" ON "products" USING btree ("image_id");
  CREATE INDEX "products_related_tool_idx" ON "products" USING btree ("related_tool_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_posts_id_idx" ON "products_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_products_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_products_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "products_id";
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "products_offers" CASCADE;
  DROP TABLE "products_cons" CASCADE;
  DROP TABLE "products_pros" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TYPE "public"."enum_products_research_source";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum_products_offers_source";
  DROP TYPE "public"."enum_products_offers_sovrn_status";
  DROP TYPE "public"."enum_products_offers_network";
  DROP TYPE "public"."enum_products_offers_region";`)
}
