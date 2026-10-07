# CSE3CWA Assessment 3 — Data-Driven Application and Reporting

## Phoneme Activity Builder

This project is the third stage of the CSE3CWA Phoneme Activity Builder project.

Assessment 1 focused on the frontend design and usability of the Wordle and Word Search activities.

Assessment 2 extended the application by adding a backend API, SQLite database, Prisma ORM, CRUD operations, validation, Docker support and database-driven activity generation.

Assessment 3 extends the same application further by adding data reporting, operational monitoring, usage tracking, alerts, automated testing, load testing and accessibility evaluation.

GitHub Repository:

https://github.com/adamzec1z/cse3cwa-assessment-3

---

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Playwright
- Apache JMeter
- Chrome Lighthouse
- Docker
- Git and GitHub

---

## Main Features

The application contains two phoneme-based classroom activities:

- Phoneme Wordle
- Phoneme Word Search

Both activities retrieve their words and settings from the SQLite database.

Teachers can configure activities using stored information such as:

- English words
- Phoneme sequences
- Activity type
- Difficulty
- Hint settings
- Output settings

The application can also generate standalone HTML versions of the activities.

---

## Database

The project uses SQLite with Prisma ORM.

The main database models are:

### Activity

Stores activity information including:

- Activity name
- Activity type
- Difficulty
- Hint settings
- Output settings
- Related words
- Creation and update timestamps

### Word

Stores:

- English word
- Phoneme sequence
- Related activity ID
- Creation and update timestamps

### UsageEvent

Assessment 3 adds the `UsageEvent` model.

This records operational information such as:

- Activity type
- Event type
- Page visit duration
- Generation failures
- Error messages
- Event timestamp

This information is used by the dashboard for reporting and monitoring.

---

## API Routes

The project uses Next.js API routes.

### Activities

`GET /api/activities`

Retrieves saved activities and their related words.

`POST /api/activities`

Creates a new activity.

`PUT /api/activities/[id]`

Updates an activity.

`DELETE /api/activities/[id]`

Deletes an activity.

### Words

`GET /api/words`

Retrieves stored words.

`POST /api/words`

Creates a word and links it to an activity.

`PUT /api/words/[id]`

Updates an existing word.

`DELETE /api/words/[id]`

Deletes a word.

### Usage Tracking

`POST /api/usage`

Records operational events including:

- `GENERATION_SUCCESS`
- `GENERATION_FAILED`
- `PAGE_VISIT`

### Dashboard

`GET /api/dashboard`

Calculates and returns statistics used by the dashboard.

### Health Check

`GET /health`

Returns a `200 OK` response when the application is running.

Example response:

```json
{
  "status": "ok",
  "message": "Application is healthy"
}