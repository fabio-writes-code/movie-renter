const { Rental } = require('../../../models/rentals');
const mongoose = require('mongoose');
const request = require('supertest');
const { User } = require('../../../models/users');
const moment = require('moment');
const { Movie } = require('../../../models/movies');

describe('/api/returns', () => {
    let server, customerId, movieId, rental, token, movie;

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    };

    // Load server and populate database
    beforeEach(async () => {
        server = require('../../../index');

        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345' },
            numberInStock: 10,
        });

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345678',
                isGold: true,
            },
            movie: {
                _id: movieId,
                title: movie.title,
                dailyRentalRate: movie.dailyRentalRate,
            },
        });

        await movie.save();
        await rental.save();
    });

    // Clean and unload server
    afterEach(async () => {
        await Rental.remove({});
        await Movie.remove({});
        await server.close();
    });

    it('should work', async () => {
        const result = await Rental.findById(rental._id);
        expect(result).not.toBeNull();
    });

    it('should return 401 if client is not logged in', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
        customerId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
        movieId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental under movieId and customerId', async () => {
        await Rental.deleteMany({});
        const res = await exec();
        expect(res.status).toBe(404);
    });

    it('should return 400 if rental has been processed already', async () => {
        rental.dayReturned = new Date();
        await rental.save();
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 200 if request is valid', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });

    it('should set date to current date if request is valid', async () => {
        await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dayReturned;
        expect(rentalInDb.dayReturned).toBeDefined();
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should calculate the rental fee', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        await exec();
        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.rentalFee).toBeDefined();
        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('should increase movie stock upon return', async () => {
        await exec();
        const movieInDB = await Movie.findById(movie._id);
        expect(movieInDB.numberInStock).toBe(11);
    });

    it('should return the return summany', async () => {
        const res = await exec();

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                'dateOut',
                'dayReturned',
                'rentalFee',
                'customer',
                'movie',
            ])
        );
    });
});

//****----****/

// *Possible test cases:
/**
 * return 401 if client is not logged in
 * return 400 if customerId is not provided
 * return 400 if movieId is not provided
 * return 404 if no rental for customerId+movieId
 * return 400 if customerId and movieId rental has already been processed
 * return 200 i return is valid
 * Set return date
 * Calculate rental fee
 * Increase movie stock
 * return rental summary
 */