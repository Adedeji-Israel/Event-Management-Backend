const UserCollection = require('../models/user');

// GET ALL USER
const getAllUsers = async (req, res) => {
    try {
        const users = await UserCollection.find();
        if (!users) {
            return res.status(400).json({
                status: 'error',
                message: "No user found!"
            })
        }

        if (users.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: "No user exist! Create new user to get started"
            })
        }

        return res.status(200).json({
            status: "success",
            message: "users fetched successfully!",
            count: users.length,
            users
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: `server error: ${error.message}`
        })
    }
};

// GET SINGLE USER
const getSingleUser = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await UserCollection.findById(userId);

        if (!user) {
            return res.status(400).json({
                status: 'error', 
                message: `No user with this ID: ${userId} found! use a valid user ID` 
            })
        }
        return res.status(200).json({
            status: "success",
            message: "User fetched successfully!",
            user
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: `server error: ${error.message}` 
        })
    }
};

// DELETE SINGLE USER 
const deleteSingleUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const deletedUser = await UserCollection.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                status: "error",
                message: `No user found with ID: ${userId}, deletion failed.`
            });
        }

        return res.status(200).json({
            status: "success",
            message: `User with ID: ${userId} deleted successfully!`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: `Server error: ${error.message}`
        });
    }
};

// DELETE ALL USER 
const deleteAllUsers = async (req, res) => {

    try {
        const deleteResult = await UserCollection.deleteMany();

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "No users found to be deleted."
            });
        }

        return res.status(200).json({
            status: "success",
            message: `${deleteResult.deletedCount} users deleted successfully!`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: `Server error: ${error.message}`
        });
    }
};

module.exports = {
    getAllUsers,
    getSingleUser,
    deleteSingleUser,
    deleteAllUsers
}
