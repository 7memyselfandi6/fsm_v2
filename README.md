# Farmer Requirement Management API

Production-grade RESTful API for managing farmer fertilizer and crop requirements with strict data integrity and transactional safety.

## 🚀 Features
- **Transactional Safety**: All creation and update operations are wrapped in database transactions.
- **Strict Data Contract**: Input and output JSON strictly follow the defined schema.
- **Master Data Validation**: Automatic verification of `fertilizerTypeId` and `cropTypeId` against master tables.
- **Concurrency Control**: `PUT` operations use `SERIALIZABLE` isolation level and `SELECT ... FOR UPDATE` row locking.
- **Full CRUD**: Support for Create, Read (List/Single), Update, and Delete.
- **CI/CD Ready**: Includes GitHub Actions workflow for linting and testing.

## 🛠 Tech Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Jest & Supertest
- **Documentation**: OpenAPI 3.1 (Swagger)

## 📖 API Documentation
The API documentation is available in OpenAPI 3.1 format:
- File: `docs/requirement-api.yaml`
- Base URL: `/api/requirements`

### Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/requirements` | Create a new requirement |
| `GET` | `/api/requirements` | List requirements (paginated) |
| `GET` | `/api/requirements/:id` | Get requirement by uniqueFarmerId |
| `PUT` | `/api/requirements/:id` | Update requirement (Full replace) |
| `DELETE` | `/api/requirements/:id` | Cascade delete requirement |

## 🧪 Testing
### Unit Tests
Tests the service layer logic with mocked database calls.
```bash
npm test tests/unit/requirement.service.test.ts
```

### Integration Tests
Tests the full request lifecycle against a real database.
```bash
npm test tests/integration/requirement.api.test.ts
```

## 📦 Deliverables
- **Postman Collection**: `FMS_Requirement_API.json`
- **OpenAPI Docs**: `docs/requirement-api.yaml`
- **CI Config**: `.github/workflows/ci.yml`
