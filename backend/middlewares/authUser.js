import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
    try {

        // Get the token from the request header
        const {token} = req.headers
        if (!token) {  
            return res.status(401).json({ success: false, message: "Not Authorized login Again" });
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)
        
        req.body.userId = token_decode.id
        
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message:error.message });
    }
}

export default authUser;