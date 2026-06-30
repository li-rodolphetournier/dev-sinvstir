import { test, expect } from '@playwright/test';

test.describe('Simulateur Crypto E2E', () => {
  test('devrait charger la page principale avec les composants', async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');

    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Simulateur Crypto/);

    // Vérifier la présence du formulaire
    await expect(page.getByText("Configurez votre stratégie d'investissement")).toBeVisible();
    await expect(page.locator('label', { hasText: 'Montant (€)' })).toBeVisible();

    // Vérifier la présence de la section résultats (titre au moins)
    await expect(page.getByText('Chiffres clés')).toBeVisible();
  });

  test('devrait simuler un calcul par défaut', async ({ page }) => {
    await page.goto('/');

    // L'API est appelée automatiquement au chargement grâce aux valeurs par défaut
    // On attend que les "Chiffres clés" soient chargés (plus de skeletons)

    // Attendre que la valeur de capital final soit visible (pas "Chargement...")
    // Le texte dépendra des données de l'API, on vérifie juste qu'une valeur en € s'affiche
    await expect(page.getByText('€').first()).toBeVisible({ timeout: 10000 });

    // Modifier le montant pour déclencher un nouveau calcul
    const montantInput = page.getByPlaceholder('Ex: 100');
    await montantInput.fill('200');

    // Vérifier qu'un graphe est affiché (Recharts rend des SVG)
    await expect(page.locator('.recharts-wrapper')).toBeVisible({ timeout: 10000 });
  });
});
