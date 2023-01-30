const request=require('supertest')
const {Rental}=require('../../../models/rentals')
const mongoose=require('mongoose');
const { User } = require('../../../models/users');
const { Movie } = require('../../../models/movies');
const { Customer } = require('../../../models/customer');

describe('/api/rentals', () => {
    let server, rental,token,movie, customer

    beforeEach(async()=>{
        server =require('../../../index')

        token=new User().generateAuthToken()

        movie=new Movie({
            title:'123',
            genre:{name:'12345'},
            dailyRentalRate:2,
            numberInStock:10
        })

        customer= new Customer({
            name:'12345',
            isGold:true,
            phone:'123456789'
        })

        rental = new Rental({
            customer:{
                name:customer.name,
                phone:customer.phone,
                isGold:customer.isGold
            },
            movie:{
                title:movie.title,
                dailyRentalRate:movie.dailyRentalRate,
            }
        })
        await rental.save()
        await movie.save()
        await customer.save()
    })

    afterEach(async()=>{
        await Rental.remove({})
        await Movie.deleteMany({})
        await Customer.deleteMany({})
        await server.close()
    })

    describe('GET', () => {

        it('should return 401 if user not logged in', async () => {
            token=''
            const res=await request(server)
                .get('/api/rentals')
                .set('x-auth-token',token)
            expect(res.status).toBe(401)
        });

        it('should return all rentals', async () => {
            const res= await request(server)
                .get('/api/rentals')
                .set('x-auth-token',token)
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
            expect(res.body.some((r)=>r.movie.title==='123')).toBeTruthy()
        });
    });

    describe('GET/:id', () => {
        let id
        
        const exec=async()=>{
            return await request(server)
                .get('/api/rentals/'+id)
                .set('x-auth-token',token)
        }

        it('should return 401 if user not logged in', async () => {
            token=''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 404 if rental does not exists', async () => {
            id=mongoose.Types.ObjectId()
            const res = await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 on invalid id', async () => {
            id=1
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 and object if rental if valid', async () => {
            id=rental._id
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('movie.title', rental.movie.title)
        });

    });

    describe('POST', () => {
        let customerId, movieId
        const exec=async ()=>{
            return await request(server)
                .post('/api/rentals')
                .set('x-auth-token',token)
                .send({customerId, movieId})
        }

        beforeEach(()=>{
            customerId=customer._id
            movieId=movie._id
        })

        it('should return 401 if user is not logged in', async () => {
            token = ''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 400 on data input error', async () => {
            customerId='invalid'
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 404 if movie not registered', async () => {
            movieId=mongoose.Types.ObjectId()
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 if cx not in db', async () => {
            movieId=movie._id
            customerId=mongoose.Types.ObjectId()
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 400 if stock is 0', async () => {
            movie.numberInStock=0
            await movie.save()
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 200 on valid input and return object', async () => {
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('movie.title', movie.title)
        });

    });

    describe('DELETE', () => {
        let id

        

        const exec=async ()=>{
            return await request(server)
                .delete('/api/rentals/'+id)
                .set('x-auth-token',token)
                .send()
        }

        beforeEach(()=>{
            id=rental._id;
            token=new User({isAdmin:true}).generateAuthToken()
        })

        it('should return 401 on invalid auth', async () => {
            token=''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 403 if user is not admin', async () => {
            token= new User({isAdmin:false}).generateAuthToken()
            const res = await exec()
            expect(res.status).toBe(403)
        });

        it('should return 404 if rental does not exists', async () => {
            id=mongoose.Types.ObjectId();
            const res = await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 on valid input and return object', async () => {
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('movie.title',rental.movie.title)
        });

        it('should delete on valid input', async () => {
            await exec()
            const rentalInDB= await Rental.findById(id)            
            expect(rentalInDB).toBeNull()
        });
    });


});