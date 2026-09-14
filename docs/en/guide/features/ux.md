# UI & Common Operations

## Layout

After logging in, the interface consists of four parts: the sidebar, the top bar, the multi-tab bar, and the content area. The menu is determined by the permissions delivered by the backend after login; features you do not have permission for will not appear.

## Top Bar

| Position | Element | Description |
| --- | --- | --- |
| Left | Logo / system name | Click to return to the home page |
| Left | Collapse menu / refresh / quick entry / breadcrumb | Collapse the menu, refresh the current page, quickly open frequently used features, view the page hierarchy |
| Right | Search | Global menu search, shortcut `Ctrl` / `⌘` + `K` |
| Right | Tenant switch | Shown when multi-tenancy is enabled and you are the Super Admin |
| Right | Fullscreen / language | Browser fullscreen; switch between Simplified Chinese and English |
| Right | Notice | Message panel (notifications / messages / to-dos), can be marked as read |
| Right | AI Chat | Open the smart Q&A window; see [Knowledge Base & AI Chat](./knowledge) |
| Right | Settings / theme toggle | Open the appearance settings drawer; switch between Light and Dark modes |
| Right | Avatar | User Center, reset password, log out |

## Appearance Settings

Click the "Settings" icon on the right side of the top bar to open the settings drawer; changes take effect immediately:

| Group | Configurable items | Default |
| --- | --- | --- |
| Theme Style | Light / Dark / System | System |
| Theme Color | Multiple preset theme colors | Default theme color |
| Menu Layout | Vertical, Horizontal, Mixed, Dual | Vertical |
| Menu Style | Design, Light, Dark | Design |
| Box Style | Border / Shadow | Border |
| Container Width | Full / Boxed | Full |
| Tab Style | Default / Card / Chrome | Default |
| Page Animation | None, Fade, Slide Left, Slide Bottom, Slide Top | Slide Left |
| Border Radius / Menu Width | Global border radius, expanded menu width | 0.75 / 215 |
| Basic Switches | Show work tab, Sidebar opens accordion, Show sidebar button, Show fast enter, Show reload page button, Show crumb navigation, Show multilingual selection, Show top progress bar, Color Weakness Mode, Global watermark | The first seven are on, the last three are off |

The bottom of the settings drawer provides "Copy Config" and "Reset Config".

## Multi-Tab Bar

Once the multi-tab bar is enabled, visited pages are arranged as tabs:

- Close a tab: click the close button on the tab (not shown when there is only one tab)
- Right-click menu: refresh, pin / unpin, close left, close right, close others, close all
- Pinned tabs (home, workbench) do not take part in bulk closing
- When there are too many tabs, horizontal scrolling with the mouse wheel is supported, and switching pages automatically scrolls the tab into view

## Common List and Form Operations

All management pages in the system share the same set of interactions, so once you are familiar with one page you can use them all:

| Area | Operation |
| --- | --- |
| Search bar | Fill in the criteria and click "Search", or click "Reset" to clear them; expand / collapse when there are many criteria |
| Toolbar | Show/hide the search bar, refresh, Density (Compact / Default / Loose), fullscreen, Column Settings, display settings (zebra, border, header background) |
| Column Settings | Check columns to show or hide them, drag to reorder columns |
| Pagination | 10 / 20 / 30 / 50 / 100 rows per page, with page numbers and jump-to-page; returns to the top of the table after paging |
| Bulk actions | After rows are selected, the bulk buttons show the number selected; dangerous operations such as delete require a second confirmation |
| Form | Required-field validation, reset; add and edit share the same form, and key fields (username, code, etc.) cannot be modified while editing |
| State persistence | Table appearance preferences are retained; pages with page caching enabled retain their search criteria and pagination until the tab is closed |

## Example Pages

In addition to the business features above, the system also ships with a large number of attractive and practical example pages/demos (dashboard, Template Center, Components, Feature Examples, result and exception pages, and more), used to demonstrate interface effects and interaction patterns. The data on these pages is mostly demo data, and can serve as a reference for secondary development.
