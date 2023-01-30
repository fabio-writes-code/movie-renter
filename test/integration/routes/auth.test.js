const { User } = require("../../../models/users");
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

describe('api/auth/', () => {
    let server, email, password, user

    const exec =()=>{
        return request(server)
            .post('/api/auth')
            .send({email, password})
    }

    beforeEach(async ()=> {
        server=require('../../../index');

        const salt=await bcrypt.genSalt(10)
        password= await bcrypt.hash('1234',salt)

        user = new User({
            name:'User1',
            email:'user1@uniqueemail.com',
            password: password
        })

        await user.save()

    })
    afterEach(async()=>{
        await User.remove({})
        await server.close()
    })

    it('should return 400 if email is not valid', async () => {
        email='123'
        const res=await exec();
        expect(res.status).toBe(400)
    });

    it('should return 400 if password is not valid', async () => {
        password=''
        const res=await exec();
        expect(res.status).toBe(400)
    });
    
    it('should return 400 if cx not registered', async () => {
        email='sampleemail@email.com'
        const res= await exec()
        expect(res.status).toBe(401)
        // expect(res.body).toHaveProperty('x-auth-token')
    });

    it('should return 403 on incorrect password', async () => {
        email=user.email
        password='12345'
        const res=await exec();
        expect(res.status).toBe(403)
    });

    it('should return 200 for successful login', async () => {
        email=user.email
        password='1234'
        const res=await exec();
        expect(res.status).toBe(200)
    });
});