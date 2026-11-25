
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");

dotenv.config();

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// Session configuration
app.use(session({

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60
    }

}));


// Serve static files
app.use(express.static(path.join(__dirname, "public")));


// =====================================
// AUTHENTICATION ROUTES
// =====================================

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);


// =====================================
// PAGE ROUTES
// =====================================

// Home page
app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "index.html")
    );

});


// Registration page
app.get("/register", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "register.html")
    );

});


// Login page
app.get("/login", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "login.html")
    );

});


// =====================================
// PROTECTED DASHBOARD
// =====================================

app.get("/dashboard", (req, res) => {

    // Check if user is logged in
    if (!req.session.user) {

        return res.redirect("/login");

    }

    const user = req.session.user;

    // Escape user name before displaying it
    const safeName = String(user.fullName)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    res.send(`
        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0">

            <title>Dashboard | CarePlus24</title>

            <style>

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, Helvetica, sans-serif;
                    min-height: 100vh;

                    background:
                        radial-gradient(
                            circle at 10% 10%,
                            #b9f0f1 0,
                            transparent 30%
                        ),
                        linear-gradient(
                            135deg,
                            #e9fbfc,
                            #f6fbfc,
                            #dff7f7
                        );

                    padding: 20px;
                }

                .dashboard {
                    max-width: 900px;
                    margin: 50px auto;
                }

                .header {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(8,127,140,0.08);
                    margin-bottom: 25px;
                }

                .logo {
                    color: #087f8c;
                    font-size: 25px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }

                h1 {
                    color: #1e293b;
                    margin-bottom: 15px;
                }

                p {
                    color: #64748b;
                    line-height: 1.7;
                }

                .content {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(8,127,140,0.08);
                }

                .info-card {
                    background: #eaf8f8;
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 20px;
                }

                .logout-button {
                    background: #087f8c;
                    color: white;
                    border: none;
                    padding: 13px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 25px;
                }

                .logout-button:hover {
                    background: #066873;
                }

            </style>

        </head>

        <body>

            <div class="dashboard">

                <div class="header">

                    <div class="logo">
                        ✚ CarePlus24
                    </div>

                    <h1>Welcome, ${safeName}!</h1>

                    <p>
                        Welcome to your CarePlus24 account.
                    </p>

                </div>

                <div class="content">

                    <h2>Dashboard</h2>

                    <p>
                        Your login was successful.
                        This is your temporary patient dashboard.
                    </p>

                    <div class="info-card">

                        <p>
                            <strong>Account:</strong>
                            ${safeName}
                        </p>

                        <p>
                            <strong>Role:</strong>
                            ${user.role}
                        </p>

                    </div>

                    <button class="logout-button" onclick="logout()">
                        Logout
                    </button>

                </div>

            </div>

            <script>

                async function logout() {

                    try {

                        const response = await fetch(
                            "/api/auth/logout",
                            {
                                method: "POST"
                            }
                        );

                        if (response.ok) {

                            window.location.href = "/login";

                        }

                    } catch (error) {

                        alert("Unable to logout.");

                    }

                }

            </script>

        </body>

        </html>
    `);

});


// =====================================
// SERVER
// =====================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {

    console.log(
        `CarePlus24 server running at http://localhost:${PORT}`
    );

});
