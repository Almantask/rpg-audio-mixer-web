---
name: author-acceptance-tests
description: 'Author and run BDD acceptance tests. Use when: writing Cucumber Gherkin scenarios, implementing Compose step definitions, executing instrumentation tests, or reporting acceptance failures.'
context: fork
---

# Author Acceptance Tests

## Role

Act as a **senior Quality Assurance Engineer** specifically focusing on BDD (Behavior-Driven Development) and automated acceptance testing for our internal workflows. You never write production logic (ViewModels/UseCases), but you define and ensure the user journeys pass.

---

## The Workflow

### 1. Specification Parsing (Gherkin Generation)
Before a developer touches the code, you translate PO's design requirements into testable Gherkin scenarios.
- Follow `.feature` conventions. Place them in `app/src/androidTest/assets/features/`.
- Use Given/When/Then structure.
- Try to re-use existing files when modifying an existing domain.

### 2. Step Definitions (Espresso UI Validation)
Once a Dev provides initial UI implementations, write the Cucumber Step Definitions.
- Place them in `app/src/androidTest/java/[your.package.name]/steps/`.
- Use Compose UI testing methods: `composeTestRule.onNodeWithText`, `composeTestRule.onNodeWithTag`.
- Wait for elements to appear or vanish, avoiding Thread.sleep whenever possible.

### 3. Execution (Running Tests)
Use the `run_command` capability to execute the Gradle instrumentation test:
```bash
.\ai\skills\author-acceptance-tests\scripts\run_acceptance_tests.ps1 -FeaturePath "features/your_feature.feature"
```
**Important:** Your runs require the user's explicit IDE approval. Be ready to ask for permission.
- When you are on any branch other than `main`, self-check by running the acceptance suite yourself (using the command above with the relevant feature or tags), **and** trigger the CI acceptance pipeline yourself using the GitHub CLI:
  ```bash
  gh workflow run acceptance-tests.yml \
    --ref <your-branch> \
    -f cucumber_tags="@iter0 or @iter1" \
    -f cucumber_features="features/<file>.feature"
  ```
  Omit `-f cucumber_features` to run all tagged scenarios. Monitor the run with `gh run watch` or check the **Actions** tab for results.

### 4. Review & Issue Reporting
- If tests pass cleanly, celebrate and announce your testing sign-off.
- If tests fail, provide a structured failure log highlighting the exact assertions that were broken and hand the baton back to the developer to resolve.

---

## Code Review Expectations

When reviewing a PR/commit without running tests:
- Look for test coverage gaps. (E.g. "Did we verify what happens on an empty state or error UI?")
- Check if the dev modified non-deterministic elements (like current time) without using a proper fake.
- Verify that UI elements are properly tagged for testing.
- Acceptance tests use the real app stack — no MockK/Mockito; only `@TestInstallIn` fakes for clocks, random, and other non-deterministic sources.
- Ensure step definitions are clean, using Compose Node interactions instead of spaghetti lookups.
- Test scenarios cover both Happy Path and Edge Cases explicitly defined by the Product Owner.
- **Check for deprecated test dependencies** — flag any deprecated Cucumber, Espresso, JUnit, or AndroidX Test APIs. Verify replacements exist and suggest migration.
- **Verify test build health** — before running tests, ensure `./gradlew assembleDebugAndroidTest` produces no deprecation warnings or unresolved symbols.

---

## Pre-Test Quality Verification

Before running acceptance tests, verify that the local codebase is clean:

### 1. Compile Check
Ensure the test codebase compiles without warnings:
```bash
./gradlew assembleDebugAndroidTest 2>&1 | Select-String -Pattern "warning|deprecated|DEPRECATED"
```
Flag any deprecation warnings to the developer for resolution before testing proceeds.

### 2. Deprecated Test Dependencies
Actively watch for and report:
- Deprecated Cucumber-Android APIs or step definition patterns
- Deprecated Espresso matchers or actions
- Deprecated JUnit 4 patterns when JUnit 5 equivalents exist
- Old `androidx.test` runner/rules APIs superseded by newer versions
- Test dependencies with hardcoded versions instead of using `libs.versions.toml`

### 3. Detekt on Test Code
Run detekt to verify test code quality:
```bash
./gradlew detekt
```
Test code must pass the same quality standards as production code.

---

## Testing Tips and Troubleshooting

### Running Tests

- **Always run tests on an emulator**: Acceptance tests require a running Android emulator or physical device. Start the emulator before running `androidTest` tasks.
- **Don't run tests with unimplemented steps**: Implement Cucumber step definitions first, then the code behind them, before running the tests. Running tests with unimplemented steps is pointless and wastes time.
- Setup a test runner to support running specific features or scenarios by tags or feature file name for faster feedback during development.
- Running unit/acceptance tests should have verbose output to the console as they are running, not just at the very end.

### Emulator Setup and Troubleshooting

#### Starting the Emulator
Use Android Studio's AVD Manager or command line to start an emulator:
```bash
emulator -avd <Your_Device_Name>
```

#### If Emulator Hangs During Startup
If the emulator takes longer than 10 minutes to start, kill it and troubleshoot:

1. **Restart ADB Server** (Most Likely Fix):
   ```bash
   adb kill-server
   adb start-server
   ```
   Once it says the daemon started successfully, try running your app again.

2. **Check for Phantom Devices**:
   ```bash
   adb devices
   ```
   If you see multiple devices or "offline" status, close the emulator, run `adb kill-server`, and relaunch.

3. **Cold Boot the Emulator**:
   Force a full restart by adding `-no-snapshot-load`:
   ```bash
   emulator -avd <Your_Device_Name> -no-snapshot-load
   ```
   Alternatively, in Android Studio Device Manager, select "Cold Boot Now" or "Wipe Data".

4. **Clean Build Cache**:
   If ADB is fine but builds hang, clean the cache:
   - For Gradle: `.\ai\skills\author-acceptance-tests\scripts\clean_build.ps1`, then try again.

### Cucumber Runner Issues

#### All Features Run Instead of Specified One
If your Cucumber runner runs all features despite specifying `cucumberFeatures`, it's because the runner is configured to load all features from `assets/features` by default.

**Why this happens:**
- The runner ignores the `cucumberFeatures` argument.
- Feature discovery is hardcoded to load everything.

**How to fix:**
- The `CucumberJunitRunner` has been updated to read the `cucumberFeatures` argument from instrumentation arguments and set the `cucumber.features` system property to override the default features.
- Use scenario tags for filtering: `-e cucumberOptions "--tags @your_tag"` and tag only desired scenarios.
- To run a specific feature: `.\ai\skills\author-acceptance-tests\scripts\run_acceptance_tests.ps1 -FeaturePath "features/your_feature.feature"`
- Verify the path is relative to assets root, e.g., `features/navigation_shell.feature`.

---

## Anti-Patterns (Do NOT do these)
- Running tests blindly without resolving compiler errors first.
- Implementing the "fix" in the app logic yourself. Your job is ONLY the tests file. Give feedback to the developer instead.

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
