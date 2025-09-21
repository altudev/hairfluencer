import { boolean, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const hairstyleGenderEnum = pgEnum("hairstyle_gender", ["man", "woman"]);

export const hairstyle = pgTable("hairstyle", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  gender: hairstyleGenderEnum("gender").notNull(),
  nameEn: text("name_en").notNull(),
  nameEs: text("name_es"),
  descriptionEn: text("description_en"),
  descriptionEs: text("description_es"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
