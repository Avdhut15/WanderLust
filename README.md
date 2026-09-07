# WanderLust

A server-rendered travel listing application built with Express, MongoDB, Mongoose,
and EJS. Users can browse, search, and filter stays, add new listings, manage
their own listings, and share reviews with ratings.

## Project Structure

```text
app.js                  Express application and middleware setup
controllers/            MVC controllers for listings, reviews, and users
models/                 Mongoose schemas for listings, reviews, and users
routes/                 Resource routing and middleware composition
middleware.js           Authentication, authorization, and request validation
views/                  EJS pages and shared layouts/partials
public/                 CSS and browser-side JavaScript
init/                   Database seed data and initialization scripts
utils/                  Error and async-handler utilities
schema.js               Joi request validation schemas
```

## Main Workflows

- The listings index displays all saved listings.
- Navbar search matches destinations, listing text, and category names.
- Category filters include Trending, Rooms, Iconic Cities, Mountains, Castles,
  Amazing Pools, Camping, Farms, Arctic, Domes, and Boats.
- The tax switch displays nightly prices including 18% tax.
- The new-listing form creates a listing after Joi and Mongoose validation.
- New listings accept JPEG, PNG, WEBP, and GIF uploads up to 5 MB through Multer
  before sending them to Cloudinary.
  | `GET` | `/signup` | Show the signup form |
  | `POST` | `/signup` | Create an account |
  | `GET` | `/login` | Show the login form |
  | `POST` | `/login` | Authenticate a user |
  | `POST` | `/logout` | End the current session |
- Listing images are uploaded to Cloudinary and MongoDB stores their secure URL and public ID.
- Each listing has a detail page with its description, location, price, image,
  and reviews.
- Listings can be edited or deleted. Deleting a listing also removes its reviews.
- Reviews include a required comment and a rating from 1 to 5.
- Successful actions display Bootstrap success alerts after redirecting.
- Missing listings and other `404` errors render a clear error page without
  leaving stale messages in the next session.

## Routes

| Method   | Path                              | Purpose                          |
| -------- | --------------------------------- | -------------------------------- |
| `GET`    | `/listings`                       | View all listings                |
| `GET`    | `/listings/new`                   | Show the create-listing form     |
| `POST`   | `/listings`                       | Create a listing                 |
| `GET`    | `/listings/:id`                   | View one listing and its reviews |
| `GET`    | `/listings/:id/edit`              | Show the edit form               |
| `PUT`    | `/listings/:id`                   | Update a listing                 |
| `DELETE` | `/listings/:id`                   | Delete a listing and its reviews |
| `POST`   | `/listings/:id/reviews`           | Add a review                     |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete a review                  |

## Technologies

- Node.js and Express
- MongoDB and Mongoose
- EJS and EJS-Mate layouts
- Joi validation
- Bootstrap for responsive styling and alerts
- Express Session and Connect Flash for cookies and messages
- MongoDB-backed session storage through Connect Mongo
- Helmet for HTTP security headers
- Express Rate Limit for authentication endpoints
- CSRF Sync for state-changing form protection

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example`:

   ```text
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   Use a long random value for `SESSION_SECRET`. In production, the application
   refuses to start if this value is missing.

3. Make sure MongoDB is running locally at:

   ```text
   mongodb://127.0.0.1:27017/wanderlust
   ```

4. Start the application:

   ```bash
   node app.js
   ```

   For development with automatic restarts, run `nodemon app.js` if Nodemon is
   installed globally.

5. Open `http://localhost:8080` in a browser.

## Features

- Create, edit, view, and delete listings.
- Add and delete reviews.
- Session cookies using `express-session`.
- Bootstrap success and error alerts using `connect-flash`.
- Missing listings redirect to the listings index with a meaningful error alert.

## Database Seeding

The seed data includes categorized sample listings. To rebuild the local listings
collection from the seed file, run:

```bash
node init/index.js
```

This command deletes existing listings before inserting the seed data. Use it only
when resetting a development database.

## Security

- Session cookies use `httpOnly`, `sameSite=lax`, and `secure` in production.
- Production startup requires `SESSION_SECRET`.
- Helmet adds security-related HTTP response headers.
- Login and signup requests are rate limited.
- All state-changing forms require a session-backed CSRF token.
- Listing mutations require authentication and owner authorization.
- Review deletion checks both listing membership and review ownership.
- Uploads are limited by size and MIME type before Cloudinary processing.
- Redirect targets are restricted to safe local application paths.

Run the production dependency audit with:

```bash
npm audit --omit=dev
```
