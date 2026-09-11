# Tenant Management

## Feature Overview

Multi-tenancy for SaaS scenarios: the platform can create and maintain multiple tenants, and each tenant has its own accounts, organizations, roles, and permission data; the range of features a tenant can enable is controlled centrally by "Tenant Packages".

Whether multi-tenancy is enabled, and which tenant is the default, is determined by the backend configuration; when multi-tenancy is not enabled, no tenant-related entry appears on the login page or in the top bar.

## Tenant Fields

| Field           | Description                                                                   |
| --------------- | ----------------------------------------------------------------------------- |
| Tenant Code     | Unique identifier of the tenant; cannot be modified while editing             |
| Tenant Name     | Display name of the tenant                                                    |
| Tenant Package  | Range of features available to this tenant                                    |
| Tenant Admin    | The tenant's administrator account; can be created together with a new tenant |
| Expiration Date | Expiration date of the tenant                                                 |
| Status          | Once disabled, accounts under this tenant cannot log in                       |
| Remark          | Additional notes                                                              |

## Page Operations

| Operation | Description |
| --- | --- |
| Search | Filter by tenant name, tenant code, or package |
| Add tenant | Fill in the tenant information and specify a package and administrator account |
| Edit | Modify the package, expiration date, status, and other information |
| Delete | Delete the tenant |
| Status | Set while editing the tenant (shown as a tag in the list); once disabled, accounts under this tenant cannot log in |

## Tenant Packages

Packages are used to define the range of features available to tenants in bulk, and the Super Admin maintains them under "Tenant Packages":

| Field | Description |
| --- | --- |
| Package Name | Display name of the package |
| Menu Permissions | Check the menus and feature permissions included in this package; Select All and Expand are supported |
| Menu Count | Number of menus currently checked |
| Status / Remark | Status and description of the package |

**Note**: Selecting no menus in a package means no restriction (that is, all features are available). Tenant packages are granular down to the feature permission level, and the checked menus serve as the basis for the features available to that tenant.

## Switching Tenants

Once multi-tenancy is enabled, there are two ways to switch:

- **Select at login**: choose the tenant to log in to from the "Tenant" dropdown on the login page
- **Switch after login**: the tenant switch entry in the top-right corner of the top bar, visible only to the Super Admin

## Permissions

Tenant management and tenant packages can be operated only by the Super Admin.
