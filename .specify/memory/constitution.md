<!--
Sync Impact Report:
─────────────────────────────────────────────────────────────────────────────
Version: N/A → 1.0.0
Change Type: MAJOR (Initial constitution ratification)
Rationale: First version establishing core governance principles for PawPa

New Sections Added:
  • Core Principles (5 principles covering quality, testing, UX, performance, mobile)
  • Quality Standards (code quality gates and metrics)
  • Development Workflow (process and review requirements)
  • Governance (amendment and compliance procedures)

Modified Principles: N/A (initial version)
Removed Sections: N/A (initial version)

Template Consistency Status:
  ✅ .specify/templates/plan-template.md - Updated Constitution Check section reference
  ✅ .specify/templates/spec-template.md - Aligned requirements with constitution principles
  ✅ .specify/templates/tasks-template.md - Aligned task organization with testing discipline
  ⚠  Command files - No command files found in .specify/templates/commands/
  ✅ CLAUDE.md - Already aligned with constitution principles
  ✅ README.md - Reflects constitution values

Follow-up TODOs: None - all placeholders filled

Commit Message:
  docs: ratify constitution v1.0.0 (code quality, testing, UX, performance principles)
─────────────────────────────────────────────────────────────────────────────
-->

# PawPa Mobile App Constitution

## Core Principles

### I. Type Safety & Code Quality (NON-NEGOTIABLE)

TypeScript strict mode is MANDATORY across the entire codebase. All code MUST be fully typed with zero `any` types except when interfacing with untyped third-party libraries where explicit justification is required.

**Rules**:
- TypeScript `strict: true` configuration enforced
- No `any` types without documented justification and TODO for removal
- All functions MUST have explicit return types
- All components MUST have typed props interfaces
- Zod schemas MUST validate all external data (API responses, user input)
- ESLint MUST pass with zero warnings before commits

**Rationale**: Type safety prevents runtime errors in production, enables confident refactoring, provides self-documenting code, and is critical for mobile apps where debugging is harder than web applications.

### II. Testing Discipline

Testing is REQUIRED for all critical paths and business logic. Tests MUST be written before implementation (Test-Driven Development) for new features when specified in requirements.

**Rules**:
- **Unit Tests**: REQUIRED for all service layer functions, utilities, and business logic
- **Integration Tests**: REQUIRED for API endpoints and data flow between layers
- **Component Tests**: REQUIRED for forms, interactive UI components, and complex state management
- **Contract Tests**: REQUIRED when API schemas change or new endpoints are added
- Tests MUST be isolated, deterministic, and fast (<5s for unit tests)
- Test coverage MUST be maintained or improved with each PR (minimum 70% for services)
- Mock external dependencies (API, storage, notifications) in unit tests
- Use real API calls in integration tests with test database

**Test Organization**:
```
tests/
├── unit/           # Isolated function tests
├── integration/    # Multi-layer data flow tests
├── component/      # React component tests
└── contract/       # API schema validation tests
```

**Rationale**: Mobile apps are distributed to users' devices and cannot be hot-fixed easily. Comprehensive testing catches bugs before deployment, ensures refactoring safety, and maintains reliability across iOS, Android, and web platforms.

### III. User Experience Consistency

All UI components and interactions MUST follow the established design system and provide consistent, delightful experiences across all platforms (iOS, Android, web).

**Rules**:
- **Theme System**: MUST use React Native Paper theme tokens (colors, spacing, typography)
- **Rainbow Pastel Colors**: Primary (#FFB3D1), Secondary (#B3FFD9), Tertiary (#C8B3FF), Accent (#FFDAB3), Surface (#FFF3B3)
- **Dark Mode**: All components MUST support both light and dark themes
- **Accessibility**: MUST provide accessible labels, touch targets ≥44px, and screen reader support
- **Animations**: MUST be smooth (60fps), meaningful, and respect user's motion preferences
- **Loading States**: MUST show appropriate loading indicators for all async operations
- **Error States**: MUST display user-friendly, localized error messages with recovery actions
- **Offline Mode**: MUST gracefully handle network interruptions with clear user feedback
- **Component Reuse**: MUST check existing components before creating new ones
- **Design Tokens**: MUST use design system spacing, sizing, and color tokens (no magic numbers)

**Rationale**: Consistency builds user trust and reduces cognitive load. A cohesive design system enables faster development, easier maintenance, and professional polish that distinguishes quality apps.

### IV. Performance & Mobile Optimization (NON-NEGOTIABLE)

All features MUST be optimized for mobile devices with limited memory, battery life, and network connectivity. Performance is a core feature, not an afterthought.

**Rules**:
- **Cache Strategy**: MUST implement appropriate TanStack Query cache durations (IMMUTABLE, LONG, MEDIUM, SHORT, VERY_SHORT)
- **Network Awareness**: MUST adapt behavior based on connectivity (online/offline detection)
- **Memory Management**: MUST cancel requests on component unmount, cleanup subscriptions, and avoid memory leaks
- **Background Sync**: MUST use intelligent background refetch intervals based on data volatility
- **Prefetching**: SHOULD implement smart prefetching for predictable user navigation patterns
- **Bundle Size**: MUST minimize JavaScript bundle size (<5MB) and use lazy loading for heavy screens
- **Image Optimization**: MUST compress images, use appropriate formats (WebP), and implement lazy loading
- **List Rendering**: MUST use FlatList/SectionList with proper `keyExtractor` for lists >20 items
- **Animation Performance**: MUST use `useNativeDriver: true` for animations where possible
- **API Response Time**: Target <2s for critical API calls, <5s for non-critical operations
- **App Launch Time**: Target <3s cold start time on mid-range devices

**Performance Monitoring**:
- Frame rate MUST stay above 55fps during scrolling and animations
- Memory usage MUST stay under 150MB on typical user flows
- Network requests MUST include timeout configurations (15s default)

**Rationale**: Mobile users expect instant responsiveness and smooth interactions. Poor performance leads to app abandonment, negative reviews, and battery drain complaints. Optimization must be built-in from the start, not retrofitted later.

### V. Architecture & Code Organization

Code MUST follow the established layered architecture to maintain separation of concerns, enable testability, and support team collaboration.

**Layer Architecture** (MANDATORY):
```
Screen Layer          → Navigation screens (Expo Router)
    ↓
Component Layer       → Reusable UI components
    ↓
State Management      → TanStack Query (server state) + Zustand (client state)
    ↓
Service Layer         → API service classes (petService, healthRecordService, etc.)
    ↓
API Layer             → Axios HTTP client with interceptors
```

**Rules**:
- **Screens** MUST NOT contain business logic or API calls directly
- **Components** MUST be pure and reusable with typed props
- **Hooks** (lib/hooks/) MUST handle data fetching, mutations, and state management
- **Services** (lib/services/) MUST encapsulate all API operations
- **API Client** (lib/api/client.ts) MUST handle authentication, errors, and logging
- **Stores** (stores/) MUST manage only client-side state (theme, language, preferences)
- **Forms** MUST use React Hook Form + Zod validation
- **Navigation** MUST use Expo Router file-based routing (no manual navigation config)

**File Organization**:
- Related files MUST be co-located (e.g., PetCard.tsx and PetCard.test.tsx)
- Utility functions MUST live in lib/utils/ with clear, single-purpose modules
- Constants MUST be centralized in constants/ directory
- Types MUST be exported from lib/types.ts or co-located with components

**Rationale**: Layered architecture prevents spaghetti code, makes testing straightforward, enables parallel team development, and ensures that changes in one layer don't cascade unpredictably through the system.

## Quality Standards

### Code Review Requirements

ALL pull requests MUST pass the following gates before merging:

1. **Type Safety**: TypeScript compilation with zero errors and zero `any` types
2. **Linting**: ESLint passing with zero warnings
3. **Tests**: All existing tests passing + new tests for new functionality
4. **Performance**: No degradation in app launch time or frame rate
5. **Accessibility**: New UI components include accessibility labels
6. **Documentation**: Complex logic includes JSDoc comments
7. **Internationalization**: All user-facing text uses i18n translation keys

### Prohibited Patterns

The following patterns are PROHIBITED and will block PR approval:

- **Ignored TypeScript Errors**: No `// @ts-ignore` or `// @ts-expect-error` without documented justification
- **Console Statements**: No `console.log()` in production code (use proper logging)
- **Hardcoded Strings**: No user-facing text without i18n translation keys
- **Magic Numbers**: No unexplained numeric constants (use named constants)
- **God Components**: No components >300 lines (extract sub-components)
- **Tight Coupling**: No direct imports between screens (use services/hooks)
- **Premature Optimization**: No complex abstractions without proven need
- **Feature Flags**: No commented-out code or unused feature flags (delete if unused)

### Simplicity Requirements

Code MUST be simple and focused. Follow YAGNI (You Aren't Gonna Need It):

- Don't add features not in requirements
- Don't create abstractions for single use cases
- Don't add error handling for impossible scenarios
- Don't optimize prematurely without performance data
- Don't add comments explaining obvious code (refactor for clarity instead)
- Three similar code blocks is better than a premature abstraction

**Complexity Justification**: If violating simplicity (e.g., introducing new design pattern), document in PR:
- What problem requires this complexity
- What simpler alternatives were tried
- What future benefits justify current cost

## Development Workflow

### Feature Development Process

1. **Specification** (via `/speckit.specify`):
   - Capture user requirements as testable scenarios
   - Define functional requirements with FR-XXX identifiers
   - Establish measurable success criteria
   - Identify edge cases and error scenarios

2. **Planning** (via `/speckit.plan`):
   - Research technical approach and dependencies
   - Design data models and API contracts
   - Verify constitution compliance (gates check)
   - Create quickstart guide for feature usage

3. **Task Breakdown** (via `/speckit.tasks`):
   - Convert plan into dependency-ordered tasks
   - Organize by user story for independent delivery
   - Mark parallel tasks for efficient execution
   - Include exact file paths in task descriptions

4. **Implementation** (via `/speckit.implement`):
   - Write tests first (if TDD specified in requirements)
   - Implement features following layered architecture
   - Ensure all quality gates pass
   - Update documentation and quickstart guides

5. **Review & Deploy**:
   - Code review against constitution principles
   - Performance testing on mid-range devices
   - Accessibility audit for new UI components
   - Staged rollout with monitoring

### Git Workflow

- **Branch Naming**: `[issue-number]-feature-name` (e.g., `123-pet-photo-upload`)
- **Commit Messages**: Conventional commits format (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`)
- **PR Size**: Target <500 lines changed per PR for effective review
- **Merge Strategy**: Squash and merge for feature branches

### Network-Aware Development

Since PawPa is a mobile app with unpredictable network conditions:

- MUST test features with simulated slow 3G and offline modes
- MUST provide clear feedback for network state changes
- MUST implement optimistic updates with rollback capability
- MUST handle network errors gracefully with retry logic
- MUST cache appropriately to support offline browsing

## Governance

### Amendment Procedure

This constitution can be amended through the following process:

1. **Proposal**: Document proposed changes with rationale in PR description
2. **Impact Analysis**: Identify affected code, templates, and workflows
3. **Version Increment**: Apply semantic versioning:
   - **MAJOR**: Backward-incompatible principle changes (e.g., removing a requirement)
   - **MINOR**: New principles or expanded guidance (e.g., adding accessibility rules)
   - **PATCH**: Clarifications, wording fixes, non-semantic improvements
4. **Template Sync**: Update all dependent templates (plan, spec, tasks, checklist)
5. **Approval**: Requires maintainer approval + successful trial on feature branch
6. **Migration Plan**: For breaking changes, provide migration guide and grace period

### Compliance Review

- All PRs MUST be reviewed against this constitution's principles
- Constitution violations MUST be documented in Complexity Tracking table if justified
- Unjustified violations BLOCK PR approval
- Quarterly constitution review to ensure relevance and effectiveness

### Living Document

This constitution is a living document that evolves with the project:

- Principles should be testable and measurable (not vague aspirations)
- Rules should be specific and enforceable (not general guidelines)
- Rationale explains WHY, not just WHAT (helps with future decisions)
- Examples clarify complex or ambiguous rules
- Review and update based on team learnings and changing requirements

### Related Guidance

- **Runtime Development**: See `CLAUDE.md` for detailed technical architecture and patterns
- **API Documentation**: See `README.md` for API endpoints and integration details
- **Templates**: See `.specify/templates/` for spec, plan, and task templates

**Version**: 1.0.0 | **Ratified**: 2025-11-23 | **Last Amended**: 2025-11-23
