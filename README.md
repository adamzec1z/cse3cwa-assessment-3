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

```

The previous Assessment 2 `/api/health` endpoint is also retained.

---

## Data-Driven Dashboard

Assessment 3 introduces an Activity Dashboard.

The dashboard displays database-backed information including:

- Total activities
- Total stored words
- Number of Wordle activities
- Number of Word Search activities
- Wordle page visits
- Word Search page visits
- Successful generations
- Failed generations
- Average time on page
- Most-used activity type

The dashboard also contains:

- Activity distribution reporting
- Generation success rate
- Total generation count
- Total recorded page visits
- System status indicators
- Warning messages

The dashboard data can be refreshed using the **Refresh Data** button.

---

## Usage Tracking

The application records usage information in the database.

### Generation Tracking

When a user generates a standalone activity, the application records a successful generation event.

Generation errors can also be stored as failed generation events.

This allows the dashboard to calculate:

- Total generations
- Successful generations
- Failed generations
- Generation success rate

### Page Time Tracking

The Wordle and Word Search pages use a reusable `PageTimeTracker` component.

The component records the amount of time a user spends on an activity page.

These values are stored as `PAGE_VISIT` events and are used to calculate average time on page.

---

## Alerts and Monitoring

The application includes warning indicators for unusual application states.

Examples include:

- Activities that contain no words
- Failed activity generations
- Missing saved activity data
- API or loading errors

A simulated empty activity was used to test the empty-word-list warning.

A simulated failed generation was also recorded to test generation failure reporting.

These simulated records were used to confirm that dashboard alerts and reporting work correctly.

---

## Playwright Testing

Playwright is used for automated application testing.

Two automated tests are included in the `tests` folder.

### CRUD Test

`tests/crud.spec.ts`

This test checks the backend CRUD workflow.

It:

1. Creates a temporary activity
2. Creates a word
3. Retrieves the stored words
4. Updates the word
5. Deletes the word
6. Removes the temporary activity

The test passed successfully.

### Wordle User Workflow Test

`tests/wordle.spec.ts`

This test checks a user workflow.

It:

1. Opens the Wordle page
2. Checks that the Wordle interface is visible
3. Checks that the Generate HTML button is available
4. Generates the activity
5. Confirms that `phoneme-wordle.html` is downloaded

Both Playwright tests passed successfully.

To run all Playwright tests:

```bash
npx playwright test
```

On Windows PowerShell:

```powershell
npx.cmd playwright test
```

---

## JMeter Load Testing

Apache JMeter 5.6.3 was used to test the activity API.

The endpoint tested was:

`GET /api/activities`

The test was performed using multiple simulated user levels.

| Simulated Users | Ramp-Up | Average Response Time | Error Rate | Throughput |
|---|---:|---:|---:|---:|
| 1 | 1 second | approximately 144 ms | 0.00% | approximately 6.9 requests/sec |
| 10 | 1 second | approximately 10 ms | 0.00% | approximately 11 requests/sec |
| 100 | 5 seconds | approximately 24 ms | 0.00% | approximately 99.9 requests/sec |
| 1,000 | 20 seconds | approximately 8 ms | 0.00% | approximately 50 requests/sec |
| 10,000 | 120 seconds | approximately 19 ms | 0.00% | approximately 83.3 requests/sec |

The 10,000-user test had a maximum response time of approximately 648 ms but maintained a 0% error rate.

The results show that the activity endpoint remained available across the staged load tests when an appropriate ramp-up period was used.

The JMeter test plan is included in the project as a `.jmx` file.

---

## Lighthouse Accessibility Testing

Chrome Lighthouse was used to evaluate the accessibility of the dashboard.

The dashboard achieved an accessibility score of:

**96 / 100**

Lighthouse identified one main issue:

- Some foreground and background colour combinations did not meet the recommended contrast ratio.

The score indicates that the application performs strongly in automated accessibility testing, although the remaining contrast issue could be improved further.

Accessibility features already used throughout the project include:

- Semantic headings
- Accessible navigation
- Keyboard focus indicators
- `aria-label` attributes
- `aria-live` feedback
- `role="alert"` for warning messages
- Responsive layout
- Accessible buttons and form controls

---

## Docker

The project retains the Docker implementation from Assessment 2.

The Docker configuration:

- Uses Node.js 22
- Installs required build dependencies
- Installs project packages
- Generates the Prisma client
- Applies Prisma database migrations
- Runs the Next.js application

Build the image using:

```bash
docker build -t cse3cwa-assessment-3 .
```

Run the container using:

```bash
docker run --name cse3cwa-app -p 3001:3000 cse3cwa-assessment-3
```

The application can then be accessed at:

`http://localhost:3001`

---

## Running the Project Locally

Install dependencies:

```bash
npm install
```

On Windows PowerShell:

```powershell
npm.cmd install
```

Generate the Prisma client:

```bash
npx prisma generate
```

On Windows:

```powershell
npx.cmd prisma generate
```

Apply migrations:

```bash
npx prisma migrate dev
```

Start the application:

```bash
npm run dev
```

On Windows:

```powershell
npm.cmd run dev
```

Open:

`http://localhost:3000`

---

## Project Pages

- Home — `/`
- Dashboard — `/dashboard`
- Wordle — `/wordle`
- Word Search — `/word-search`
- About — `/about`
- Settings — `/settings`
- Health Check — `/health`

---

## Validation and Error Handling

The backend validates incoming data before storing it.

Examples include:

- Required word fields
- Required phoneme information
- Valid activity IDs
- Valid activity types
- Valid usage event types
- Valid page duration values

HTTP responses include:

- `200` for successful requests
- `201` for created records
- `400` for invalid input
- `404` when related data cannot be found
- `500` for unexpected server errors

---

## Git and Version Control

Git was used throughout development.

The Assessment 3 project is stored in a separate GitHub repository so that the previous assessment submission remains unchanged.

Repository:

https://github.com/adamzec1z/cse3cwa-assessment-3

---

## AI Acknowledgement

Generative AI tools, including ChatGPT, were used during the development of this assessment.

AI assistance was used for:

- Planning implementation steps
- Explaining technical concepts
- Suggesting code structure
- Troubleshooting errors
- Developing testing approaches
- Improving documentation
- Reviewing implementation decisions

AI-generated suggestions were reviewed, tested and modified before being applied to the project.

The final application was tested using the browser, API requests, Playwright, JMeter and Lighthouse to confirm that the implemented features worked as expected.

---

## References

Apache Software Foundation. (2026). *Apache JMeter user manual*. https://jmeter.apache.org/usermanual/

Google. (2026). *Lighthouse overview*. Chrome for Developers. https://developer.chrome.com/docs/lighthouse/

Microsoft. (2026). *Playwright documentation*. https://playwright.dev/docs/intro

Next.js. (2026). *Next.js documentation*. Vercel. https://nextjs.org/docs

Prisma. (2026). *Prisma ORM documentation*. https://www.prisma.io/docs

React. (2026). *React documentation*. https://react.dev/

---

## Author

Adam Zec

CSE3CWA — Assessment 3

La Trobe University