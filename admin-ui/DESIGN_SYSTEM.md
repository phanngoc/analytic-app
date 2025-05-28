# Analytics Hub - Design System

## Color Palette

Our analytics platform uses a professional, data-focused color scheme designed to enhance readability and user experience while maintaining a modern, trustworthy appearance.

### Primary Colors

- **Primary Blue** (`#2563eb` - Blue 600): Main brand color representing trust, technology, and data
- **Secondary Purple** (`#7c3aed` - Purple 600): Analytics and insights accent color
- **Success Green** (`#059669` - Emerald 600): Growth, positive metrics, and success states
- **Warning Amber** (`#d97706` - Amber 600): Attention, alerts, and neutral metrics
- **Error Red** (`#dc2626` - Red 600): Errors, decline, and critical states

### Data Visualization Palette

A carefully selected set of colors for charts and graphs:

1. **Chart Color 1**: `#2563eb` (Primary Blue)
2. **Chart Color 2**: `#7c3aed` (Purple)
3. **Chart Color 3**: `#059669` (Emerald)
4. **Chart Color 4**: `#d97706` (Amber)
5. **Chart Color 5**: `#dc2626` (Red)
6. **Chart Color 6**: `#0891b2` (Cyan)
7. **Chart Color 7**: `#be185d` (Pink)
8. **Chart Color 8**: `#65a30d` (Lime)

### Neutral Colors

- **Background**: `#ffffff` (Light) / `#020617` (Dark)
- **Foreground**: `#0f172a` (Light) / `#f8fafc` (Dark)
- **Muted**: `#f8fafc` (Light) / `#1e293b` (Dark)
- **Border**: `#e2e8f0` (Light) / `#334155` (Dark)

## Typography

- **Font Family**: Inter (Primary), System fonts fallback
- **Monospace**: JetBrains Mono for code snippets and API keys

## Component Styles

### Cards
- Use `.analytics-card` class for consistent styling
- Hover effects with subtle scale and shadow
- Rounded corners with soft shadows

### Metrics
- Large, bold numbers for key metrics
- Color-coded indicators for positive/negative trends
- Consistent icon usage with colored backgrounds

### Status Indicators
- Green for active/online states
- Amber for warning states
- Red for error/inactive states

## Usage Guidelines

1. **Primary colors** should be used sparingly for main actions and brand elements
2. **Secondary colors** work well for data visualization and accent elements
3. **Success/Warning/Error colors** should be used consistently for status indicators
4. **Neutral colors** provide the foundation for text and backgrounds
5. **Chart colors** should be used in order for consistent data visualization

## Accessibility

- All color combinations meet WCAG AA contrast requirements
- Colors are not the only way to convey information
- Status indicators include both color and text/icons
- Dark mode support included for all colors

## Implementation

Colors are implemented using CSS custom properties and Tailwind CSS utilities. See `globals.css` and `tailwind.config.js` for the complete implementation.
