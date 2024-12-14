import jwt from 'jsonwebtoken'

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {

        // Get the token from the request header
        const {dtoken, dToken} = req.headers
        if (!dtoken) {  
            console.log('dtoken:',dtoken,"dToken:",dToken)
            return res.status(401).json({ success: false, message: "Not Authorized login Again" });
        }
        const token_decode = jwt.verify(dtoken,process.env.JWT_SECRET)
        
        req.body.docId = token_decode.id
        
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message:error.message });
    }
}

export default authDoctor;