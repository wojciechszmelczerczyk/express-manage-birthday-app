# Manage birthday app

## Description

Simple app to manage your birthday party!

## Table of contents

- [Techstack](#techstack)
- [Requirements](#requirements)
- [To run app](#to-run-app)
  - [Clone repository](#clone-repository)
  - [Navigate to project folder](#navigate-to-project-folder)
  - [Install dependencies](#install-dependencies)
  - [Env setup](#env-setup)
  - [Setup database](#setup-database)
  - [Setup Postman environment](#setup-postman-environment)
  - [Run app](#run-app)
- [Application architecture](#application-architecture)
- [Database architecture](#database-architecture)
- [Endpoints](#endpoints)

  - [Guest endpoints](#guest-endpoints)

    - [Register](#register)
    - [Authenticate](#authenticate)
    - [Logout](#logout)
    - [Change status](#change-status)
    - [Download invitation](#download-invitation)

  - [Owner endpoints](#owner-endpoints)
    - [Get lists of guests](#get-lists-of-guests)

## Techstack

- `JavaScript`
- `Express.js`
- `PostgreSQL`

## Requirements

- install `node`
- install `postgresql`

## To run app

### Clone repository

```
git clone repo
```

### Navigate to project folder

```
cd /path/to/project
```

### Install dependencies

```
npm i
```

### Env setup

Create `.env` file and setup variables.

### Port

```
PORT=port_number
```

### Database variables

```
DB_USER=your_db_user_name
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=your_db_host
DB_PORT=your_db_port
```

### JWT variables

```
JWT_EXPIRATION_TIME=time_in_miliseconds
JWT_SECRET=arbitrary_value
```

### Birthday Party data

#### Birthday data as an env variables.

```
BIRTHDAY_DATE=yyyy:mm:dd hh:mm:ss
BIRTHDAY_PLACE=arbitrary_place
```

### Setup invitation filename in `.env`

```
FILE_NAME=invitation.txt
```

### Setup database

Login to postgresql as superuser.

In order to setup database run following script:

```sql
CREATE DATABASE birthday_party
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

#### Create table

```sql
CREATE TABLE guest (
	guest_id serial PRIMARY KEY,
	name VARCHAR ( 50 )  NOT NULL,
	surname VARCHAR ( 50 ) NOT NULL,
	uuid VARCHAR ( 50 )  NOT NULL,
  "isOwner" BOOLEAN DEFAULT FALSE,
  status VARCHAR ( 50 )  DEFAULT NULL,
	modified_status TIMESTAMP DEFAULT NULL

);
```

#### Change in database one of the user isOwner field to true in order to use admin endpoints.

```sql
UPDATE guest
SET "isOwner" = true
WHERE guest_id = 1;
```

### Setup Postman environment

Import file included in project.

### Run app

#### Use `node` cli to run project (`nodemon` recommended)

```
node app.js
```

## Application Architecture

[![](https://mermaid.ink/img/pako:eNo1zj0OgkAQBeCrTKaGC1CYQLCwM2rHUozsIERgcZg1IcDdXf-mesX38mbBylnGBG9CYwOX3AwQLi1OPGntO0iPhxLieAfrKO7ZWoaHZ5lXyIqclK40cfnpZF8lrF4GEJ58pyukGGHP0lNrw8jylga14Z4NJiFakrtBM2zB-dGS8t626gSTmrqJIySv7jwPFSYqnv8obyk83P_U9gIlREJ4)](https://mermaid.live/edit#pako:eNo1zj0OgkAQBeCrTKaGC1CYQLCwM2rHUozsIERgcZg1IcDdXf-mesX38mbBylnGBG9CYwOX3AwQLi1OPGntO0iPhxLieAfrKO7ZWoaHZ5lXyIqclK40cfnpZF8lrF4GEJ58pyukGGHP0lNrw8jylga14Z4NJiFakrtBM2zB-dGS8t626gSTmrqJIySv7jwPFSYqnv8obyk83P_U9gIlREJ4)

## Database Architecture

[![](https://mermaid.ink/img/pako:eNptUM0KgzAMfpWSs0_Q88aOO7hjYWQ2ujDbSpsyhvjuq1MPDnNJvj9IMkITLIGGpseUToxdRGe8KvVj1CVTkhmqhV2wVrVE9p3y6OhQSDn-aVo9QugJveJ0fXuKO22N5cz2iE-CktNOubErHd2gXLDcMtn75oIKHEWHbMtl45wyIE8q64Auo8X4MmD8VHx5sCh0tiwhgm6xT1QBZgn1xzegJWbaTOt3Vtf0BUnaapk)](https://mermaid.live/edit/#pako:eNptUM0KgzAMfpWSs0_Q88aOO7hjYWQ2ujDbSpsyhvjuq1MPDnNJvj9IMkITLIGGpseUToxdRGe8KvVj1CVTkhmqhV2wVrVE9p3y6OhQSDn-aVo9QugJveJ0fXuKO22N5cz2iE-CktNOubErHd2gXLDcMtn75oIKHEWHbMtl45wyIE8q64Auo8X4MmD8VHx5sCh0tiwhgm6xT1QBZgn1xzegJWbaTOt3Vtf0BUnaapk)

## Endpoints

### Guest

| Endpoint                     | Method | Authenticated | Action                   |
| :--------------------------- | :----- | :-----------: | ------------------------ |
| `/guest/register`            | POST   |       -       | Register guest           |
| `/guest/auth`                | POST   |       -       | Authenticate guest       |
| `/guest/logout`              | DELETE |      \*       | Logout guest             |
| `/guest/change-status`       | PUT    |      \*       | Change invitation status |
| `/guest/download-invitation` | GET    |      \*       | Download invitation      |

### Owner

| Endpoint                  | Method | Authenticated | Action                                |
| :------------------------ | :----- | :-----------: | ------------------------------------- |
| `/owner/list/accepted`    | GET    |      \*       | List users who accepted invitation    |
| `/owner/list/no-feedback` | GET    |      \*       | List users don't answer to invtiation |
| `/owner/list/denied`      | GET    |      \*       | List users who denied invitation      |

## Guest endpoints

## Register

### Guest input

```JSON
{
  "name": "Matthew",
  "surname": "Novak"
}

```

#### Save new guest in the database. Guest provide name and surname. Status and timestamp of status modification are null by default. UUID is random autogenerated 32-bits length string.

```javascript
// intercept guest data
const {
  name,
  surname,
  status = null,
  modified_status = null,
  uuid = uuidv4(),
} = req.body;

// add guest query
const addGuestQuery =
  "INSERT INTO guest (name, surname, status, modified_status, uuid) VALUES ($1, $2, $3, $4, $5) RETURNING *";

const queryValues = [name, surname, status, modified_status, uuid];

// add guest to database
const guest = await pool.query(addGuestQuery, queryValues);
```

#### API return uuid which user can authenticate later with.

```JSON
{
    "copy_uuid": "018ba32d-9159-12d6-a02e-88295d8ef3d2"
}
```

## Authenticate

### Guest input

```JSON
{
    "uuid":"018ba32d-9159-12d6-a02e-88295d8ef3d2"
}

```

### Authorize guest and return JWT.

```javascript
try {

    // intercept uuid
    const { uuid } = req.body;

    // authorize guest query
    const authGuestQuery = "SELECT * FROM guest WHERE uuid=$1";

    // provide query value
    const queryValues = [uuid];

    // get only guest data
    const { rows } = await pool.query(authGuestQuery, queryValues);


    const config = {
      id: rows[0].guest_id,
      name: rows[0].name,
      surname: rows[0].surname,
      isOwner: rows[0].isOwner
    };

    // create token with id and credentials
    const token = createToken(config);

    // save token in cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      expiresIn: process.env.JWT_EXPIRATION_TIME * 1000,
    });

    // return token
    res.json({ jwt: token });
  } catch (err) {
    res.json(err.message);
  }
};
```

### JWT response

```JSON
{
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6y"
}
```

## Logout

### Guest can logout.

```javascript
res.cookie("jwt", "", {
  maxAge: 1,
});
```

## Change status

### Guest input

```JSON
{
    "status":"accepted"
}
```

#### Guest have to be authorized, otherwise token verification middleware will fail.

```javascript
// intercept token from request
const token = req.headers.cookie.substring(4);

if (token) {
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      res.send("token is invalid");
    } else {
      next();
    }
  });
} else {
  res.send("token doesn't exists");
}
```

#### Guest which is autorized is able to change birthday party invitation status.

#### The date of status field modification will be held in modified_status variable which is current date.

```javascript
// intercept status
const status = req.body.status;

// intercept jwt from cookie
const token = req.headers.cookie.substring(4);

// decode token to get id of currently logged in guest
const { id } = jwt.decode(token);

// get current date
const modified_status = new Date();

// get currently logged in guest query
const currentGuestQuery = "SELECT * FROM guest WHERE guest_id=$1";

// query parameter
const queryValue = [id];

// current guest
const currentGuest = await pool.query(currentGuestQuery, queryValue);

// update currently logged in guest status
const updateGuestStatusQuery =
  "UPDATE guest SET status=$1, modified_status=$2 WHERE guest_id=$3";

// query parameters
const queryVal = [status, modified_status, currentGuest.rows[0].guest_id];

// execute query
await pool.query(updateGuestStatusQuery, queryVal);
```

#### When status update succesfully, give following response:

```JSON
{
  "status_updated_to": "accepted"
}
```

#### If status value is neither accepted or denied throw error.

```javascript
status !== "accepted" && status !== "denied";
```

#### When provided status is wrong, give following response:

```JSON
{
  "wrong_status_provided": "acceptedd"
}
```

#### If guest want to change invitation status, he has to do this not later than 5 hours before event start.

#### Otherwise status won't change. Offset indicate 5 hours in miliseconds.

```javascript
const offsetInMiliseconds = 18000000;

modified_status.getTime() >
  new Date(process.env.BIRTHDAY_DATE).getTime() - offsetInMiliseconds;
```

### When status changed later, response with both dates and error description.

```JSON
{
  "party_date": "2021-05-25 12:00:00.000",
  "your_invitation_change": "2022-03-13 12:26:02.258",
  "change_too_late": "guest changed invitation status too late"
}
```

## Download invitation

### Guest can download to file invitation which include their credentials, info about party and list of participants.

#### Current logged in guest

```javascript
// get token, extract name and surname
const token = req.headers.cookie.substring(4);
const { name, surname } = await jwt.decode(token);

const guestCredentials = {
  name,
  surname,
};
```

#### Birthday data

```javascript
const birthday = {
  birthday_date: process.env.BIRTHDAY_DATE,
  birthday_place: process.env.BIRTHDAY_PLACE,
};
```

#### Fetch guests who accepted invitation.

```javascript
// get users with accepted status
const query = "SELECT name,surname FROM guest WHERE status='accepted'";

// query
const guestsWhoAccepted = await pool.query(query);
```

#### Open stream and write all data to created file.

```javascript
// create stream
const stream = fs.createWriteStream(process.env.FILE_NAME, { flags: "a" });

stream.write("BIRTHDAY PARTY INVITATION\n\n");

// write guest info in file
stream.write("You: ");
for (prop in guestCredentials) {
  stream.write(`${guestCredentials[prop]} `);
}

// write participants in file
stream.write("\n\nAll guests: ");
guestsWhoAccepted.rows.forEach((num, i) => {
  if (i === 0) {
    stream.write("\n");
  }
  stream.write("- ");
  for (prop in num) {
    stream.write(`${num[prop]} `);
  }
  stream.write(`\n`);
});

// birthday party info
stream.write("\n\n");
stream.write("Birthday info: \n");

for (prop in birthday) {
  stream.write(birthday[prop] + "\n");
}

stream.end();
```

#### Invitation file response sample

```
BIRTHDAY PARTY INVITATION

You: Tony Kowalsky

All guests:
- Matthew Star
- Tony Kowalsky
- Josh Nas
- Matteo Wazowsky
- Wojciech Nowak


Birthday info:
2022-05-25 12:00:00.000
Las Vegas
```

## Owner endpoints

### Check if owner middleware

```javascript
const verifyOwner = (req, res, next) => {
  // intercept token from request
  const token = req.headers.cookie.substring(4);
  // if currently logged in user is admin(owner)
  const { isOwner } = jwt.decode(token);
  // give handler to next function
  if (isOwner) {
    next();
    // otherwise get an error
  } else {
    res.json({ no_admin_error: "you don't have access to owner resources" });
  }
};
```

### Owner routes contain two middelwares. One check if jwt is correct, second check privelage.

```javascript
router.get("/accepted", [requireAuth, verifyOwner], listGuestsWhoAccepted);
```

### Get lists of guests

#### Owner can check three kind of lists: guests who accepted the invitation, those who didn't gave any feedback and those who rejected invitation.

```javascript
const query =
  "SELECT name,surname, modified_status FROM guest WHERE status='denied'";
const guestsWhoDenied = await pool.query(query);
res.json(guestsWhoDenied.rows);
```

#### Guest who denied invitation response sample

```JSON
[
    {
        "name": "Julio",
        "surname": "Cesar",
        "modified_status": "2022-03-12T20:06:34.469Z"
    },
    {
        "name": "Patrycjusz",
        "surname": "Zycinski",
        "modified_status": "2022-03-12T20:11:52.074Z"
    },
    {
        "name": "Matteoo",
        "surname": "Wazowskyy",
        "modified_status": "2022-03-12T20:12:14.987Z"
    }
]
```
