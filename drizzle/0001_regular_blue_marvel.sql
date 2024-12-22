CREATE TABLE IF NOT EXISTS "ecommerce_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "ecommerce_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_address" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"line1" varchar(255) NOT NULL,
	"line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"postalCode" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone" varchar(20)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_category" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"parentId" varchar(255),
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_orderItem" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"orderId" varchar(255) NOT NULL,
	"productId" varchar(255) NOT NULL,
	"variantId" varchar(255),
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_order" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"addressId" varchar(255) NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"paymentIntentId" varchar(255),
	"paymentStatus" varchar(50) DEFAULT 'pending',
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_productCategory" (
	"productId" varchar(255) NOT NULL,
	"categoryId" varchar(255) NOT NULL,
	CONSTRAINT "ecommerce_productCategory_productId_categoryId_pk" PRIMARY KEY("productId","categoryId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_productImage" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"productId" varchar(255) NOT NULL,
	"url" varchar(1024) NOT NULL,
	"altText" varchar(255),
	"isPrimary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_productVariant" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"productId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_product" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp,
	"image" varchar(255),
	"role" varchar(50) DEFAULT 'CUSTOMER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ecommerce_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "ecommerce_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DROP TABLE "project_account";--> statement-breakpoint
DROP TABLE "project_post";--> statement-breakpoint
DROP TABLE "project_session";--> statement-breakpoint
DROP TABLE "project_user";--> statement-breakpoint
DROP TABLE "project_verification_token";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_account" ADD CONSTRAINT "ecommerce_account_userId_ecommerce_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ecommerce_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_address" ADD CONSTRAINT "ecommerce_address_userId_ecommerce_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ecommerce_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_category" ADD CONSTRAINT "ecommerce_category_parentId_ecommerce_category_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."ecommerce_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_orderItem" ADD CONSTRAINT "ecommerce_orderItem_orderId_ecommerce_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."ecommerce_order"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_orderItem" ADD CONSTRAINT "ecommerce_orderItem_productId_ecommerce_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."ecommerce_product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_orderItem" ADD CONSTRAINT "ecommerce_orderItem_variantId_ecommerce_productVariant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."ecommerce_productVariant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_order" ADD CONSTRAINT "ecommerce_order_userId_ecommerce_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ecommerce_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_order" ADD CONSTRAINT "ecommerce_order_addressId_ecommerce_address_id_fk" FOREIGN KEY ("addressId") REFERENCES "public"."ecommerce_address"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_productCategory" ADD CONSTRAINT "ecommerce_productCategory_productId_ecommerce_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."ecommerce_product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_productCategory" ADD CONSTRAINT "ecommerce_productCategory_categoryId_ecommerce_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."ecommerce_category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_productImage" ADD CONSTRAINT "ecommerce_productImage_productId_ecommerce_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."ecommerce_product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_productVariant" ADD CONSTRAINT "ecommerce_productVariant_productId_ecommerce_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."ecommerce_product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ecommerce_session" ADD CONSTRAINT "ecommerce_session_userId_ecommerce_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ecommerce_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "ecommerce_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "ecommerce_session" USING btree ("userId");