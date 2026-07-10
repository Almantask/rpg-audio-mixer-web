---
name: implement-android-with-tdd
description: 'Implement Android/Kotlin features with strict TDD (Red → Green → Refactor). Use when: writing unit tests and production code, designing ViewModels, repositories, use-cases, Hilt DI, Room entities/DAOs, Compose screens, coroutines/Flow, or debugging build/runtime issues.'
context: fork
---

# Implement Android with TDD

## Role

Act as a **senior Android engineer** who practices strict **TDD** and clean Kotlin.  
Every task follows the Red → Green → Refactor loop before any production code is considered done.

---

## TDD Loop (mandatory for every implementation task)

```
RED   → Write the smallest failing test that captures the behaviour.
GREEN → Write the minimum production code to make it pass. No gold-plating.
REFACTOR → Clean up duplication, naming, and structure without breaking tests.
```

Repeat the loop for each new behaviour.  **Never write production code before a failing test exists.**

### Cycle checklist

- [ ] Test name describes the observable behaviour, not the implementation (`givenX_whenY_thenZ` or `y_does_z_when_x`).
- [ ] Test is structured with explicit `// Arrange`, `// Act`, `// Assert` blocks.
- [ ] Assertion uses **AssertJ** (`assertThat(...).isEqualTo(...)` etc.).
- [ ] One logical assertion per test (multiple `assertThat` calls are fine when they verify the same behaviour).
- [ ] Test is independent — no shared mutable state between tests.
- [ ] After Green: run the full test suite before Refactor.
- [ ] After Refactor: all tests still pass.

---

## Test Layers

### 1. Unit tests — `src/test/`

**Scope:** Pure logic; no Android framework.  
**Tools:** JUnit 5, MockK, Turbine (Flow), AssertJ.

| What to test | How |
|---|---|
| ViewModel state transitions | `TestCoroutineScheduler` + `runTest`; collect `StateFlow` with Turbine |
| Use-case / domain logic | Plain JUnit, no mocks unless collaborators have side effects |
| Repository logic | MockK on DAO / API interfaces |
| Mapper / parser | Table-driven with `@ParameterizedTest` |
| Error paths | `coEvery { } throws` then verify sealed error state emitted |

**Flow testing with Turbine:**
```kotlin
@Test
fun `emits loading then success when repository returns data`() = runTest {
    // Arrange
    every { repository.getItems() } returns flowOf(items)
    val viewModel = MyViewModel(repository)

    // Act & Assert
    viewModel.uiState.test {
        assertThat(awaitItem()).isInstanceOf(UiState.Loading::class.java)
        assertThat(awaitItem()).isEqualTo(UiState.Success(items))
        cancelAndIgnoreRemainingEvents()
    }
}
```

### 2. Acceptance / feature tests — `src/androidTest/`

**Acceptance tests are outside this skill.** You do not write acceptance tests or Cucumber step definitions. Write production code to satisfy acceptance criteria. If asked to write an acceptance test, refuse — that belongs in `author-acceptance-tests`.

However, you must be aware of the infrastructure philosophy used by QA so you write compatible production code:

#### Infrastructure philosophy — real stack, controlled non-determinism

Acceptance tests run against the **full production app stack** as-is:

- Real Room database (in-memory via `Room.inMemoryDatabaseBuilder` is fine for isolation, but no DAO mocks)
- Real ViewModels, repositories, and use-cases — **no MockK/Mockito at this layer**
- Real Hilt dependency graph — use `@HiltAndroidTest` + `HiltAndroidRule`
- Real navigation and Compose UI

The **only** test doubles permitted in acceptance tests are replacements for **non-deterministic infrastructure**:

| Source of non-determinism | How to inject a test double |
|---|---|
| Current date / time (`Clock`, `LocalDate.now()`) | Bind a `FakeClock` via a Hilt `@TestInstallIn` module |
| Random / UUID generation | Bind a `FakeRandom` or seeded `Random(seed)` via `@TestInstallIn` |
| External API / network calls | Bind a deterministic fake (not a mock) via `@TestInstallIn`; never MockK |
| Notification / alarm scheduling | Bind a no-op fake via `@TestInstallIn` |

> **Rule:** if it is deterministic and self-contained, use the real implementation.  
> Only replace what would make tests flaky or environment-dependent.

**Example Hilt test module:**
```kotlin
@TestInstallIn(components = [SingletonComponent::class], replaces = [ClockModule::class])
@Module
object FakeClockModule {
    @Provides @Singleton
    fun provideClock(): Clock = Clock.fixed(Instant.parse("2026-01-15T10:00:00Z"), ZoneOffset.UTC)
}
```

Minimum scenario set per feature:

| Scenario | Required |
|---|---|
| Happy path | ✅ |
| Validation / error path | ✅ |
| Empty state (if applicable) | ✅ |
| Edge case | ✅ (at least one) |

---

## Delivery Order (Feature Implementation)

Follow this sequence every time:

1. **Understand requirements** — state the behaviour in one sentence.
2. **See if any code for the job already exists** - if so - reuse it. If not, create new code with a failing test first.
3. **Work in parallel on acceptance specs** — Do not write `.feature` files yourself, but do not block waiting for them. Begin implementing domain logic and UI from requirements while acceptance specs are drafted elsewhere.
4. **Write failing unit test(s)** — smallest unit that drives the first slice.
5. **Implement production code (Green)** — minimum code to pass tests. For unit tests - always run all.
6. **Refactor** — names, duplication, structure; tests still green.
7. **Repeat** for the next behaviour slice until acceptance tests pass.
8. **Edge cases** — add unit tests for boundaries, nulls, empty collections.
9. **Code review** — self-review against checklist

After all the requests are implemented and tests are green, run the full test suite one last time before marking the full task as done.

---

## Local Code Quality Gates

Before considering any task complete, run local quality checks to catch issues before CI:

### 1. Static Analysis (Detekt)
Run detekt locally to catch code smells, complexity issues, and style violations:
```bash
./gradlew detekt
```
Fix all reported issues before proceeding. Do not suppress warnings without justification.

### 2. Dependency Health
Actively avoid deprecated or outdated dependencies:
- **Never introduce a deprecated API** — if an API shows `@Deprecated` in autocomplete or documentation, find and use the replacement.
- **Prefer Version Catalog** — all dependencies must be declared in `gradle/libs.versions.toml`. Never use hardcoded version strings in `build.gradle.kts`.
- **Check for deprecated imports** — Watch for `@Deprecated` annotations on AndroidX, Compose, Hilt, Room, and ExoPlayer/Media3 APIs. Replace with the recommended successor.
- **Common deprecation traps to avoid:**
  - `LiveData` → use `StateFlow` / `SharedFlow`
  - `kapt` → migrate to `ksp` when the library supports it
  - `@ExperimentalApi` annotations that have since been promoted to stable
  - Old `androidx.test` APIs superseded by newer versions
  - `onBackPressed()` → use `OnBackPressedCallback`
  - `setContent {}` without `enableEdgeToEdge()` in Activity

### 3. Build Health
Run a clean build and check for warnings:
```bash
./gradlew assembleDebug 2>&1 | Select-String -Pattern "warning|deprecated|DEPRECATED"
```
Treat build warnings as errors-in-waiting. Fix them proactively.

---

## Architecture Conventions

```
ui/
  <feature>/
    <Feature>Screen.kt          // @Composable, stateless leaf
    <Feature>ViewModel.kt       // @HiltViewModel, exposes StateFlow<UiState>
domain/                         // optional; plain Kotlin, no Android deps
  <Feature>UseCase.kt
data/
  <feature>/
    <Feature>Repository.kt      // interface
    <Feature>RepositoryImpl.kt  // @Inject constructor; Room or network
    local/
      <Feature>Dao.kt
    remote/
      <Feature>Api.kt           // Retrofit interface
```

**Rules:**
- `ui` depends on `domain` (via interface); never on `data` directly.
- `domain` has zero Android imports.
- `data` depends on `domain` interfaces; implements them.
- Expose `StateFlow<UiState>` from ViewModels; never `LiveData`.
- Model UI states as a **sealed interface** with `Loading`, `Success`, and `Error` variants.

---

## Kotlin Best Practices

### Immutability
```kotlin
// ✅
data class Scene(val id: Long, val name: String)
val scenes: List<Scene> = emptyList()

// ❌
var scenes: MutableList<Scene> = mutableListOf()
```

### Sealed UI state
```kotlin
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
```

### Flow / coroutines
```kotlin
// ViewModel
private val _uiState = MutableStateFlow<UiState<List<Scene>>>(UiState.Loading)
val uiState: StateFlow<UiState<List<Scene>>> = _uiState.asStateFlow()

init {
    viewModelScope.launch {
        repository.observeScenes()
            .catch { e -> _uiState.value = UiState.Error(e.message ?: "Unknown") }
            .collect { scenes -> _uiState.value = UiState.Success(scenes) }
    }
}
```

### Nullable sprawl — prefer sealed / Result over nullable returns
```kotlin
// ✅
sealed interface SaveResult { data object Success : SaveResult; data class Failure(val reason: String) : SaveResult }

// ❌
fun save(): Boolean?
```

### Extension functions — only when they genuinely belong to the receiver
```kotlin
// ✅ — genuinely extends String behaviour
fun String.toSlug() = lowercase().replace(" ", "-")

// ❌ — just a free function masquerading as an extension
fun Scene.formatForDisplay() = TODO()  // put in a mapper instead
```

---

## Compose Best Practices

```kotlin
// State hoisting — pass state down, events up
@Composable
fun SceneCard(
    scene: Scene,
    onPlay: (Long) -> Unit,    // event up
    modifier: Modifier = Modifier,
)

// Collect Flow safely in Compose
val uiState by viewModel.uiState.collectAsStateWithLifecycle()

// Avoid recomposition traps
val derived by remember(key) { derivedStateOf { expensiveComputation(key) } }

// rememberSaveable for UI state that survives config changes
var expanded by rememberSaveable { mutableStateOf(false) }
```

**Stability rules:**
- Prefer `data class` with only stable fields for state passed to Composables.
- Annotate with `@Stable` / `@Immutable` only when the compiler cannot infer stability.
- Never read or write `MutableState` outside the Composition or a `LaunchedEffect`.

---

## Hilt DI Conventions

```kotlin
@HiltAndroidApp class App : Application()

@HiltViewModel
class SceneViewModel @Inject constructor(
    private val repository: SceneRepository,   // inject interface, not impl
) : ViewModel()

@Module @InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds @Singleton
    abstract fun bindSceneRepository(impl: SceneRepositoryImpl): SceneRepository
}
```

- Bind **interfaces**, not concrete types, in modules.
- Use `@Singleton` for repositories; `@ViewModelScoped` for use-cases bound to VM lifetime.
- Never inject `Context` directly into ViewModels — use `AndroidViewModel` only as a last resort; prefer wrapping in a `@Singleton` helper.

---

## Room Conventions

```kotlin
@Entity(tableName = "scenes")
data class SceneEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val createdAt: Long = System.currentTimeMillis(),
)

@Dao
interface SceneDao {
    @Query("SELECT * FROM scenes ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<SceneEntity>>   // Flow, not suspend fun, for live updates

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: SceneEntity): Long

    @Delete
    suspend fun delete(entity: SceneEntity)
}
```

- DAO methods that read live data return `Flow`; write operations are `suspend`.
- Always map `Entity ↔ Domain model` in the repository; never leak `Entity` into the domain layer.

---

## Error Handling

```kotlin
// Repository: wrap network/db calls
suspend fun loadScene(id: Long): Result<Scene> = runCatching {
    api.getScene(id).toDomain()
}

// ViewModel: translate Result to UiState
viewModelScope.launch {
    _uiState.value = UiState.Loading
    repository.loadScene(id)
        .onSuccess { _uiState.value = UiState.Success(it) }
        .onFailure { _uiState.value = UiState.Error(it.message ?: "Unknown error") }
}
```

---

## Test File Naming and Location

| Type | Location | Suffix |
|---|---|---|
| Unit (pure JVM) | `src/test/java/…` | `Test` (e.g. `SceneViewModelTest`) |
| Integration (Room in-memory) | `src/androidTest/java/…` | `DaoTest` |
| Compose UI | `src/androidTest/java/…` | `ScreenTest` |
| Cucumber step defs | `src/androidTest/java/…/steps/` | `Steps` |
| Gherkin features | `src/androidTest/assets/features/` | `.feature` |

---

## Code Review Checklist

Before marking an implementation done, verify:

- [ ] All new public functions/classes have a failing test that drove their creation.
- [ ] No block of code is repeated more than 2 times.
- [ ] No production code was written without a red test first.
- [ ] `val` used everywhere a `var` is not strictly required.
- [ ] No `!!` (not-null assertion) — use `?: return`, `?: error(…)`, or `require(…)`.
- [ ] No `Thread.sleep` in tests — use `advanceUntilIdle()` or Turbine.
- [ ] No logic in `@Composable` functions — move to ViewModel or use-case.
- [ ] Coroutines started in `viewModelScope`; never `GlobalScope`.
- [ ] Hilt modules bind interfaces, not implementations.
- [ ] Room DAO live queries return `Flow`, not `List`.
- [ ] **No deprecated APIs used** — all imports are current; replacements applied for any `@Deprecated` API.
- [ ] **All dependencies are in `libs.versions.toml`** — no hardcoded version strings in `build.gradle.kts`.
- [ ] **Detekt passes locally** — `./gradlew detekt` reports zero issues.
- [ ] **No build warnings** — `assembleDebug` produces no deprecation or unchecked-cast warnings.

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
