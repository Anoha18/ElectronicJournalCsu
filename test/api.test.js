const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('Test api', () => {
  test('Test login controller', async (done) => {
    const user = {
      login: 'anoha',
      password: 'Olimpia-99',
      remember: false,
    };

    const result = await request
      .post('/login')
      .send(user);
    
    expect(result).toEqual(
      expect.objectContaining({
        user_id: expect.any(Number),
        name: expect.any(String),
        login: expect.any(String),
        journal_id: expect.any(Number),
        email: expect.any(String),
      })
    );

    done();
  })
});
