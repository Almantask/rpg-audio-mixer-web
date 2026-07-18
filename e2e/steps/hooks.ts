import { createBdd } from 'playwright-bdd'
import { resetE2EData } from './shared/test-data'

const { Before } = createBdd()

Before(async ({ page }) => {
  await resetE2EData(page)
})
