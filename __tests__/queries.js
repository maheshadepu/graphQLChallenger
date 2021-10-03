/* __tests__/queries.js */
const { app} = require("../index");
const supertest = require("supertest");

const request = supertest(app);

afterEach(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

 
test("fetch properties without Authentication", async () => {
  await request
    .post("/graphql")
    .send({
      query: "{   listings(city: \"houston\") { address { state city } listPrice mlsId}}",
    })
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(200)
    .then(async(res) => {
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.errors[0].message).toEqual("User is not Authenticated");
    })

});

let headers = { 'authorization': "Basic c2ltcGx5cmV0czpzaW1wbHlyZXRz", 'accept': "application/json" };
test("fetch properties with Authentication", async () => {
  await request
    .post("/graphql")
    .auth("user1@sideinc.com", "676cfd34-e706-4cce-87ca-97f947c43bd4")
    .send({
      query: "{   listings(city: \"houston\") { address { state city } listPrice mlsId}}",
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then(async(res) => {
      expect(res.body).toBeInstanceOf(Object);
      console.log(res.body);
      expect(res.body.data.listings.length).toEqual(13);
      console.log(res.body.data.listings[0]);
      expect(res.body.data.listings[0].address.state).toEqual("Texas");
      expect(res.body.data.listings[0].address.city).toEqual("Houston");
    })

});