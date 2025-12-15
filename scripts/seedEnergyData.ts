import { refreshEnergyPricesIfNeeded } from "../app/(main)/[projectId]/lib/refreshEnergyPricesIfNeeded/refreshEnergyPricesIfNeeded";

const main = async () => {
  console.log("🔄 Chargement des données énergétiques...");
  await refreshEnergyPricesIfNeeded();
  console.log("✅ Données énergétiques chargées avec succès!");
  process.exit(0);
};

main().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
