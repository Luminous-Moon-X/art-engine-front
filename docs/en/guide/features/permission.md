# Feature Permission Management

## Feature Overview

The system uses a two-level "menu + button" permission model: **menus** determine which pages are visible, while **buttons** (feature points) determine which operations are available inside a page, and every feature point has a unique **permission identifier**. Administrators use the "Feature Permissions" page to grant feature points to roles, departments, or users.

## Permission Model

| Concept | Description | Example |
| --- | --- | --- |
| Menu | First-level / multi-level menus and pages | System Management, Account Management |
| Button | A feature point inside a page, not shown in the menu | Add, Edit, Delete, Export, Reset Password |
| Permission Identifier | The unique code of a feature point, validated by the backend and used by the frontend to control visibility | `system:user:add` |

## Menu Maintenance

The menus and feature points of the entire system are maintained in "Menu Management" and displayed as a tree table:

| Item            | Content                                                           |
| --------------- | ----------------------------------------------------------------- |
| Search Criteria | Menu Name, Route Path                                             |
| Columns         | Menu Name, Menu Type, Sort, Route Path, Status, Actions           |
| Actions         | Add menu, Expand / Collapse All, add submenu inline, Edit, Delete |

Menu types include Directory, Menu, Button, Embedded Page, and External Link. The basic information of a menu includes:

| Field | Description |
| --- | --- |
| Menu Type | Directory / Menu / Button / Embedded / External Link |
| Menu Name | Name of the menu or feature point |
| Route Path | Page access path |
| Component Path | Location of the page component (the backend loads the page from this path) |
| Permission Identifier | Feature permission code, such as `system:user:add` |
| Icon / Sort | Menu icon and display order |
| External Link URL / Active Path | External link menus and highlight ownership |
| Other switches | Enabled, Cache Page, Hidden, Embedded, Show Badge, Fixed Tab, Hidden Tab, Fullscreen |

Button-type menus only require three items: permission name, permission identifier, and sort.

## Feature Authorization

The "Feature Permissions" page is used to grant feature points to specific subjects:

1. Select the authorization subject on the left; **Role**, **Department**, and **User** are supported (each is displayed as a tree, and the user tree does not include the Super Admin)
2. In the feature tree on the right, check the menus and buttons that the subject may use (the home page does not take part in authorization)
3. Click "Save" to submit; if no authorization subject is selected, the system prompts you to select one first

**Note**: Granting by department suits scenarios where an entire department uses the same set of features, while granting by user suits handling exceptions for individual accounts; the authorization results of the three subject types ultimately appear in that account's menus and buttons.

## How Permissions Take Effect

| Stage | Behavior |
| --- | --- |
| After login | The backend delivers the current account's roles, button permissions, and menus, and the frontend renders accordingly |
| Menu level | Menus you lack permission for are not displayed; typing the address of a page you cannot access redirects you back to the home page |
| Button level | Buttons you lack permission for are not displayed, and the backend validates them as well to prevent calls to the API that bypass the frontend |
| Tenant Package | The range of features available to a tenant is defined by permission identifiers, see [Tenant Management](./tenant) |

## Common Permission Identifiers

| Module | Permission Identifier |
| --- | --- |
| Account Management | `system:user:add`, `system:user:edit`, `system:user:delete`, `system:user:resetPassword` |
| Organization Management | `system:dept:add`, `system:dept:edit`, `system:dept:delete` |
| Role Management | `system:role:add`, `system:role:edit`, `system:role:delete` |
| Feature Authorization | `system:menu-permission:edit` |
| File Management | `system:oss-config:add/edit/delete/enable`, `system:oss-file:upload/download/delete` |
| Log Management | `system:login-log:delete`, `system:api-log:delete`, `system:menu-log:delete` |
