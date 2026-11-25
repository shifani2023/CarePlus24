
const db = require("../config/database");
const bcrypt = require("bcrypt");

// =====================================
// PATIENT REGISTRATION
// =====================================

async function registerPatient(req, res) {

    const {
        fullName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        password
    } = req.body;

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Check if email already exists
        const [existingUsers] = await connection.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {

            await connection.rollback();

            return res.status(409).json({
                message: "An account with this email already exists."
            });

        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user account
        const [userResult] = await connection.execute(
            `INSERT INTO users
            (full_name, email, password_hash, role)
            VALUES (?, ?, ?, 'patient')`,
            [fullName, email, passwordHash]
        );

        const userId = userResult.insertId;

        // Create patient profile
        await connection.execute(
            `INSERT INTO patients
            (user_id, phone, date_of_birth, gender, address)
            VALUES (?, ?, ?, ?, ?)`,
            [
                userId,
                phone || null,
                dateOfBirth || null,
                gender || null,
                address || null
            ]
        );

        await connection.commit();

        return res.status(201).json({
            message: "Registration successful! You can now login."
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Registration error:", error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                message: "This email address is already registered."
            });

        }

        return res.status(500).json({
            message: "Registration failed. Please try again."
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }

}


// =====================================
// LOGIN
// =====================================

async function loginUser(req, res) {

    const { email, password } = req.body;

    try {

        const [users] = await db.execute(
            `SELECT
                user_id,
                full_name,
                email,
                password_hash,
                role,
                status
            FROM users
            WHERE email = ?`,
            [email]
        );

        // Account does not exist
        if (users.length === 0) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        const user = users[0];

        // Check account status
        if (user.status && user.status !== "active") {

            return res.status(403).json({
                message: "Your account is inactive. Please contact support."
            });

        }

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        // Regenerate session after successful login
        req.session.regenerate(function(error) {

            if (error) {

                console.error("Session error:", error);

                return res.status(500).json({
                    message: "Login failed. Please try again."
                });

            }

            // Save user in session
            req.session.user = {
                userId: user.user_id,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            };

            req.session.save(function(saveError) {

                if (saveError) {

                    console.error("Session save error:", saveError);

                    return res.status(500).json({
                        message: "Login failed. Please try again."
                    });

                }

                return res.status(200).json({
                    message: "Login successful!"
                });

            });

        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });

    }

}


// =====================================
// LOGOUT
// =====================================

function logoutUser(req, res) {

    req.session.destroy(function(error) {

        if (error) {

            console.error("Logout error:", error);

            return res.status(500).json({
                message: "Logout failed."
            });

        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
            message: "Logout successful."
        });

    });

}


module.exports = {
    registerPatient,
    loginUser,
    logoutUser
};
