# Manage birthday app

## Description

Simple app to manage your birthday party!

## Techstack

- `JavaScript`
- `Express.js`
- `PostgreSQL`

## Env setup

### Create `.env` file and setup variables.

#### Port

```
PORT=port_number
```

#### Database variables

```
DB_USER=your_db_user_name
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=your_db_host
DB_PORT=your_db_port
```

#### JWT variables

```
JWT_EXPIRATION_TIME=time_in_miliseconds
JWT_SECRET=arbitrary_value
```

### Requirements

- install `node`
- install `postgresql`

## Application Architecture

[![](https://mermaid.ink/img/pako:eNo1zj0OgkAQBeCrTKaGC1CYQLCwM2rHUozsIERgcZg1IcDdXf-mesX38mbBylnGBG9CYwOX3AwQLi1OPGntO0iPhxLieAfrKO7ZWoaHZ5lXyIqclK40cfnpZF8lrF4GEJ58pyukGGHP0lNrw8jylga14Z4NJiFakrtBM2zB-dGS8t626gSTmrqJIySv7jwPFSYqnv8obyk83P_U9gIlREJ4)](https://mermaid.live/edit#pako:eNo1zj0OgkAQBeCrTKaGC1CYQLCwM2rHUozsIERgcZg1IcDdXf-mesX38mbBylnGBG9CYwOX3AwQLi1OPGntO0iPhxLieAfrKO7ZWoaHZ5lXyIqclK40cfnpZF8lrF4GEJ58pyukGGHP0lNrw8jylga14Z4NJiFakrtBM2zB-dGS8t626gSTmrqJIySv7jwPFSYqnv8obyk83P_U9gIlREJ4)

## Database Architecture

[![](https://mermaid.ink/img/pako:eNptkMEKwzAIhl8leN4T5LyxB-iOgSGN7WRNUhI9jNJ3X7q2g416Uf__E8UJ2uQJLLQDlnJm7DMGF02Nj2KuSkWW1qzq2lvTSObYm4iBDo2i-c_7Wqrsj_QiKFp-nBuHmjGMJiTPHZO_7xScIFAOyL5ePy1TDuRBdSXYWnrMTwcuzpXT0aPQxbOkDLbDodAJUCU1r9iClay0Q9sHNmp-A0AsYQY)](https://mermaid.live/edit/#pako:eNptkMEKwzAIhl8leN4T5LyxB-iOgSGN7WRNUhI9jNJ3X7q2g416Uf__E8UJ2uQJLLQDlnJm7DMGF02Nj2KuSkWW1qzq2lvTSObYm4iBDo2i-c_7Wqrsj_QiKFp-nBuHmjGMJiTPHZO_7xScIFAOyL5ePy1TDuRBdSXYWnrMTwcuzpXT0aPQxbOkDLbDodAJUCU1r9iClay0Q9sHNmp-A0AsYQY)

## Endpoints

### Guest

| Endpoint                     | Method | Authenticated | Action                   |
| :--------------------------- | :----- | :-----------: | ------------------------ |
| `/guest/register`            | POST   |       -       | Register guest           |
| `/guest/auth`                | POST   |       -       | Authenticate guest       |
| `/guest/change-status`       | PUT    |      \*       | Change invitation status |
| `/guest/download-invitation` | GET    |      \*       | Download invitation      |

### Owner

| Endpoint                           | Method | Authenticated | Action                             |
| :--------------------------------- | :----- | :-----------: | ---------------------------------- |
| `/owner/list/accepted`             | GET    |      \*       | List users who accepted invitation |
| `/owner/list/denied`               | GET    |      \*       | List users who denied invtiation   |
| `/owner/list/accepted-then-denied` | GET    |      \*       | List users who change their mind   |

## Register

### Save new guest in the database. Guest provide name and surname.

```javascript
// intercept guest data
const { name, surname, status, modified_status } = req.body;

// add guest query
const addGuestQuery =
  "INSERT INTO guest (name, surname, status, modified_status) VALUES ($1, $2, $3, $4) RETURNING *";

const queryValues = [name, surname, status, modified_status];

// add guest to database
const guest = await pool.query(addGuestQuery, queryValues);
```

### API return uuid with which user can authenticate later.

```JSON
{
    "copy_uuid": "018ba32d-9159-12d6-a02e-88295d8ef3d2"
}
```

## Authenticate

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

    // create token with id and credentials
    const token = createToken(rows[0].guest_id);

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

## Change status

### Guest have to be authorized, otherwise token verification middleware will fail.

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

### Guest which is autorized is able to change birthday party invitation status.

```javascript
// intercept status
const status = req.body.status;

// intercept jwt from cookie
const token = req.headers.cookie.substring(4);

// decode token to get id of currently logged in guest
const { id } = jwt.decode(token);

// get currently logged in guest query
const currentGuestQuery = "SELECT * FROM guest WHERE guest_id=$1";

// query parameter
const queryValue = [id];

// current guest
const currentGuest = await pool.query(currentGuestQuery, queryValue);

// update currently logged in guest status
const updateGuestStatusQuery = "UPDATE guest SET status=$1 WHERE guest_id=$2";

// query parameters
const queryVal = [status, currentGuest.rows[0].guest_id];

const updatedStatus = await pool.query(updateGuestStatusQuery, queryVal);
```
