require("colors");
const bodyParser = require("body-parser");
const cookies = require("cookies");
const express = require("express");
const methodOverride = require("method-override");
const middleware = require("./modules/performance/middleware");

const dashboardRoutes = require("./routes/dashboard-routes");
const rootRoutes = require("./routes/root-routes");
const authRoutes = require("./routes/auth-routes");
const discoveryRoutes = require("./routes/discovery-routes");

const app = express();

app.set("view engine", "ejs");
app.set(`views`, __dirname + "/views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookies.express("a", "b", "c"));

app.use(express.static(`${__dirname}/assets`));
app.locals.basedir = `${__dirname}/assets`;

app.use(`/discovery`,
    middleware.updateUser, discoveryRoutes
)

app.use("/",
    middleware.updateUser, rootRoutes,
    authRoutes,
    middleware.validateUser, middleware.updateGuilds, dashboardRoutes
);

app.all('*', (req, res) => res.render('errors/404'));

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log("----------------------------------------".grey);
    console.log(
        `[API] - Server has launched on http://localhost:${port}.`.green
    );
    console.log("----------------------------------------".grey);
});
