# Knowledge Base & AI Chat

## Feature Overview

A knowledge base is used to accumulate enterprise documents: after a document is uploaded, it goes through **parsing** and **vectorization**, and can then serve as a knowledge source for AI Chat. The system provides knowledge base management, document management, and an AI Chat window in the top bar.

## Knowledge Base Management

Knowledge bases are displayed as cards (cover, name, description, Created At), with search by knowledge base name and paged browsing.

| Operation | Description |
| --- | --- |
| Create knowledge base | Fill in the knowledge base name (required, up to 100 characters) and description (up to 500 characters); a cover can be uploaded |
| Edit | Modify the name, description, and cover |
| Delete | Delete the knowledge base |
| View documents | Click a card to open the drawer on the right and manage the documents under that knowledge base |

## Document Management

Documents are maintained in the knowledge base drawer:

| Item | Content |
| --- | --- |
| Search criteria | Document Name |
| List columns | Document Name, Document Type, Parse Status, Vector Status, Uploaded At, Uploaded By |
| Upload document | Supports pdf, doc, docx, txt, md, xls, xlsx, ppt, pptx, wps and other formats |
| Parse Document | Trigger parsing of the document content; once parsing is complete, the content can be viewed and edited |
| Edit Content | View and modify the parsed content in Markdown (parsing must be complete) |
| Process Vector | Vectorize the document content to serve as a knowledge source for AI Chat (parsing must be completed first) |
| Delete | Delete the document |

Document processing flow: **Upload → Parse → Process Vector → Join AI Chat**. Both the parse status and the vector status are shown in the list (Pending, Processing, Completed, Failed).

## AI Chat

Entry: the chat icon on the right side of the top bar. Capabilities include:

| Capability | Description |
| --- | --- |
| Smart conversation | After a question is entered, the answer is returned character by character in a streaming manner |
| Knowledge base Q&A | A knowledge base can be selected before asking, so that the answer is based on the content of the specified knowledge base |
| Conversation history | Historical sessions are retained and can be switched between |
| Rename / delete conversation | Manage your own historical sessions |

**Tip**: AI Chat requires the backend to have integrated an AI service; if no knowledge base is selected, the AI service answers based on its general capabilities.
