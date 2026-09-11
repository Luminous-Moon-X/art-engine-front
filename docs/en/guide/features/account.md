# Account Management

## Feature Overview

Manages system accounts across their entire lifecycle: adding accounts, editing profiles, assigning roles and organizations, enabling / disabling, resetting passwords, and deleting accounts, with the ability to filter and view by organization (department).

## Page Operations

The left side of the page is the organization tree, and the right side is the account list.

| Item | Content |
| --- | --- |
| Search Criteria | User Name and username, optionally combined with status, phone number, email, and other conditions |
| List Columns | User Name, Username, Gender, Phone Number, Email, Created At, Status, Actions |
| Add / Edit | Opens a form dialog for entering account information |
| Reset Password | After a confirmation prompt, resets that account's password to the system default password |
| Delete | After a confirmation prompt, deletes the account (the operation cannot be undone) |
| Status | The account status is displayed as a tag in the list and is set in Add / Edit; once disabled, the account cannot log in |

## Account Information Fields

| Field | Description |
| --- | --- |
| Username | The login account; cannot be modified during editing |
| Name | The nickname used for display |
| Department | The organization node it belongs to, taken from Organization Management |
| Roles | Multiple selection; determines the account's menu and button permissions |
| Email / Phone / Address | Contact information |
| Gender | Taken from the data dictionary |
| Enabled | The account cannot log in once this is turned off |
| Bio / Personal Tags | Information displayed in User Center |

## Permissions

- Account Management is open to Super Admin and Admin by default; sensitive features such as menus, roles, and tenants are visible only to Super Admin
- Add, Edit, Delete, and Reset Password each correspond to an independent feature permission; when the permission is missing, the button is not displayed

## Relationships with Other Modules

- **Organization Management**: An account must belong to an organization node, and the organization tree is also used to filter accounts by organization
- **Role Management**: An account gains permissions through roles, and one account can have multiple roles
- **Log Management**: An account's login activity is recorded in the Login Log
