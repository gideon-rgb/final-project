import jwt from 'jsonwebtoken'

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {

        // Get the token from the request header
        const {atoken} = req.headers
        if (!atoken) {  
            return res.status(401).json({ success: false, message: "Not Authorized login Again" });
        }
        const token_decode = jwt.verify(atoken,process.env.JWT_SECRET)
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: "Not Authorized login Again" });
        }
        
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message:error.message });
    }
}

export default authAdmin;