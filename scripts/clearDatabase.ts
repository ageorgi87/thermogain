/**
 * Script pour vider toutes les tables de la base de données
 * SAUF EnergyPriceCache (données API externes à préserver)
 *
 * Usage: npx tsx scripts/clearDatabase.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const clearDatabase = async () => {
  console.log("🗑️  Clearing database...\n");

  try {
    // L'ordre est important pour respecter les contraintes de clés étrangères
    // On supprime d'abord les tables enfants, puis les parents

    console.log("Deleting ProjectResults...");
    const results = await prisma.projectResults.deleteMany({});
    console.log(`✅ Deleted ${results.count} ProjectResults\n`);

    console.log("Deleting ProjectDhw...");
    const dhw = await prisma.projectDhw.deleteMany({});
    console.log(`✅ Deleted ${dhw.count} ProjectDhw\n`);

    console.log("Deleting ProjectFinancing...");
    const financing = await prisma.projectFinancing.deleteMany({});
    console.log(`✅ Deleted ${financing.count} ProjectFinancing\n`);

    console.log("Deleting ProjectFinancialAid...");
    const financialAid = await prisma.projectFinancialAid.deleteMany({});
    console.log(`✅ Deleted ${financialAid.count} ProjectFinancialAid\n`);

    console.log("Deleting ProjectCosts...");
    const costs = await prisma.projectCosts.deleteMany({});
    console.log(`✅ Deleted ${costs.count} ProjectCosts\n`);

    console.log("Deleting ProjectHeatPump...");
    const heatPump = await prisma.projectHeatPump.deleteMany({});
    console.log(`✅ Deleted ${heatPump.count} ProjectHeatPump\n`);

    console.log("Deleting ProjectCurrentHeating...");
    const currentHeating = await prisma.projectCurrentHeating.deleteMany({});
    console.log(`✅ Deleted ${currentHeating.count} ProjectCurrentHeating\n`);

    console.log("Deleting ProjectHousing...");
    const housing = await prisma.projectHousing.deleteMany({});
    console.log(`✅ Deleted ${housing.count} ProjectHousing\n`);

    console.log("Deleting Projects...");
    const projects = await prisma.project.deleteMany({});
    console.log(`✅ Deleted ${projects.count} Projects\n`);

    console.log("Deleting PasswordResetToken...");
    const passwordTokens = await prisma.passwordResetToken.deleteMany({});
    console.log(`✅ Deleted ${passwordTokens.count} PasswordResetToken\n`);

    console.log("Deleting EmailVerificationToken...");
    const emailTokens = await prisma.emailVerificationToken.deleteMany({});
    console.log(`✅ Deleted ${emailTokens.count} EmailVerificationToken\n`);

    console.log("Deleting Users...");
    const users = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${users.count} Users\n`);

    console.log("✅ Database cleared successfully!");
    console.log("⚠️  EnergyPriceCache table preserved (contains API data)\n");

    // Vérifier ce qui reste
    const energyPriceCount = await prisma.energyPriceCache.count();
    console.log(`📊 EnergyPriceCache: ${energyPriceCount} records preserved`);

  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

clearDatabase();
