# Skill Registry

This file acts as a manifest of all available skills and project conventions for Agent Teams Lite.
It is auto-generated and should not be edited manually. Run the `skill-registry` skill to update it.

## User Skills

| Skill | Trigger Context | Description | Path |
|-------|-----------------|-------------|------|
| `branch-pr` | When creating a pull request, opening a PR, or preparing changes for review. | PR creation workflow for Agent Teams Lite following the issue-first enforcement system. | `~/.gemini/antigravity/skills/branch-pr/SKILL.md` |
| `go-testing` | When writing Go tests, using teatest, or adding test coverage. | Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing. | `~/.gemini/antigravity/skills/go-testing/SKILL.md` |
| `issue-creation` | When creating a GitHub issue, reporting a bug, or requesting a feature. | Issue creation workflow for Agent Teams Lite following the issue-first enforcement system. | `~/.gemini/antigravity/skills/issue-creation/SKILL.md` |
| `judgment-day` | When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen". | Parallel adversarial review protocol that launches two independent blind judge sub-agents simultaneously to review the same target. | `~/.gemini/antigravity/skills/judgment-day/SKILL.md` |
| `skill-creator` | When user asks to create a new skill, add agent instructions, or document patterns for AI. | Creates new AI agent skills following the Agent Skills spec. | `~/.gemini/antigravity/skills/skill-creator/SKILL.md` |
| `skill-registry` | When user says "update skills", "skill registry", "actualizar skills", "update registry", or after installing/removing skills. | Create or update the skill registry for the current project. | `~/.gemini/antigravity/skills/skill-registry/SKILL.md` |

## Project Conventions

*No project conventions detected (`agents.md`, `.cursorrules`, etc.)*

## Compact Rules (Auto-Resolved for Orchestrator)

*No project conventions to compile.*
