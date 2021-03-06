const express = require("express");

const app = express();

// routes
const register = require("./routes/auth/register");
const auth = require("./routes/auth/auth");
const logout = require("./routes/auth/logout");

const changeStatus = require("./routes/changeStatus");
const downloadInvitation = require("./routes/downloadInvitation");

const listGuests = require("./routes/admin/listGuests");

const port = process.env.PORT || 3000;

app.use("/guest", register);
app.use("/guest", auth);
app.use("/guest", logout);
app.use("/guest", changeStatus);
app.use("/guest", downloadInvitation);

app.use("/owner/list", listGuests);

app.listen(port, () => console.log(`Server listening on port:${port}`));
