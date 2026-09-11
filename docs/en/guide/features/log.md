# Log Management

## Feature Overview

The system records three types of runtime logs for security auditing and troubleshooting: Login Log, Menu Log, and API Log. The three types are independent of each other, and each supports conditional search and deletion.

## Login Log

Records the time, source, and result of every login attempt.

| Item            | Content                                                                |
| --------------- | ---------------------------------------------------------------------- |
| Search Criteria | Username, Nickname, Login IP, Login Status, time range                 |
| Columns         | Username, Nickname, Login IP, Browser, OS, Login Time, Status, Message |
| Actions         | View, Delete                                                           |

You can use it to investigate "which account logged in at what time, from what device and location, and whether it succeeded".

## Menu Log

Records users' click behavior on menus (pages).

| Item            | Content                                              |
| --------------- | ---------------------------------------------------- |
| Search Criteria | Username, Nickname, Menu Name, Menu Path, time range |
| Columns         | Username, Nickname, Menu Name, Menu Path, Clicked At |
| Actions         | View, Delete                                         |

You can use it to understand how often each feature is used, providing a basis for feature optimization.

**Note**: Menu logs are reported automatically by the system when pages are switched; no manual action is required.

## API Log

Records backend API calls and is the primary basis for troubleshooting API exceptions.

| Item | Content |
| --- | --- |
| Search Criteria | Username, Nickname, Request URL, Request Method, Response Code, time range |
| Columns | Username, Nickname, Operation Description, Request URL, Response Code, Duration, Request Time |
| Details | Request Method, Source IP, Request Parameters, Response (JSON) |
| Actions | Details, Delete |

**Limitation**: The "Bulk Delete" button in the log list is currently unavailable (the table does not enable the selection column, so no data can be selected). Use the "Delete" action on each row when you need to remove records.

## Permissions

The delete operation for each of the three log types maps to a separate permission: `system:login-log:delete`, `system:api-log:delete`, `system:menu-log:delete`.
