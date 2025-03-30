## Data Modelling

For the design document, I am planning to go with the following data model.

Let me know what you think about the data model, make sure this would satisfy the requirements we have defined in the design document. Let me know if you think this can be improved/updated.


Number of tables: 3

- User
- Match
- Mapping

1. User Table:

- id
- name
- createdAt
- updatedAt

2. Match Table:

- id
- number
- team1
- team2
- result
- createdAt
- updatedAt

3. Mapping Table:

- id
- userId
- matchId
- score
- createdAt
- updatedAt

As I am a beginner to database design, I would like to know if this is a good data model for the requirements we have defined in the design document. Do not provide any code, just do analysis and suggest if this is a good data model or not.


## Entity-Relationship Diagram (ERD)

+---------------+       +----------------+       +----------------+
|     User      |       |     Match      |       |     Team       |
+---------------+       +----------------+       +----------------+
| id (PK)       |       | id (PK)        |       | id (PK)        |
| name          |       | matchNumber    |       | name           |
| createdAt     |       | date           |       | createdAt      |
| updatedAt     |<---+  | homeTeamId (FK)|------>| updatedAt      |
+---------------+    |  | awayTeamId (FK)|------>+----------------+
       |             |  | winningTeamId  |              ^
       |             |  | createdAt      |              |
       v             |  | updatedAt      |              |
+---------------+    |  +----------------+              |
|   UserScore   |    |         ^                        |
+---------------+    |         |                        |
| id (PK)       |    |         |                        |
| userId (FK)   |----+         |                        |
| matchId (FK)  |--------------|------------------------+
| score         |
| createdAt     |
| updatedAt     |
+---------------+

- PK: Primary Key
- FK: Foreign Key
- 1:N relationship shown with arrows