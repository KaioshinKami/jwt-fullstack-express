const userService=require('../services/userService')
const {validationResult}=require('express-validator')
const ApiError=require('../exceptions/api-error')

class userController{
    async registration(req, res, next){
        try {
            const errors=validationResult(req)
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }

            const {email, password} = req.body
            const userData= await userService.registration(email, password)

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly:true})
            return res.json(userData)
        }
        catch (e) {
            next(e)
        }
    }

    async login(req, res, next){
        const {email, password}=req.body
        await userService.login(email, password)

        const userData=await userService.login(email, password)
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly:true})
        return res.json(userData)
    }

    async logout(req, res, next){
       try {
           const {refreshToken}=req.cookies
           const token=await userService.logout(refreshToken)
           res.cookie('refreshToken')
           return res.json(token)
       }
       catch (e) {
           next(e)
       }
    }

    async activate(req, res, next){
        try {
            const activationLink=req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        }
        catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next){
        try {
            const {refreshToken}=req.cookies
            const userData=await userService.refresh(refreshToken)

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        }
        catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next){
        try {
            const users=await userService.getUsers()
            return res.json(users)
        }
        catch (e) {
            next(e)
        }
    }
}

module.exports=new userController()