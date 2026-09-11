# Login & Authentication

## Feature Overview

Provides a complete set of authentication capabilities, including account-and-password login, graphical human verification, multi-tenant login selection, login state persistence, password reset and forced password change, logout, and lock screen. After a successful login, the backend issues the current user's roles, button permissions, and menus, and the frontend renders the visible menus and action buttons based on them.

## Login

The left side of the login page presents the product introduction, and the right side holds the login form (slider verification is completed locally to prevent accidental operations and automated submissions):

| Form Item | Description |
| --- | --- |
| Tenant | Shown only when multi-tenancy is enabled on the backend; select the tenant to log in to before signing in |
| Account / Password | Required; the password is verified with backend encryption |
| Slider Verification | Press and drag the slider to the far right; once "Verification successful" appears, the form can be submitted |
| Remember password | Checked by default; when checked, the account and password are filled in automatically the next time the page is opened |

Demo accounts (all passwords are `123456`):

| Role         | Account | Visible Scope                                                 |
| ------------ | ------- | ------------------------------------------------------------- |
| Super Admin  | `Super` | All features                                                  |
| Admin        | `Admin` | Excludes sensitive features such as roles, menus, and tenants |
| Regular User | `User`  | Basic features                                                |

After a successful login, the following steps are completed in order: save the login credentials → fetch the current user's information (roles, button permissions, tenant) → generate menus based on permissions → redirect to the home page; if the user was redirected to the login page after being intercepted, they are automatically returned to the page they originally intended to visit.

- Login failure: an error message returned by the backend pops up in the top-right corner of the page
- When the backend reports that the password must be changed (for example, on first login or after the password expires), the Reset Password window opens immediately, and the system cannot be entered until the change is completed

## Reset Password

Top bar → avatar → "Reset password"; fill in the old password, the new password, and the confirmation password. After a successful submission, the system automatically logs out, and you must log in again with the new password.

## Logout

Top bar → avatar → "Log out"; clears the local login state and returns to the login page.

## Lock Screen

- Trigger: the shortcut key `Alt` + `` ` `` (backtick)
- Lock: confirm the avatar and username, set a lock screen password, and click "Lock"; while the screen is locked, common shortcuts such as the context menu and F12 are blocked
- Unlock: enter the unlock password on the full-screen unlock page and click "Unlock"; you can also click "Back to login" to log out directly

## Related Pages

| Page | Status |
| --- | --- |
| Register | The form is provided, but the demo environment is not connected to a backend; submitting it only shows a success message and returns to the login page |
| Forgot Password | The form is provided, but the backend is not yet connected |
