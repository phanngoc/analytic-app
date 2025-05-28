# Z-Index Layering Guide

This document explains the z-index hierarchy used in the analytics application to ensure proper layering of PopperContent and other UI components.

## ✅ Recently Reapplied Changes

**Date**: May 28, 2025  
**Changes**: Reapplied high z-index values for PopperContent components after manual file edits

### Updated Components:
1. **DropdownMenuContent**: `z-50` → `z-popover` (1060)
2. **DropdownMenuSubContent**: `z-50` → `z-popover` (1060)
3. **DialogOverlay**: `z-50` → `z-modal` (1050)
4. **DialogContent**: `z-50` → `z-modal` (1050)

## Z-Index Hierarchy

### Base Layer (z-index: 0-10)
- Normal content
- Cards, buttons, form elements

### Navigation Layer (z-index: 50)
- Sticky navigation bars
- Fixed headers

### Dropdown Layer (z-index: 1000)
- `.z-dropdown` class
- Basic dropdown menus

### Modal Layer (z-index: 1050)
- `.z-modal` class
- Dialog overlays and content
- Modal backgrounds

### Popover Layer (z-index: 1060)
- `.z-popover` class
- PopperContent components
- Context menus
- Advanced dropdown menus

### Tooltip Layer (z-index: 1070)
- `.z-tooltip` class
- Tooltips and help text

### PopperContent Specific Classes

For situations where you need even higher z-index for PopperContent:

```css
/* Standard high z-index */
.popper-content {
  z-index: 9999 !important;
}

/* Higher z-index for complex layouts */
.popper-content-high {
  z-index: 10000 !important;
}

/* Highest z-index for critical overlays */
.popper-content-highest {
  z-index: 99999 !important;
}
```

### Toast Layer (z-index: 100)
- Toasts and notifications
- System messages

## Usage Examples

### For PopperContent in Dropdown Menus
```tsx
<DropdownMenuContent className="z-popover">
  {/* Your content */}
</DropdownMenuContent>
```

### For Critical PopperContent
```tsx
<div className="popper-content-high">
  {/* PopperContent that needs to appear above everything */}
</div>
```

### For Standard PopperContent
```tsx
<div className="popper-content">
  {/* Standard PopperContent */}
</div>
```

## Component Updates Made

1. **DropdownMenu Components**: Updated from `z-50` to `z-popover` (1060)
2. **Dialog Components**: Updated from `z-50` to `z-modal` (1050)  
3. **Added Custom Classes**: Created `.popper-content*` classes for high z-index scenarios

## Best Practices

1. Use the semantic classes (`.z-dropdown`, `.z-modal`, etc.) for standard components
2. Use `.popper-content` classes only when you need PopperContent to appear above standard UI elements
3. Use `.popper-content-highest` sparingly, only for critical overlays
4. Always test layering in complex layouts with multiple overlapping elements
