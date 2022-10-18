const request = require('supertest')
const {Movie}=require('../../../models/movies')
const mongoose = require('mongoose')
const {User}=require('../../../models/users')
const {Genre}= require('../../../models/genres')

describe('api/movies', () => {
    let server, movie1, genre

    
    beforeEach(async () => {
        server = require('../../../index');

        token = new User().generateAuthToken();

        genre = new Genre({ name: 'genre1' });
        await genre.save()

        movie1 = new Movie({
            title:'movie1',
            genre: genre,
            numberInStock:10,
            dailyRentalRate:2
        });
        await movie1.save()
    })

    afterEach(async()=>{
        await Movie.remove({})
        await Genre.remove({})
        await server.close()
    })

    describe('GET', () => {
        it('should return all movies', async () => {
            const res= await request(server)
                .get('/api/movies')
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
            expect(res.body.some((m)=>m.title==='movie1')).toBeTruthy()
        });
    });

    describe('GET/:id', () => {
        let id
        
        const exec=async()=>{
            return await request(server)
                .get('/api/movies/'+id)
        }

        it('should return 404 if movie does not exists', async () => {
            id=mongoose.Types.ObjectId()
            const res = await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 on invalid id', async () => {
            id=1
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 and object if movie if valid', async () => {
            id=movie1._id
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('title', movie1.title)
        });

    });

    describe('POST', () => {
        let numberInStock, dailyRentalRate
        const exec=async ()=>{
            return await request(server)
                .post('/api/movies')
                .set('x-auth-token',token)
                .send({title, genre, numberInStock,dailyRentalRate})
        }

        beforeEach(()=>{
            token=new User().generateAuthToken()
            title='MoviePost'
            genre= {name:'genre1'}
            numberInStock=10
            dailyRentalRate=2
        })

        it('should return 401 if user is not logged in', async () => {
            token = ''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 400 on data input error', async () => {
            genre='invalid'
            const res=await exec()
            expect(res.status).toBe(400)
        });

        // it('should return 200 on valid input', async () => {
        //     // genre._id=mongoose.Types.ObjectId()
        //     const res=await exec()
        //     expect(res.status).toBe(200)
        //     // expect(res.body).toHaveProperty('title','MoviePost')
        // });
    });
    


});
