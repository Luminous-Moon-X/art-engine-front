# Organization Management

## Feature Overview

Maintains the company's organizational structure (departments) as a tree, supports parent-child relationships at any level, and serves as the basis for account ownership and for filtering data by organization.

## Organization Information Fields

| Field               | Description                                                                |
| ------------------- | -------------------------------------------------------------------------- |
| Department Name     | The name of the organization node                                          |
| Parent Department   | The parent organization; when empty, it indicates a top-level organization |
| Sort Order          | The display order of nodes at the same level                               |
| Owner               | The owner of the organization                                              |
| Owner Phone / Email | The owner's contact information                                            |
| Enabled             | Once deactivated, the organization no longer appears in selection lists    |

## Page Operations

| Action | Description |
| --- | --- |
| View Organization Tree | Displays all organization levels as a tree |
| Add Sub-organization | Adds a child organization under a specified node |
| Edit | Modifies the organization name, owner, sort order, and other information |
| Delete | Deletes the organization node |

## Related Capabilities

- **Organization Tree Selection**: The "Department" field in Account Management and filtering lists by organization both use the same organization tree
- **Account Ownership**: Each account belongs to one organization node; when the organization changes, the account's ownership relationship is updated accordingly
