# File Management

## Feature Overview

Unified object storage (OSS) file management: it provides centralized configuration of cloud storage services and offers upload, browse, download, and delete capabilities for files. Attachments such as images and documents used by the business are all managed here.

## Object Storage Configuration

Maintain the available storage service configurations:

| Field | Description |
| --- | --- |
| Config Name | A name that is easy to identify, such as "Alibaba Cloud OSS" |
| Endpoint | Endpoint of the storage service |
| Access Key / Secret Key | Access credentials; leaving Secret Key empty while editing means no change |
| Bucket | Name of the storage space (Bucket) |
| Enabled | Once enabled, this configuration takes effect |
| Remark | Additional notes |

Search by config name, bucket, and enabled status is supported, along with add, edit, and delete.

**Note**: Only one configuration can be in effect at any given time; when you enable a configuration, any other enabled configuration is automatically disabled.

## File List

| Item            | Content                                                   |
| --------------- | --------------------------------------------------------- |
| Search criteria | File Name                                                 |
| List columns    | File Name, Content Type, File Size, Uploaded At           |
| Upload          | Select an upload path (directory) and a file, then upload |
| Download        | Download the file to your local machine                   |
| Delete          | Delete the file                                           |

## Permissions

| Capability | Permission identifier |
| --- | --- |
| Add, edit, delete, and enable configurations | `system:oss-config:add`, `system:oss-config:edit`, `system:oss-config:delete`, `system:oss-config:enable` |
| File upload / download / delete | `system:oss-file:upload`, `system:oss-file:download`, `system:oss-file:delete` |

## Relationships with Other Modules

- **Knowledge Base**: knowledge base covers and documents uploaded to knowledge bases are both stored in object storage
- **Business attachments**: when other modules need to upload images or attachments, they all use the storage configuration here
