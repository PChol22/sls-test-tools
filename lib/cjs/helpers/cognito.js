"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUnauthenticatedUser = exports.createAuthenticatedUser = void 0;

var _general = require("./general");

var _chance = require("chance");

var _jsonSchemaFaker = _interopRequireDefault(require("json-schema-faker"));

const createUser = async (createUserInput, username) => {
  const cognitoClient = new _general.AWSClient.CognitoIdentityServiceProvider();
  const chance = new _chance.Chance();
  const password = chance.string({
    length: 8
  });
  const givenName = chance.first();
  const middleName = chance.first();
  const familyName = chance.last();
  const name = givenName + " " + middleName + " " + familyName;
  const country = chance.country();
  const streetAddress = chance.street();
  const locality = chance.city();
  const region = chance.province();
  const postalCode = chance.postcode();
  const formatted = [streetAddress, locality, region, postalCode, country].join("\r\n");
  const address = {
    formatted: formatted,
    street_address: streetAddress,
    locality: locality,
    region: region,
    postal_code: postalCode,
    country: country
  };
  const allStandardAttributes = {
    email: chance.email(),
    birthdate: chance.date().toISOString().split("T")[0],
    family_name: familyName,
    gender: chance.gender(),
    given_name: givenName,
    locale: chance.locale(),
    middle_name: middleName,
    name: name,
    nickname: chance.string(),
    phone_number: chance.phone(),
    picture: chance.url(),
    preferred_username: chance.string(),
    profile: chance.url(),
    website: chance.url(),
    zoneinfo: chance.string(),
    address: JSON.stringify(address),
    updated_at: String(chance.timestamp())
  };
  const attributesArg = [];

  _jsonSchemaFaker.default.extend("chance", () => new _chance.Chance());

  if (createUserInput.customAttributes !== undefined) {
    Object.entries(createUserInput.customAttributes).forEach(([key, val]) => {
      attributesArg.push({
        Name: "custom:" + key,
        Value: _jsonSchemaFaker.default.generate({
          type: val
        })
      });
    });
  }

  createUserInput.standardAttributes?.forEach(attribute => {
    attributesArg.push({
      Name: attribute,
      Value: allStandardAttributes[attribute]
    });
  });

  try {
    const signUpParams = {
      ClientId: createUserInput.clientId,
      Username: username,
      Password: password,
      UserAttributes: attributesArg
    };
    await cognitoClient.signUp(signUpParams).promise();
  } catch (e) {
    console.log(e);
    console.error("Failed to create user. Please make sure the clientId is correct, and that the username is valid.");
  }

  return {
    username,
    password
  };
};

const confirmUser = async input => {
  const cognitoClient = new _general.AWSClient.CognitoIdentityServiceProvider();

  try {
    await cognitoClient.adminConfirmSignUp({
      UserPoolId: input.userPoolId,
      Username: input.username
    }).promise();
  } catch (e) {
    console.error("Failed to confirm sign up. Please make sure the user exists.");
    throw e;
  }

  return {
    username: input.username,
    password: input.password,
    confirmed: true
  };
};

const createUnauthenticatedUser = async input => {
  const chance = new _chance.Chance();
  const username = chance.email();
  const user = await createUser(input, username);

  if (input.confirmed) {
    return await confirmUser({
      userPoolId: input.userPoolId,
      username: username,
      password: user.password
    });
  }

  return {
    username: username,
    password: user.password,
    confirmed: input.confirmed
  };
};

exports.createUnauthenticatedUser = createUnauthenticatedUser;

const createAuthenticatedUser = async input => {
  const cognitoClient = new _general.AWSClient.CognitoIdentityServiceProvider();
  const chance = new _chance.Chance();
  const username = chance.email();
  const user = await createUser(input, username);
  await confirmUser({
    userPoolId: input.userPoolId,
    username: username,
    password: user.password
  });

  try {
    const auth = await cognitoClient.initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: input.clientId,
      AuthParameters: {
        USERNAME: user.username,
        PASSWORD: user.password
      }
    }).promise();
    return {
      username,
      password: user.password,
      idToken: auth.AuthenticationResult?.IdToken,
      accessToken: auth.AuthenticationResult?.AccessToken
    };
  } catch (e) {
    console.error("Failed to authorize user - please make sure you're using the correct AuthFlow and that the user exists, and is confirmed.");
    throw e;
  }
};

exports.createAuthenticatedUser = createAuthenticatedUser;
//# sourceMappingURL=cognito.js.map