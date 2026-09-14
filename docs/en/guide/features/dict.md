# Data Dictionary

## Feature Overview

Centrally maintain the enumeration data in the system (dropdown options, status labels, etc.) so that business modules can reference it directly, avoiding hardcoding in code. Dictionaries are divided into two levels: **Dictionary Types** (the definition of a group of enumerations) and **Dictionary Items** (the specific options within a group).

## Dictionaries (Dictionary Types)

| Field           | Description                                                         |
| --------------- | ------------------------------------------------------------------- |
| Dictionary Name | The dictionary's display name, for example "User Gender"            |
| Dictionary Code | The unique identifier used when referenced by business modules      |
| Dictionary Type | The classification identifier of the dictionary                     |
| Enabled         | Once disabled, the dictionary is no longer used in business modules |
| Remark          | Additional notes                                                    |

Querying by Dictionary Name, Dictionary Code, Dictionary Type, and other conditions is supported, along with Add, Edit, and Delete operations.

## Dictionary Items

Maintain the specific options under a dictionary type:

| Field | Description |
| --- | --- |
| Dictionary Label | The text displayed to users, for example "Male" |
| Dictionary Value | The value actually stored, for example `1` |
| Display Style | The color used when displayed as a label: Default, Info, Success, Warning, Danger |
| Sort | The display order of the option |

Multiple dictionary items can be maintained under the same dictionary, with Add, Edit, and Delete supported; after dictionary items change, the dropdown options and label displays on business pages update accordingly.

## Typical Use Cases

- **Form dropdowns**: selection options such as gender and article type in Account Management
- **Status labels**: display statuses as labels in different colors in a list
- **Centralized maintenance**: when adding a new status, you only configure it in the dictionary, with no code changes required
