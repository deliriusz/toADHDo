# REST API Plan

## 1. Resources

- **Task**: Maps to the `task` table. Contains fields such as:
  - `id` (integer, primary key)
  - `user_id` (UUID, foreign key to user)
  - `priority` (BIGINT)
  - `category` (ENUM: 'A', 'B', 'C')
  - `task_source` (ENUM: 'full-ai', 'edited-ai', 'edited-user')
  - `description` (VARCHAR(2000))
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `completed_at` (TIMESTAMPTZ, nullable)

- **User Context**: Maps to the `user_context` table. Contains:
  - `user_id` (UUID, primary key and foreign key to user)
  - `context_data` (VARCHAR(5000))

- **Processing Log**: Maps to the `processing_log` table. Contains:
  - `id` (integer, primary key)
  - `task_id` (integer, foreign key to task)
  - `user_id` (UUID, foreign key to user)
  - `processing_time` (BIGINT in milliseconds)
  - `status` (TEXT)
  - `error_message` (TEXT, optional)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

## 2. Endpoints

### Task Endpoints

1. **GET /api/tasks**
   - **Description**: Retrieve a paginated list of tasks for the authenticated user.
   - **Query Parameters**:
     - `page` (number): Page number
     - `limit` (number): Number of tasks per page
     - `sort_by` (string): Field to sort by (e.g. `created_at`, `priority`)
     - `order` (string): Sort order (`asc` or `desc`)
     - `filter[category]` (optional): Filter by task category
     - `filter[completed]` (optional): Filter by completion status
   - **Response**: JSON array of task objects with pagination metadata
   - **Success**: 200 OK
   - **Errors**: 400 Bad Request, 401 Unauthorized

2. **POST /api/tasks**
   - **Description**: Create a new task.
   - **Request Payload**:
     ```json
     {
       "priority": 1,
       "category": "A",
       "task_source": "full-ai",
       "description": "Task description..."
     }
     ```
   - **Response**: The newly created task object with all fields
   - **Success**: 201 Created
   - **Errors**: 400 Bad Request (for invalid input), 401 Unauthorized

3. **GET /api/tasks/{id}**
   - **Description**: Retrieve details of a specific task.
   - **URL Parameter**:
     - `id`: Identifier of the task
   - **Response**: Task object
   - **Success**: 200 OK
   - **Errors**: 404 Not Found, 401 Unauthorized

4. **PATCH /api/tasks/{id}**
   - **Description**: Update a specific task. Allowed updates include `priority`, `category`, `task_source`, `description`, and `completed_at`.
   - **Request Payload** (all fields optional):
     ```json
     {
       "priority": 2,
       "category": "B",
       "task_source": "edited-ai",
       "description": "Updated description...",
       "completed_at": "2023-10-21T15:00:00Z"
     }
     ```
   - **Response**: The updated task object
   - **Success**: 200 OK
   - **Errors**: 400 Bad Request, 404 Not Found, 401 Unauthorized

5. **DELETE /api/tasks/{id}**
   - **Description**: Delete a specific task.
   - **Response**: No content with a confirmation message
   - **Success**: 204 No Content
   - **Errors**: 404 Not Found, 401 Unauthorized

### User Context Endpoints

1. **GET /api/user-context**
   - **Description**: Retrieve the user context for the authenticated user.
   - **Response**: JSON object containing `user_id` and `context_data`
   - **Success**: 200 OK
   - **Errors**: 401 Unauthorized

2. **PUT /api/user-context**
   - **Description**: Create or update the user context for the authenticated user.
   - **Request Payload**:
     ```json
     {
       "context_data": "Detailed context information..."
     }
     ```
   - **Response**: The updated or newly created user context object
   - **Success**: 200 OK (update) or 201 Created (creation)
   - **Errors**: 400 Bad Request, 401 Unauthorized

### Processing Log Endpoints

1. **GET /api/processing-logs**
   - **Description**: Retrieve processing logs. Admins and developers can view all logs; standard users will see only their logs.
   - **Query Parameters**:
     - `page` (number): Pagination number
     - `limit` (number): Logs per page
     - `filter[task_id]` (optional): Filter logs by task id
     - `filter[user_id]` (optional): Filter logs by user id
   - **Response**: JSON array of processing log objects with pagination metadata
   - **Success**: 200 OK
   - **Errors**: 400 Bad Request, 401 Unauthorized, 403 Forbidden (if access is denied)

2. **POST /api/ai/generate-description**
   - **Description**: Use AI agent to to generate task desription based on user provided initial task description and user preferences. It first adds new processing log to the database. Then it reaches AI agent API to generate task description based on user task description and user preferences.
   - **Request Payload**:
     ```json
     {
       "description": "User provided task description..."
     }
     ```
   - **Response**: JSON with single element `generatedDescription`, containing description generated by the AI agent.
   - **Success**: 200 OK
   - **Errors**: 400 Bad Request, 401 Unauthorized, 403 Forbidden (if access is denied)
   - **Mock**: Currently AI agent integration is out of scope. AI agent response should be mocked with default `This is AI agent mock response`. Everything else should work as expected.

## 3. Authentication and Authorization

- The API will use token-based authentication (e.g. JWT) to secure endpoints.
- Every request must include an `Authorization` header containing a valid token.
- The token is used to set the backend context (e.g. `app.current_user_id` and `app.current_user_role`).
- Database Row-Level Security (RLS) is utilized to ensure users only access their own data, as defined in the database schema policies.

## 4. Validation and Business Logic

- **Validation Rules**:
  - **Task Endpoints**:
    - `priority` must be a valid number.
    - `category` must be one of the ENUM values: 'A', 'B', or 'C'.
    - `task_source` must be one of: 'full-ai', 'edited-ai', or 'edited-user'.
    - `description` should not exceed 2000 characters.
  - **User Context**:
    - `context_data` is required and must not exceed 5000 characters.
  - **Processing Log**:
    - `processing_time` must be non-negative.
    - `status` is required.

- **Business Logic Implementation**:
  - On creation or update of a task, a corresponding processing log entry should be generated to capture the operation details.
  - Tasks may be marked as completed by setting the `completed_at` timestamp.
  - List endpoints must support pagination, filtering, and sorting to efficiently handle large datasets.
  - Error responses should provide clear messages along with appropriate HTTP status codes (e.g. 400, 401, 404, 403).