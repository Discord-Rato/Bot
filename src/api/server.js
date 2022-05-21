require("colors");
const bodyParser = require("body-parser");
const cookies = require("cookies");
const express = require("express");
const methodOverride = require("method-override");
const middleware = require("./modules/performance/middleware");

const app = express();
const rootRoutes = require("./routes/root-routes");
const authRoutes = require("./routes/auth-routes");

app.set("view engine", "ejs");
app.set(`views`, __dirname + "/views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookies.express("a", "b", "c"));

app.use("/", middleware.updateUser, rootRoutes, authRoutes);

app.all("*", (req, res) =>
    res
        .status(404)
        .send(
            `Sorry, but it seems like the page you we're looking for doesnt exists.\n\nMake sure you've typed the address correctly or this page your looking for may have been moved to a different address.`
        )
);

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log("----------------------------------------".grey);
    console.log(
        `[API] - Server has launched on http://localhost:${port}.`.green
    );
    console.log("----------------------------------------".grey);
});
