# Role Management

## Feature Overview

Maintains the roles in the system. A role is the basic unit of permission assignment: an account gains the corresponding menu and operation permissions by binding roles.

## Role Information Fields

| Field | Description |
| --- | --- |
| Role Name | The display name of the role |
| Role Code | The unique identifier of the role (such as `R_SUPER`); cannot be modified during editing |
| Role Description | A description of the role's responsibilities |
| Enabled | The role no longer takes effect once deactivated |
| Created At | The role creation time; can be sorted by time |

## Page Operations

| Action   | Description                                                                  |
| -------- | ---------------------------------------------------------------------------- |
| Search   | Filters by Role Name and Role Code                                           |
| Add Role | Fill in the role name, code, description, and status                         |
| Edit     | Modifies the role name, description, and status (the code cannot be changed) |
| Delete   | Deletes the role after a confirmation prompt                                 |

## Roles and Permissions

- A role's feature permissions (which menus it can see and which buttons it can use) are selected per role on the [Feature Permission Management](./permission) page
- One account can bind multiple roles, and the final permissions are the aggregate of the permissions of all roles
- The system provides three built-in roles: Super Admin (`R_SUPER`), Admin (`R_ADMIN`), and Regular User (`R_USER`)

**Tip**: Role Management is visible only to Super Admin; we recommend keeping the codes of built-in roles so as not to affect the backend's built-in logic.
