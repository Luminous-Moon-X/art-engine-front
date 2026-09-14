# Rule Management

## Feature Overview

Centrally maintain the business rules and parameters in the system (such as thresholds, switches, switch items, and text configuration), handing variable parameters that used to be hardcoded in the code over to backend configuration so that they can be adjusted without a release.

## Rule Fields

| Field | Description |
| --- | --- |
| Rule Name | The Chinese name of the rule |
| Rule Code | The unique identifier used when business modules reference the rule |
| Rule Value Type | The data type of the rule value, taken from the data dictionary (such as String, Number, Boolean, Text, etc.) |
| Rule Value | The concrete value of the rule; the input control switches automatically with the "Rule Value Type" (input box / number box / switch / textarea) |
| Enabled | Once disabled, business modules no longer read the rule |
| Remark | Additional notes |

## Page Operations

| Action | Description |
| --- | --- |
| Search | Filter by Rule Name and Rule Code |
| Add Rule | Fill in the code, name, value type, and rule value |
| Edit | Modify the rule name, value type, rule value, enabled status, and remark; switching the value type resets the rule value, which must then be filled in again |
| Delete | Delete the rule |
| Sort | The creation date supports sorting |

## Typical Use Cases

- **Business toggles**: feature rollouts and switch items are controlled centrally from the backend
- **Parameter configuration**: page size, upload size limit, timeout, and so on
- **Copy configuration**: prompts, announcement copy, and other variable content
