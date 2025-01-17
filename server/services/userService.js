const userModel= require('../models/userModel')
const mailService = require('../services/mailService')
const tokenService = require('../services/tokenService')
const UserDto=require('../dtos/userDto')
const uuid= require('uuid')
const bcrypt= require('bcrypt')
const ApiError=require('../exceptions/api-error')

class userService{
    async registration(email, password){
        const candidate=await userModel.findOne({email})
        if(candidate){
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }

        const activationLink = uuid.v4()
        const hashPassword= await bcrypt.hash(password, 3)

        const user = await userModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationLink(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto=new UserDto(user)
        const tokens = await tokenService.generateToken({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return{...tokens, user:userDto}
    }

    async activate(activationLink){
        const user = await userModel.findOne({activationLink})
        if(!user){
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated=true
        await user.save()
    }

    async login(email, password){
        const user=await userModel.findOne({email});
        if(!user){
            throw new ApiError.BadRequest('пользователь с таким эмайлом не найден')
        }
        const passEqual=await bcrypt.compare(password,user.password)
        if(!passEqual){
            throw new ApiError.BadRequest('не правильный пароль')
        }

        const userDto=new UserDto(user)
        const tokens=await tokenService.generateToken({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return{...tokens, user:userDto}
    }

    async logout(refreshToken){
        const token=await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError()
        }
        const userData= await tokenService.validateRefreshToken(refreshToken)
        const tokenData= await tokenService.findToken(refreshToken)

        if(!userData || !tokenData){
            throw ApiError.UnauthorizedError()
        }

        const user = await userModel.findById(userData.id)
        const userDto=new UserDto(user)
        const tokens=await tokenService.generateToken({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return{...tokens, user:userDto}
    }

    async getUsers(){
        const users=await userModel.find()
        return users
    }
}

module.exports=new userService()