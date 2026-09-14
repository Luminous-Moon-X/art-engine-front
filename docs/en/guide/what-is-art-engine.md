# What is Art Engine?

Art Engine is a back-office management system built for enterprise and multi-tenant scenarios. It provides the features commonly found in admin systems, including tenant management, user management, organization management, role management, permission management, and dictionary management.<br/> The project combines design aesthetics with efficient development, making it well suited to quickly building websites and management systems during secondary development. It is released under the MIT license, which is permissive and free of copyright risk, so you can use it in closed-source commercial projects with confidence.

## Core Capabilities

| Capability | Description |
| --- | --- |
| Login & Authentication | Username and password login, multi-tenant selection at login, session persistence, password change and forced password change, logout, lock screen |
| Account Management | Create / edit / delete accounts, assign roles, set the owning organization, enable or disable, reset passwords |
| Organization Management | Maintain a tree-shaped organizational structure, used as the basis for account ownership and for filtering by organization |
| Role Management | Role maintenance; roles are the basic unit of permission assignment |
| Feature Permission Management | Two-level menu + button permissions, grantable by role / department / user, with permission identifiers precise down to individual operations |
| Multi-Tenant | Tenant and tenant package management, data isolation between tenants, packages controlling the feature scope available to a tenant |
| Data Dictionary | Centrally maintain dropdown options and status labels, so business code never has to hard-code enums |
| File Management | Object storage configuration and file upload, browsing, download, and deletion |
| Log Management | Login logs, menu logs, and API logs, with conditional search and auditing |
| Rule Management | Central configuration of business rules and system parameters, adjustable without a release |
| Knowledge Base & AI Chat | Document upload, parsing, and vectorization, combined with AI conversations for enterprise knowledge Q&A |
| User Center | Profile maintenance and login password changes |

## Key Features

- **Fine-grained permissions**: Menu-level and button-level permissions, validated on the backend and used by the frontend to control visibility
- **Multi-tenant**: Tenant data isolation, with packages granting feature permissions
- **Flexible, beautiful UI**: Light / dark / follow-system theme, custom theme color, four menu layouts, multi-tab bar
- **Ready to use out of the box**: A complete set of back-office management features, ready to use out of the box

## Runtime Environment

- Browser: modern browsers such as Chrome, Edge, Firefox, and Safari

## How to Read This Manual

| Section | Who it is for |
| --- | --- |
| [Quick Start](./quick-start) | Running the system for the first time and wanting to log in and look around |
| [Deploy](./deploy) | Needing to publish the system to a server |
| [Features](./features/login) | Wanting to know how each business module is operated |
| Development Guide | Secondary development topics (in progress) |
