# WanderLust

A server-rendered travel listing application built with Express, MongoDB, Mongoose,
and EJS. Users can browse available places, add new listings, edit or delete
listings, and share reviews with ratings.

## Project Structure

```text
app.js                  Express application and middleware setup
models/                 Mongoose schemas for listings and reviews
routes/                 Listing and review route handlers
views/                  EJS pages and shared layouts/partials
public/                 CSS and browser-side JavaScript
init/                   Database seed data and initialization scripts
utils/                  Error and async-handler utilities
schema.js               Joi request validation schemas
```

## Main Workflows

- The listings index displays all saved listings.
- The new-listing form creates a listing after Joi and Mongoose validation.
- Each listing has a detail page with its description, location, price, image,
  and reviews.
- Listings can be edited or deleted. Deleting a listing also removes its reviews.
- Reviews include a required comment and a rating from 1 to 5.
- Successful actions display Bootstrap success alerts after redirecting.
- Missing listings and other `404` errors redirect to the listings index with a
  meaningful Bootstrap error alert.

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

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Make sure MongoDB is running locally at:

   ```text
   mongodb://127.0.0.1:27017/wanderlust
   ```

3. Start the application:

   ```bash
   node app.js
   ```

4. Open `http://localhost:8080` in a browser.

## Features

- Create, edit, view, and delete listings.
- Add and delete reviews.
- Session cookies using `express-session`.
- Bootstrap success and error alerts using `connect-flash`.
- Missing listings redirect to the listings index with a meaningful error alert.
