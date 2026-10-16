Studia Design System — AI Implementation Prompt
Purpose: Give this document to an AI coding agent working on the Studia codebase. The agent should inspect the existing repository, then implement a cohesive, production-minded design system and apply it to the core study-planning experience.

Prompt
You are a senior product designer and frontend engineer. You are working on Studia, a web-first study organization platform for university students. Your task is to implement a reusable design system and apply it to the core product screens.
Do not only describe what you would do. Inspect the repository, make changes that fit its existing architecture, and implement the design in code.
1. Product context
Studia helps students organize their studying. It is not primarily an AI tutor or a content-generation app. The core product experience includes:
- Creating study projects and organizing courses or subjects.
- Uploading and reading study materials, especially PDFs.
- Breaking material into manageable sections.
- Planning study sessions around deadlines and available time.
- Running focus sessions using strategies such as Pomodoro.
- Tracking planned versus actual progress.
- Seeing useful study statistics and contextual suggestions.
- Using a limited, context-aware AI assistant to explain, simplify, translate, define, or briefly summarize selected text.
The product is desktop-first, because planning and PDF study are major workflows, but it must remain responsive and usable on tablets and phones.
The working product name is Studia. Keep the name easy to replace if branding changes later.
2. Design direction
Use a visual direction called Calm Productivity.
The interface should feel:
- Calm, focused, modern, and professional.
- More like a high-quality productivity SaaS product than a childish education app.
- Spacious and readable without wasting valuable study space.
- Consistent across dashboards, forms, timers, document workspaces, and analytics.
- Helpful without being visually noisy.
- Accessible and usable for long study sessions.
Use a restrained violet/indigo accent, neutral surfaces, clear typography, subtle borders, and meaningful status colors. Avoid excessive gradients, decorative blobs, too many colors, heavy shadows, constant animation, or a card for every single element.
Do not copy another product pixel-for-pixel. Use familiar productivity-app conventions while establishing Studia's own identity.
3. Recommended frontend stack
Prefer the following stack if it fits the current repository:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui for customizable UI components
- Geist as the primary Latin interface font
- IBM Plex Sans Arabic or a similarly readable Arabic font when Arabic UI is supported
- Lucide icons, if an icon library is needed and one is not already installed
Use Radix UI primitives and accessible patterns through shadcn/ui where appropriate.
Repository rules
Before changing code:
1. Inspect the repository structure, package manager, framework version, existing routes, styling approach, and installed dependencies.
2. Identify existing components and tokens that should be reused.
3. Follow the project's conventions instead of replacing its architecture unnecessarily.
4. Do not install duplicate libraries or add dependencies without a clear need.
5. Do not overwrite working product logic just to change the UI.
6. If the project already uses an equivalent library or a newer compatible setup, adapt the recommendations instead of forcing a migration.
4. Color system
Define colors as semantic design tokens, not as scattered hard-coded values. Use CSS variables so the theme can be changed centrally.
Light theme starting palette
Token / purpose	Starting value	Usage
Primary	#6257D9	Main actions, selected navigation, links, focus accents
Primary soft	#EEEAFE	Subtle selected states, tinted surfaces
Background	#F8F9FC	Main application canvas
Surface	#FFFFFF	Cards, dialogs, popovers, panels
Text	#202436	Main text and headings
Success	#16A36A	Completed tasks and positive progress
Border	Neutral gray with sufficient contrast	Dividers, card outlines, field borders
Muted text	Neutral gray	Supporting labels and secondary metadata
Warning	Accessible amber/orange	Due-soon states and caution
Destructive	Accessible red	Errors, destructive actions, overdue states when appropriate


These are starting values, not immutable requirements. Check actual foreground/background contrast in the implemented UI. Adjust shades where needed to meet WCAG AA contrast requirements; do not use a color for small text solely because it matches the palette.
Semantic token names
Create or map tokens for at least:
- background
- foreground
- card
- card-foreground
- popover
- popover-foreground
- primary
- primary-foreground
- secondary
- secondary-foreground
- muted
- muted-foreground
- accent
- accent-foreground
- border
- input
- ring
- success and its foreground
- warning and its foreground
- destructive and its foreground
Use the token conventions already established by shadcn/ui if the project uses its standard theming setup.
Color usage rules
- Reserve the primary violet for actions and meaningful emphasis.
- Keep most surfaces neutral.
- Use success, warning, and destructive colors consistently and only for their semantic purposes.
- Do not rely on color alone to communicate status; combine it with text, icons, or other indicators.
- Avoid using the primary color on every button, badge, icon, and border.
- Use subdued separators and shadows. Prefer borders and spacing over strong shadows.
5. Dark mode
Prepare a complete dark theme from the beginning, even if the first release initially emphasizes light mode.
Dark mode should use:
- A deep neutral background, starting near #11131B.
- Slightly lighter elevated surfaces.
- Light foreground text with adequate contrast.
- Muted but readable secondary text.
- Adjusted primary and status colors that remain legible on dark surfaces.
Do not merely invert every color. Check cards, dialogs, inputs, charts, tooltips, selected states, disabled controls, and PDF workspace chrome individually.
If theme switching is implemented, support Light / Dark / System preferences as appropriate. Persist the preference using the existing app pattern. Avoid a flash of the wrong theme during initial load where the framework supports preventing it.
6. Typography
Use a clear type scale with readable line heights.
Suggested starting scale:
Use	Size
Main page title	28–32 px
Section heading	20–24 px
Card / panel heading	16–18 px
Body text	14–16 px
Secondary text / metadata	12–14 px
Small labels	12 px minimum where practical


Rules:
- Use Geist for Latin UI text if available and compatible with the project.
- For Arabic UI, use IBM Plex Sans Arabic or another readable Arabic font with proper shaping.
- Define font weights and line heights consistently.
- Use typography to establish hierarchy rather than making every heading large or bold.
- Keep labels and metadata readable; do not make the interface feel cramped.
- Ensure mixed Arabic/English text, numbers, dates, and punctuation render correctly.
- Support right-to-left layout when Arabic localization is enabled; do not treat RTL as simply right-aligning all text.
PDF typography is separate
The PDF document itself must preserve its own rendering and zoom behavior. App font settings must not unexpectedly change the PDF's typography. Allow users to zoom the document independently from the surrounding interface.
7. Spacing, layout, borders, and elevation
Use a consistent spacing scale based on multiples of four:
4, 8, 12, 16, 24, 32, 40, 48, 64 px
Suggested starting conventions:
- Small control gaps: 8 px
- Form field internal spacing: 8–12 px
- Standard component gaps: 12–16 px
- Card padding: 16–24 px
- Section spacing: 24–32 px
- Main page padding: responsive, generally 24–32 px on desktop
Suggested corner radii:
- Small inputs and compact controls: 8 px
- Standard cards and panels: 12 px
- Large dialogs or prominent containers: 16 px
- Pills: fully rounded only when the component's meaning calls for it
Keep the scale consistent. Avoid assigning arbitrary spacing and corner radii to each new component.
Layout principles
- Use a persistent sidebar on wide desktop screens where it improves navigation.
- Provide a clear top-level navigation hierarchy.
- Use a centered or width-constrained content area for ordinary dashboard pages.
- Allow the PDF reading workspace to use available horizontal space.
- Establish a clear distinction between app navigation, page content, secondary panels, and transient overlays.
- Avoid excessive nested cards and unnecessary borders.
- Make primary actions easy to find without making every action visually primary.
8. Responsive behavior
Although the product is desktop-first, support smaller screens intentionally.
Desktop
- Sidebar navigation and a spacious main content region.
- Multi-column dashboard layouts where they improve scanning.
- A PDF workspace that can support document content and a contextual side panel.
- Analytics layouts that make good use of width without stretching text or charts excessively.
Tablet
- Reduce unnecessary columns and tighten page padding.
- Allow secondary panels to collapse or become drawers.
- Preserve the readability of the PDF and study controls.
Mobile
- Replace the full sidebar with an appropriate compact navigation pattern.
- Stack dashboard cards and forms.
- Keep timer actions large and easy to operate.
- Make PDF reading usable, with independent zoom and panels that can be opened or closed.
- Avoid horizontal overflow, tiny controls, and dense multi-column tables.
- Do not simply shrink the desktop layout; prioritize the most important mobile tasks.
Use responsive breakpoints consistently with the existing project and verify layouts at common viewport sizes.
9. Accessibility and component states
All reusable components must have intentional states:
- Default
- Hover
- Focus-visible
- Active / selected
- Disabled
- Loading
- Error
- Success, when applicable
Accessibility requirements:
- Use semantic HTML and accessible labels.
- Ensure every interactive element is keyboard accessible.
- Provide a visible focus indicator.
- Maintain sufficient text and UI contrast.
- Do not communicate meaning through color alone.
- Use appropriate ARIA attributes only when native semantics are insufficient.
- Ensure dialogs, menus, popovers, tooltips, and drawers work with keyboard and screen readers.
- Respect reduced-motion preferences.
- Use appropriately sized click/touch targets, especially on mobile.
- Include useful empty, loading, and error states rather than leaving blank areas.
Use shadcn/ui components where they help maintain accessibility and consistency, but customize their appearance to fit Studia.
10. Core screens to design
Implement the shared foundation first, then apply it to these three priority screens:
1. Dashboard
2. Study Session / Focus Timer
3. PDF Reader / Study Workspace
Then extend the system to Progress & Analytics.
A. Dashboard
The dashboard should answer quickly:
- What should I study next?
- What is planned for today?
- How much progress have I made?
- Is anything approaching a deadline?
- What is the most useful next action?
Include relevant elements such as:
- Greeting or concise page heading.
- Today's study plan.
- Upcoming study sessions.
- Subject or project progress.
- Planned versus completed study time.
- Upcoming deadlines and overdue work, if any.
- A clear primary action to start the next study session.
- Helpful suggestions only when there is a meaningful reason to show them.
Avoid:
- Too many KPI cards.
- Fake data presented as if it were real.
- Excessive charts on the first screen.
- Gamification elements that distract from studying.
If the app does not yet have backend data, use clearly identifiable mock data only where needed for the prototype. Keep mock data separate from real product logic.
B. Study Session / Focus Timer
This is a focus-oriented screen. Reduce distractions and make the current state unmistakable.
Include:
- Current subject, project, or material section.
- A prominent timer.
- Current session mode, such as Focus or Break.
- Clear Start, Pause, Resume, and Complete actions as appropriate to the current state.
- Session progress and concise context about what the user is working on.
- A way to return to the plan without losing the current session state.
- Useful completion feedback without excessive celebration or animation.
Important behavior:
- The timer UI must not depend on a request being sent every second.
- If timer logic already exists, preserve it and improve presentation without breaking state transitions.
- Display elapsed or remaining time based on the actual timer state, not merely a counter that resets on rerender.
- Make active, paused, completed, and break states visually distinct.
- Avoid disruptive animations and sounds unless explicitly enabled by the user.
C. PDF Reader / Study Workspace
The reading workspace is one of the product's most important screens.
Priorities:
- Give the document enough room to read comfortably.
- Keep navigation and document controls clear but unobtrusive.
- Support a contextual panel for sections, notes, study plan, or AI assistance when those features exist.
- Let the user open, close, or resize secondary panels where practical.
- Provide clear loading, processing, empty, and failure states.
- Keep PDF zoom independent from app UI typography.
- Preserve readable contrast around the document.
- Make page navigation and document actions easy to discover.
- Make selected-text actions contextual and concise rather than cluttering the entire screen.
Do not implement a decorative PDF mockup as a substitute for the actual reader if the repository already contains PDF functionality. Preserve existing document behavior and improve its surrounding experience.
D. Progress & Analytics
Include meaningful, understandable metrics such as:
- Planned study time versus actual study time.
- Completed sessions.
- Progress by subject or project.
- Weekly study activity.
- Work remaining before a deadline.
Rules:
- Use charts only when they communicate something useful.
- Label axes, units, time ranges, and categories clearly.
- Provide accessible labels or a textual equivalent for important chart insights.
- Do not imply predictive accuracy that the product does not have.
- Use consistent colors and scales across charts.
- Keep empty states useful for new users who do not yet have enough study history.
11. Reusable components to establish
Build or standardize reusable components as appropriate to the existing codebase. Likely candidates include:
- App shell and responsive navigation
- Page header
- Primary, secondary, outline, and destructive buttons
- Icon button
- Text input, textarea, select, checkbox, switch, and date/time controls
- Card and section container
- Dialog, drawer, popover, dropdown menu, and tooltip
- Tabs
- Badge / status indicator
- Progress bar
- Empty state
- Skeleton / loading state
- Error state and retry action
- Toast / notification
- Study session card
- Subject or project card
- Timer display and timer controls
- Deadline indicator
- Analytics chart container
- PDF workspace toolbar and contextual side panel
Do not create abstractions for every tiny element. Components should be reusable where there is a genuine repeated pattern.
12. Interaction and motion
- Prefer fast, subtle transitions.
- Use motion to clarify state changes, not to decorate every element.
- Keep hover and focus behavior consistent.
- Provide immediate feedback for actions.
- Avoid layout shifts when loading data.
- Respect reduced-motion preferences.
- Make destructive actions clear and require confirmation when appropriate.
- Preserve user work when opening and closing panels or navigating away from a running session.
13. Design-system implementation requirements
Create or update the appropriate project files for:
- Global design tokens and CSS variables.
- Light and dark theme values.
- Typography and font loading.
- Tailwind theme integration.
- Reusable shared UI components.
- Consistent page layouts.
- Accessible component states.
Use the conventions supported by the repository's installed versions of Tailwind CSS and shadcn/ui. Do not blindly copy configuration from a different major version.
Keep semantic color names in components. Avoid scattered raw hex values. If a one-off color is truly needed, document why it is outside the token system.
14. Suggested implementation sequence
Phase 1 — Inspect
- Review the repository and current app.
- Identify existing dependencies, components, routes, and product logic.
- Report any constraints that materially affect implementation.
Phase 2 — Establish foundations
- Configure design tokens.
- Establish typography and Arabic/RTL support if relevant.
- Set up light/dark themes.
- Standardize buttons, inputs, cards, badges, progress indicators, and common states.
Phase 3 — Build the first three screens
- Dashboard
- Study Session / Focus Timer
- PDF Reader / Study Workspace
Ensure these screens feel like one product, not three unrelated templates.
Phase 4 — Extend
- Apply the same system to Progress & Analytics.
- Add useful empty, loading, error, and responsive states.
- Remove inconsistent one-off styling.
Phase 5 — Verify
- Run the available lint, type-check, test, and build commands.
- Fix issues introduced by the changes.
- Check keyboard navigation, focus indicators, contrast, theme behavior, and responsive layouts.
- Summarize the files changed and any remaining limitations.
15. Acceptance criteria
The implementation is complete when:
- [ ] The interface has a consistent Calm Productivity visual identity.
- [ ] Colors, typography, spacing, radii, and borders use a coherent token system.
- [ ] Light mode works correctly; dark mode is implemented or the codebase is prepared for it with a clearly documented remaining step.
- [ ] The Dashboard, Focus Timer, and PDF Workspace look and behave as parts of the same product.
- [ ] The PDF workspace prioritizes reading space and keeps document zoom independent.
- [ ] Components include accessible focus, disabled, loading, error, and selected states where applicable.
- [ ] Layouts work on desktop, tablet, and mobile without horizontal overflow.
- [ ] Arabic typography and RTL behavior are handled if Arabic is part of the supported interface.
- [ ] Existing application logic and data flows remain functional.
- [ ] No fake data is presented as real user data.
- [ ] No unnecessary duplicate dependencies or large unrelated refactors were introduced.
- [ ] Linting, type checking, tests, and build pass where configured, or any pre-existing failures are clearly identified.
- [ ] The final response summarizes what was implemented, which files changed, verification performed, and any remaining issues.
16. Final instruction to the agent
Start by inspecting the existing repository. Then implement the design system and apply it to the actual application. Prefer a polished, coherent, usable experience over decorative complexity. Make reasonable decisions without asking about every small visual detail, but do not invent backend capabilities or break existing functionality.
If a feature is not implemented in the product yet, design a realistic empty or placeholder state rather than pretending it works. Keep the implementation maintainable so the product can grow into a full study-planning platform.