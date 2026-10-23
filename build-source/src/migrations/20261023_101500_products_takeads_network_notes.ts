import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Products follow-up: adds Takeads to the affiliate network choices and a free-text "also available through" note on each offer.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_products_offers_network" ADD VALUE IF NOT EXISTS 'takeads';
  ALTER TABLE "products_offers" ADD COLUMN IF NOT EXISTS "network_notes" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_offers" DROP COLUMN IF EXISTS "network_notes";`)
}
