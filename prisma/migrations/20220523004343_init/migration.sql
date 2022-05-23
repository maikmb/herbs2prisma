-- CreateTable
CREATE TABLE "Sample" (
    "id" SERIAL NOT NULL,
    "string_test" TEXT NOT NULL,
    "boolean_test" BOOLEAN,

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sample_string_test_key" ON "Sample"("string_test");
