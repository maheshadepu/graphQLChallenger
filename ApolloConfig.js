const { gql, AuthenticationError } = require("apollo-server-express");
const { RESTDataSource } = require("apollo-datasource-rest");
const { encode, decode } = require("js-base64");



const typeDefs = gql`
  type Listing {
    favoriteCount: Int
    privateRemarks: String
    showingContactName: String
    mlsId: Int
    showingContactPhone: String
    terms: String
    showingInstructions: String
    leaseTerm: String
    disclaimer: String
    originalListPrice: String
    agreement: String
    listDate: String
    modified: String
    listPrice: Int
    internetAddressDisplay: String
    listingId: String
    internetEntireListingDisplay: String
    leaseType: String
    virtualTourUrl: String
    remarks: String
    association: Association
    sales: Sales
    coAgent: CoAgent
    tax: Tax
    geo: Geo
    mls: Mls
    photos: [String]
    school: School
    agent: Agent
    address: Address
    office: Office
    property: Property
  }

  type Association {
    frequency: String
    fee: Int
    name: String
    amenities: String
  }

  type Agent {
    lastName: String
    contact: String
    address: String
    firstName: String
    id: String
  }

  type Office {
    contact: String
    name: String
    servingName: String
    brokerid: String
  }

  type Sales {
    closeDate: String
    closePrice: Int
    contractDate: String
    agent: Agent
    office: Office
  }

  type CoAgent {
    lastName: String
    contact: String
    address: String
    firstName: String
    id: String
  }

  type Tax {
    taxYear: Int
    taxAnnualAmount: Int
    id: String
  }

  type Geo {
    county: String
    lat: Float
    lng: Float
    marketArea: String
    directions: String
  }

  type Mls {
    status: String
    area: String
    daysOnMarket: Int
    originalEntryTimestamp: String
    originatingSystemName: String
    statusText: String
    areaMinor: String
  }

  type School {
    middleSchool: String
    highSchool: String
    elementarySchool: String
    district: String
  }

  type Address {
    crossStreet: String
    state: String
    country: String
    postalCode: String
    streetName: String
    streetNumberText: String
    city: String
    streetNumber: Int
    full: String
    unit: String
  }

  type Parking {
    leased: String
    spaces: Int
    description: String
  }

  type Property {
    roof: String
    cooling: String
    style: String
    area: Int
    bathsFull: Int
    bathsHalf: Int
    stories: Int
    fireplaces: Int
    flooring: String
    heating: String
    bathrooms: String
    foundation: String
    laundryFeatures: String
    occupantName: String
    ownerName: String
    lotDescription: String
    pool: String
    subType: String
    bedrooms: Int
    interiorFeatures: String
    lotSize: String
    areaSource: String
    maintenanceExpense: String
    additionalRooms: String
    exteriorFeatures: String
    water: String
    view: String
    lotSizeArea: String
    subdivision: String
    construction: String
    lotSizeAreaUnits: String
    type: String
    garageSpaces: Float
    bathsThreeQuarter: String
    accessibility: String
    acres: String
    occupantType: String
    subTypeText: String
    yearBuilt: Int
    parking: Parking
  }
  type Query {
    listings(city: String): [Listing]
  }
`;


const resolvers = {
  Query: {
    listings: async (_, args, { dataSources }) => {
      const retsAPI = dataSources.simplyRETS;
      if (!retsAPI.context.isAuth) {
        throw new AuthenticationError("User is not Authenticated");
      }
      const { city } = args;

      list = await retsAPI.getListings(city);
      return list;
    },
  },
};

class SimplyRETSWrapper extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.simplyrets.com/";
  }

  //pass base64 generated basic authorization token
  willSendRequest(request) {
    request.headers.set("Authorization", "Basic c2ltcGx5cmV0czpzaW1wbHlyZXRz");
  }
  
  async getListings(city) {
    if (!!city) {
      return this.get(`properties?q=${city}`);
    }
    else {
      return this.get(`properties`);
    }
  }
}

const Auth = (request) => {
  const header = request.req.headers.authorization;

  // not found
  if (!header) return { isAuth: false };

  // token
  const token = header.split(" ");

  // token not found
  if (!token) return { isAuth: false };

  let email;

  try {
    email = decode(token[1]).split(":")[0];
  } catch (err) {
    return { isAuth: false };
  }

  // in case any error found
  if (!!!email) return { isAuth: false };

  // token decoded successfully and extracted data
  if (email !== "user1@sideinc.com") {
    return { isAuth: false };
  }

  return { isAuth: true, email };
};

const apolloConfig = {
  typeDefs,
  resolvers,
  context: Auth,
  dataSources: () => {
    return {
      simplyRETS: new SimplyRETSWrapper(),
    };
  },
  plugins: [
    {
      requestDidStart: () => ({
        willSendResponse({ errors, response }) {
          if (response && response.http) {
            if (
              errors &&
              errors.some(
                (err) => err.name === 'AuthenticationError' || err.message === 'Response not successful: Received status code 401'
              )
            ) {
              response.data = undefined;
              response.http.status = 401;
            }
          }
        },
      }),
    }
  ],
};

module.exports = apolloConfig;
